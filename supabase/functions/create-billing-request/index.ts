// Edge Function: Create Billing Request
// This function initiates the GoCardless Direct Debit setup flow
// It creates a customer (if needed) and a billing request with mandate + initial payment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createSupabaseClient,
  verifyAuth,
  corsHeaders,
} from "../_shared/supabase.ts";
import {
  goCardlessRequest,
  validateAmount,
  GOCARDLESS_CONFIG,
} from "../_shared/gocardless.ts";

interface CreateBillingRequestBody {
  monthly_amount: number; // Amount in pence
}

interface GoCardlessCustomer {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
}

interface BillingRequestResponse {
  billing_requests: {
    id: string;
    status: string;
  };
}

interface BillingRequestFlowResponse {
  billing_request_flows: {
    id: string;
    authorisation_url: string;
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
    const { monthly_amount }: CreateBillingRequestBody = await req.json();

    // Validate amount
    if (!validateAmount(monthly_amount)) {
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

    // Initialize Supabase client
    const supabase = createSupabaseClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name, gocardless_customer_id, mandate_status")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "User profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already has an active mandate
    if (profile.mandate_status === "active") {
      return new Response(
        JSON.stringify({
          error:
            "You already have an active Direct Debit. Please cancel it first to set up a new one.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let customerId = profile.gocardless_customer_id;

    // Create GoCardless customer if doesn't exist
    if (!customerId) {
      console.log("Creating new GoCardless customer for user:", userId);

      // Split full name into given_name and family_name
      const nameParts = (profile.full_name || "").trim().split(" ");
      const givenName = nameParts[0] || "Customer";
      const familyName = nameParts.slice(1).join(" ") || "";

      const customerResponse = await goCardlessRequest<{
        customers: GoCardlessCustomer;
      }>("/customers", {
        method: "POST",
        body: JSON.stringify({
          customers: {
            email: profile.email,
            given_name: givenName,
            family_name: familyName,
            metadata: {
              treatcode_user_id: userId,
            },
          },
        }),
      });

      customerId = customerResponse.customers.id;

      // Save customer ID to profile
      await supabase
        .from("profiles")
        .update({ gocardless_customer_id: customerId })
        .eq("id", userId);

      console.log("Created GoCardless customer:", customerId);
    }

    // Create Billing Request with mandate and initial payment
    console.log("Creating billing request for customer:", customerId);

    const billingRequestResponse =
      await goCardlessRequest<BillingRequestResponse>("/billing_requests", {
        method: "POST",
        body: JSON.stringify({
          billing_requests: {
            mandate_request: {
              scheme: GOCARDLESS_CONFIG.SCHEME,
              verify: "when_available",
            },
            payment_request: {
              description: "Treatcode initial deposit",
              amount: monthly_amount,
              currency: GOCARDLESS_CONFIG.CURRENCY,
              // Note: scheme is NOT included here - it's inherited from mandate_request
              // Including it causes a 422 validation error from GoCardless
            },
            links: {
              customer: customerId,
            },
          },
        }),
      });

    const billingRequestId = billingRequestResponse.billing_requests.id;
    console.log("Created billing request:", billingRequestId);

    // Create Billing Request Flow (generates the authorization URL)
    const flowResponse = await goCardlessRequest<BillingRequestFlowResponse>(
      "/billing_request_flows",
      {
        method: "POST",
        body: JSON.stringify({
          billing_request_flows: {
            redirect_uri: `${req.headers.get("origin") || "http://localhost:5173"}/dashboard?dd_setup=complete`,
            exit_uri: `${req.headers.get("origin") || "http://localhost:5173"}/dashboard?dd_setup=cancelled`,
            links: {
              billing_request: billingRequestId,
            },
          },
        }),
      },
    );

    const authorisationUrl =
      flowResponse.billing_request_flows.authorisation_url;
    const flowId = flowResponse.billing_request_flows.id;

    console.log("Created billing request flow:", flowId);

    // Store the pending setup in direct_debit_settings
    const { error: settingsError } = await supabase
      .from("direct_debit_settings")
      .upsert(
        {
          user_id: userId,
          monthly_amount,
          collection_day: GOCARDLESS_CONFIG.DEFAULT_COLLECTION_DAY,
          active: false, // Will be activated when mandate is confirmed
        },
        {
          onConflict: "user_id",
        },
      );

    if (settingsError) {
      console.error("Error saving DD settings:", settingsError);
    }

    // Update profile mandate status to pending
    await supabase
      .from("profiles")
      .update({ mandate_status: "pending" })
      .eq("id", userId);

    // Return the authorization URL to the frontend
    return new Response(
      JSON.stringify({
        success: true,
        authorisation_url: authorisationUrl,
        billing_request_id: billingRequestId,
        flow_id: flowId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in create-billing-request:", error);
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
