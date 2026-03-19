// Edge Function: Cancel Redemption (Admin only)
// Admin cancels a pending redemption and refunds the balance to the user.
// Sends a cancellation email to the user.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createSupabaseClient,
  verifyAuth,
  corsHeaders,
} from "../_shared/supabase.ts";
import {
  sendEmail,
  buildRedemptionCancelledEmail,
} from "../_shared/email.ts";

interface CancelRedemptionBody {
  redemption_id: string;
  cancellation_reason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const userId = await verifyAuth(req.headers.get("Authorization"));
    const supabase = createSupabaseClient();

    // Verify admin
    const { data: adminProfile, error: adminError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (adminError || !adminProfile?.is_admin) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { redemption_id, cancellation_reason }: CancelRedemptionBody =
      await req.json();

    if (!redemption_id) {
      return new Response(
        JSON.stringify({ error: "redemption_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Fetch the redemption
    const { data: redemption, error: fetchError } = await supabase
      .from("redemptions")
      .select("*")
      .eq("id", redemption_id)
      .single();

    if (fetchError || !redemption) {
      return new Response(
        JSON.stringify({ error: "Redemption not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (redemption.status !== "pending") {
      return new Response(
        JSON.stringify({
          error: `Redemption is already ${redemption.status}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Mark as cancelled — WHERE status='pending' prevents double-processing
    const { data: cancelled, error: cancelError } = await supabase
      .from("redemptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: cancellation_reason?.trim() || null,
      })
      .eq("id", redemption_id)
      .eq("status", "pending")
      .select()
      .single();

    if (cancelError || !cancelled) {
      console.error("Cancellation update failed:", cancelError);
      return new Response(
        JSON.stringify({
          error: "Could not cancel redemption — it may have already been processed",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Refund balance to user's account
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("user_id", redemption.user_id)
      .single();

    if (accountError || !account) {
      console.error("Account not found for refund:", redemption.user_id);
      throw new Error("Account not found — could not refund balance");
    }

    const refundedBalance = Number(account.balance) + Number(redemption.amount);

    const { error: refundError } = await supabase
      .from("accounts")
      .update({ balance: refundedBalance })
      .eq("id", account.id);

    if (refundError) {
      console.error("Refund failed:", refundError);
      throw new Error("Failed to refund balance");
    }

    // Create refund transaction record (account_id = user_id per codebase convention)
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        account_id: redemption.user_id,
        amount: redemption.amount,
        type: "credit",
        description: `Refund: cancelled ${redemption.brand_name} voucher request`,
        redemption_id: redemption.id,
      });

    if (transactionError) {
      console.error("Error creating refund transaction:", transactionError);
      // Non-fatal — balance is already refunded
    }

    // Notify user by email (non-blocking)
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", redemption.user_id)
      .single();

    if (userProfile?.email) {
      try {
        await sendEmail({
          to: userProfile.email,
          subject: `Your ${redemption.brand_name} voucher request has been cancelled`,
          html: buildRedemptionCancelledEmail({
            userName: userProfile.full_name || "there",
            brandName: redemption.brand_name,
            amount: redemption.amount,
            reason: cancellation_reason?.trim() || null,
          }),
        });
      } catch (emailError) {
        console.error(
          `Cancellation email failed for redemption ${redemption_id}:`,
          emailError,
        );
        // Non-fatal
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        refunded_amount: redemption.amount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in cancel-redemption:", error);
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
