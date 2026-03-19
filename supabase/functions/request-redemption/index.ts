// Edge Function: Request Redemption
// User redeems Treatcode balance for a brand voucher.
// Deducts balance immediately and creates a pending redemption record.
// Admin is notified by email to source and fulfil the code.
//
// FUTURE PHASE: Tillo integration
// When TILLO_API_KEY is set in environment, call the Tillo orders API here
// instead of creating a pending request for manual admin fulfilment.
// brand_slug maps directly to Tillo retailer IDs — no migration needed.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createSupabaseClient,
  verifyAuth,
  corsHeaders,
} from "../_shared/supabase.ts";
import {
  sendEmail,
  buildAdminNotificationEmail,
} from "../_shared/email.ts";

// Allowed brand slugs — must match the frontend BRANDS catalog exactly.
// Server-side validation prevents arbitrary amounts or brands being submitted.
const VALID_BRAND_SLUGS = [
  "asos",
  "nike",
  "zara",
  "amazon",
  "apple",
  "sephora",
  "adidas",
  "hm",
];

interface RequestRedemptionBody {
  brand_name: string;
  brand_slug: string;
  amount: number; // in pence
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const userId = await verifyAuth(req.headers.get("Authorization"));
    const { brand_name, brand_slug, amount }: RequestRedemptionBody =
      await req.json();

    // Validate inputs
    if (!brand_slug || !VALID_BRAND_SLUGS.includes(brand_slug)) {
      return new Response(
        JSON.stringify({ error: "Invalid brand" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!amount || !Number.isInteger(amount) || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!brand_name || typeof brand_name !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid brand name" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createSupabaseClient();

    // Fetch current balance
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("user_id", userId)
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: "Account not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (Number(account.balance) < amount) {
      return new Response(
        JSON.stringify({ error: "Insufficient balance" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const newBalance = Number(account.balance) - amount;

    // Deduct balance
    const { error: balanceError } = await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", account.id)
      .eq("balance", account.balance); // optimistic lock — prevents race condition

    if (balanceError) {
      console.error("Balance update failed:", balanceError);
      return new Response(
        JSON.stringify({
          error: "Could not process redemption — please try again",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create redemption record
    const { data: redemption, error: redemptionError } = await supabase
      .from("redemptions")
      .insert({
        user_id: userId,
        brand_name,
        brand_slug,
        amount,
        status: "pending",
      })
      .select()
      .single();

    if (redemptionError || !redemption) {
      // Attempt to refund balance before throwing
      await supabase
        .from("accounts")
        .update({ balance: Number(account.balance) })
        .eq("id", account.id);
      console.error("Error creating redemption:", redemptionError);
      throw new Error("Failed to create redemption record");
    }

    // Create transaction record (account_id = user_id per codebase convention)
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        account_id: userId,
        amount,
        type: "voucher_redemption",
        description: `Voucher request: £${(amount / 100).toFixed(2)} ${brand_name}`,
        redemption_id: redemption.id,
      });

    if (transactionError) {
      console.error("Error creating transaction record:", transactionError);
      // Non-fatal — redemption and balance are correct
    }

    // Notify admin by email (non-blocking)
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    if (adminEmail) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .single();

      try {
        await sendEmail({
          to: adminEmail,
          subject: `New Treatcode Request: £${(amount / 100).toFixed(2)} ${brand_name}`,
          html: buildAdminNotificationEmail({
            userName: profile?.full_name || "Unknown",
            userEmail: profile?.email || "Unknown",
            brandName: brand_name,
            amount,
          }),
        });
      } catch (emailError) {
        console.error("Admin notification email failed:", emailError);
        // Non-fatal — redemption is committed
      }
    } else {
      console.warn("ADMIN_EMAIL not set — skipping admin notification");
    }

    return new Response(
      JSON.stringify({
        success: true,
        redemption_id: redemption.id,
        new_balance: newBalance,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in request-redemption:", error);
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
