// Edge Function: Fulfill Redemption (Admin only)
// Admin enters the voucher code for a pending redemption.
// Updates redemption status to 'fulfilled' and emails the user.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createSupabaseClient,
  verifyAuth,
  corsHeaders,
} from "../_shared/supabase.ts";
import {
  sendEmail,
  buildVoucherReadyEmail,
} from "../_shared/email.ts";

interface FulfillRedemptionBody {
  redemption_id: string;
  voucher_code: string;
  voucher_instructions?: string;
  admin_notes?: string;
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

    const {
      redemption_id,
      voucher_code,
      voucher_instructions,
      admin_notes,
    }: FulfillRedemptionBody = await req.json();

    if (!redemption_id || !voucher_code?.trim()) {
      return new Response(
        JSON.stringify({ error: "redemption_id and voucher_code are required" }),
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

    // Mark as fulfilled — WHERE status='pending' prevents double-fulfillment
    const { data: updated, error: updateError } = await supabase
      .from("redemptions")
      .update({
        status: "fulfilled",
        voucher_code: voucher_code.trim(),
        voucher_instructions: voucher_instructions?.trim() || null,
        admin_notes: admin_notes?.trim() || null,
        fulfilled_at: new Date().toISOString(),
      })
      .eq("id", redemption_id)
      .eq("status", "pending")
      .select()
      .single();

    if (updateError || !updated) {
      console.error("Fulfillment update failed:", updateError);
      return new Response(
        JSON.stringify({
          error: "Redemption could not be fulfilled — it may have already been processed",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Fetch user profile for email
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", redemption.user_id)
      .single();

    // Send email notification to user (non-blocking — redemption already committed)
    if (userProfile?.email) {
      try {
        await sendEmail({
          to: userProfile.email,
          subject: `Your ${redemption.brand_name} voucher is ready!`,
          html: buildVoucherReadyEmail({
            userName: userProfile.full_name || "there",
            brandName: redemption.brand_name,
            amount: redemption.amount,
            voucherCode: voucher_code.trim(),
            instructions: voucher_instructions?.trim() || null,
          }),
        });
      } catch (emailError) {
        console.error(
          `Email failed for redemption ${redemption_id}, user ${redemption.user_id}:`,
          emailError,
        );
        // Do NOT re-throw — redemption is already committed
      }
    } else {
      console.warn(
        `No email address found for user ${redemption.user_id} — skipping notification`,
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Redemption fulfilled and user notified",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in fulfill-redemption:", error);
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
