// Edge Function: Manage Subscription
// Handles subscription operations: update amount, cancel, get details

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createSupabaseClient,
  verifyAuth,
  corsHeaders,
  type SupabaseClientType,
} from "../_shared/supabase.ts";
import {
  goCardlessRequest,
  validateAmount,
  GOCARDLESS_CONFIG,
} from "../_shared/gocardless.ts";

interface ManageSubscriptionBody {
  action: "update" | "cancel" | "get_details";
  new_amount?: number; // For update action
}

interface GoCardlessSubscription {
  subscriptions: {
    id: string;
    status: string;
    amount: number;
    // Add other fields as needed
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const userId = await verifyAuth(req.headers.get("Authorization"));

    // Parse request body
    const { action, new_amount }: ManageSubscriptionBody = await req.json();

    // Initialize Supabase client
    const supabase = createSupabaseClient();

    // Get user's DD settings
    const { data: ddSettings, error: settingsError } = await supabase
      .from("direct_debit_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (settingsError || !ddSettings) {
      return new Response(
        JSON.stringify({ error: "No active Direct Debit found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!ddSettings.gocardless_subscription_id) {
      return new Response(
        JSON.stringify({ error: "No subscription ID found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const subscriptionId = ddSettings.gocardless_subscription_id;

    // Handle different actions
    switch (action) {
      case "get_details":
        return await getSubscriptionDetails(subscriptionId);

      case "update":
        if (!new_amount) {
          return new Response(
            JSON.stringify({
              error: "new_amount is required for update action",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        return await updateSubscriptionAmount(
          subscriptionId,
          new_amount,
          userId,
          supabase,
        );

      case "cancel":
        return await cancelSubscription(subscriptionId, userId, supabase);

      default:
        return new Response(
          JSON.stringify({
            error: "Invalid action. Must be: get_details, update, or cancel",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
    }
  } catch (error) {
    console.error("Error in manage-subscription:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

/**
 * Get subscription details from GoCardless
 */
async function getSubscriptionDetails(subscriptionId: string) {
  const response = await goCardlessRequest<GoCardlessSubscription>(
    `/subscriptions/${subscriptionId}`,
    { method: "GET" },
  );

  return new Response(
    JSON.stringify({
      success: true,
      subscription: response.subscriptions,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

/**
 * Update subscription amount
 */
async function updateSubscriptionAmount(
  subscriptionId: string,
  newAmount: number,
  userId: string,
  supabase: SupabaseClientType,
) {
  // Validate new amount
  if (!validateAmount(newAmount)) {
    return new Response(
      JSON.stringify({
        error: `Amount must be between £${GOCARDLESS_CONFIG.MIN_AMOUNT / 100} and £${GOCARDLESS_CONFIG.MAX_AMOUNT / 100}`,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Update subscription in GoCardless
  const response = await goCardlessRequest<GoCardlessSubscription>(
    `/subscriptions/${subscriptionId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        subscriptions: {
          amount: newAmount,
        },
      }),
    },
  );

  // Update in database
  const { error: updateError } = await supabase
    .from("direct_debit_settings")
    .update({ monthly_amount: newAmount })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Error updating DD settings:", updateError);
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Subscription amount updated successfully",
      subscription: response.subscriptions,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

/**
 * Cancel subscription and mandate
 */
async function cancelSubscription(
  subscriptionId: string,
  userId: string,
  supabase: SupabaseClientType,
) {
  // Get mandate ID from profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("gocardless_mandate_id")
    .eq("id", userId)
    .single();

  if (profileError || !profile?.gocardless_mandate_id) {
    throw new Error("Mandate not found");
  }

  const mandateId = profile.gocardless_mandate_id;

  // Cancel subscription in GoCardless
  await goCardlessRequest<Record<string, unknown>>(
    `/subscriptions/${subscriptionId}/actions/cancel`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  console.log(`Cancelled subscription: ${subscriptionId}`);

  // Cancel mandate in GoCardless
  await goCardlessRequest<Record<string, unknown>>(
    `/mandates/${mandateId}/actions/cancel`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  console.log(`Cancelled mandate: ${mandateId}`);

  // Update database
  await supabase
    .from("profiles")
    .update({ mandate_status: "cancelled" })
    .eq("id", userId);

  await supabase
    .from("direct_debit_settings")
    .update({ active: false })
    .eq("user_id", userId);

  return new Response(
    JSON.stringify({
      success: true,
      message: "Direct Debit cancelled successfully",
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
