// Edge Function: GoCardless Webhook Handler
// This function receives and processes webhook events from GoCardless
// Critical for payment confirmations, failures, and mandate updates

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createSupabaseClient,
  corsHeaders,
  type SupabaseClientType,
} from "../_shared/supabase.ts";
import { verifyWebhookSignature } from "../_shared/gocardless.ts";

interface WebhookEvent {
  id: string;
  created_at: string;
  resource_type: string;
  action: string;
  links: {
    [key: string]: string;
  };
  details?: {
    origin?: string;
    cause?: string;
    description?: string;
    scheme?: string;
    reason_code?: string;
  };
}

interface WebhookPayload {
  events: WebhookEvent[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get raw request body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("Webhook-signature");

    if (!signature) {
      console.error("Missing webhook signature");
      return new Response("Missing signature", { status: 401 });
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 498 });
    }

    // Parse the webhook payload
    const payload: WebhookPayload = JSON.parse(rawBody);
    console.log(`Received ${payload.events.length} webhook events`);

    // Initialize Supabase client
    const supabase = createSupabaseClient();

    // Process each event
    for (const event of payload.events) {
      await processEvent(event, supabase);
    }

    // Always return 200 to acknowledge receipt
    return new Response(
      JSON.stringify({ received: true, processed: payload.events.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Still return 200 to prevent GoCardless from retrying
    // Log the error for manual investigation
    return new Response(
      JSON.stringify({
        received: true,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});

/**
 * Process individual webhook event
 */
async function processEvent(event: WebhookEvent, supabase: SupabaseClientType) {
  console.log(
    `Processing event: ${event.id} - ${event.resource_type}.${event.action}`,
  );

  try {
    // Store event in audit table (idempotent - will fail on duplicate event_id)
    const { error: insertError } = await supabase
      .from("gocardless_events")
      .insert({
        event_id: event.id,
        event_type: event.resource_type,
        action: event.action,
        resource_type: event.resource_type,
        resource_id: event.links[event.resource_type] || "",
        payload: event,
        processed: false,
      });

    // If insert fails due to duplicate, event already processed
    if (insertError?.code === "23505") {
      console.log(`Event ${event.id} already processed, skipping`);
      return;
    }

    // Route to appropriate handler based on resource type and action
    const eventKey = `${event.resource_type}.${event.action}`;

    switch (eventKey) {
      case "payments.confirmed":
        await handlePaymentConfirmed(event, supabase);
        break;

      case "payments.paid_out":
        await handlePaymentPaidOut(event, supabase);
        break;

      case "payments.failed":
        await handlePaymentFailed(event, supabase);
        break;

      case "payments.cancelled":
        await handlePaymentCancelled(event, supabase);
        break;

      case "mandates.cancelled":
        await handleMandateCancelled(event, supabase);
        break;

      case "mandates.expired":
        await handleMandateExpired(event, supabase);
        break;

      case "mandates.active":
        await handleMandateActive(event, supabase);
        break;

      case "subscriptions.cancelled":
        await handleSubscriptionCancelled(event, supabase);
        break;

      case "payments.created":
        await handlePaymentCreated(event, supabase);
        break;

      default:
        console.log(`No handler for event: ${eventKey}`);
    }

    // Mark event as processed
    await supabase
      .from("gocardless_events")
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq("event_id", event.id);
  } catch (error) {
    console.error(`Error processing event ${event.id}:`, error);

    // Store error in events table
    await supabase
      .from("gocardless_events")
      .update({
        error: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("event_id", event.id);
  }
}

/**
 * Handler: Payment Created
 * A new payment has been created (monthly subscription payment)
 */
async function handlePaymentCreated(
  event: WebhookEvent,
  _supabase: SupabaseClientType,
) {
  const paymentId = event.links.payment;

  console.log(`Payment created: ${paymentId}`);

  // We'll create the deposit record when it's confirmed, not just created
  // This is just for logging purposes
}

/**
 * Handler: Payment Confirmed
 * Payment successfully collected from customer's bank account
 */
async function handlePaymentConfirmed(
  event: WebhookEvent,
  supabase: SupabaseClientType,
) {
  const paymentId = event.links.payment;

  console.log(`Payment confirmed: ${paymentId}`);

  // Update existing deposit record
  const { error } = await supabase
    .from("deposits")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .eq("gocardless_payment_id", paymentId);

  if (error) {
    console.error("Error updating deposit to confirmed:", error);
  }
}

/**
 * Handler: Payment Paid Out
 * Payment has been settled to merchant account
 * THIS IS WHERE WE ADD FUNDS TO USER'S TREATCODE BALANCE
 */
async function handlePaymentPaidOut(
  event: WebhookEvent,
  supabase: SupabaseClientType,
) {
  const paymentId = event.links.payment;

  console.log(`Payment paid out: ${paymentId}`);

  // Get deposit record
  const { data: deposit, error: depositError } = await supabase
    .from("deposits")
    .select("id, user_id, amount, status")
    .eq("gocardless_payment_id", paymentId)
    .single();

  if (depositError || !deposit) {
    console.error("Deposit not found for payment:", paymentId);
    return;
  }

  // Prevent double-crediting
  if (deposit.status === "paid_out") {
    console.log("Deposit already marked as paid_out, skipping");
    return;
  }

  // Begin transaction to update deposit and credit balance
  // Update deposit status
  const { error: updateError } = await supabase
    .from("deposits")
    .update({
      status: "paid_out",
      paid_out_at: new Date().toISOString(),
    })
    .eq("id", deposit.id);

  if (updateError) {
    console.error("Error updating deposit:", updateError);
    throw updateError;
  }

  // Credit user's account balance
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id, balance")
    .eq("user_id", deposit.user_id)
    .single();

  if (accountError || !account) {
    console.error("Account not found for user:", deposit.user_id);
    throw new Error("Account not found");
  }

  // Update balance
  const newBalance = Number(account.balance) + Number(deposit.amount);

  const { error: balanceError } = await supabase
    .from("accounts")
    .update({ balance: newBalance })
    .eq("id", account.id);

  if (balanceError) {
    console.error("Error updating balance:", balanceError);
    throw balanceError;
  }

  // Create transaction record
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert({
      account_id: deposit.user_id,
      amount: deposit.amount,
      type: "credit",
      description: `Direct Debit deposit - £${(deposit.amount / 100).toFixed(2)}`,
      gocardless_payment_id: paymentId,
    });

  if (transactionError) {
    console.error("Error creating transaction:", transactionError);
  }

  console.log(`Credited £${deposit.amount / 100} to user ${deposit.user_id}`);
}

/**
 * Handler: Payment Failed
 * Payment failed (insufficient funds, etc.)
 */
async function handlePaymentFailed(
  event: WebhookEvent,
  supabase: SupabaseClientType,
) {
  const paymentId = event.links.payment;
  const failureReason = event.details?.description || "Payment failed";

  console.log(`Payment failed: ${paymentId} - ${failureReason}`);

  const { error } = await supabase
    .from("deposits")
    .update({
      status: "failed",
      failure_reason: failureReason,
    })
    .eq("gocardless_payment_id", paymentId);

  if (error) {
    console.error("Error updating failed deposit:", error);
  }

  // TODO: Send email notification to user about failed payment
}

/**
 * Handler: Payment Cancelled
 */
async function handlePaymentCancelled(
  event: WebhookEvent,
  supabase: SupabaseClientType,
) {
  const paymentId = event.links.payment;

  console.log(`Payment cancelled: ${paymentId}`);

  const { error } = await supabase
    .from("deposits")
    .update({ status: "cancelled" })
    .eq("gocardless_payment_id", paymentId);

  if (error) {
    console.error("Error updating cancelled deposit:", error);
  }
}

/**
 * Handler: Mandate Cancelled
 * User cancelled their Direct Debit mandate
 */
async function handleMandateCancelled(
  event: WebhookEvent,
  supabase: SupabaseClientType,
) {
  const mandateId = event.links.mandate;

  console.log(`Mandate cancelled: ${mandateId}`);

  // Update profile mandate status
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ mandate_status: "cancelled" })
    .eq("gocardless_mandate_id", mandateId);

  if (profileError) {
    console.error("Error updating profile mandate status:", profileError);
  }

  // Deactivate DD settings
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("gocardless_mandate_id", mandateId)
    .single();

  if (profile) {
    await supabase
      .from("direct_debit_settings")
      .update({ active: false })
      .eq("user_id", profile.id);
  }

  // TODO: Send email notification to user
}

/**
 * Handler: Mandate Expired
 */
async function handleMandateExpired(
  event: WebhookEvent,
  supabase: SupabaseClientType,
) {
  const mandateId = event.links.mandate;

  console.log(`Mandate expired: ${mandateId}`);

  const { error } = await supabase
    .from("profiles")
    .update({ mandate_status: "expired" })
    .eq("gocardless_mandate_id", mandateId);

  if (error) {
    console.error("Error updating profile mandate status:", error);
  }

  // TODO: Send email notification to user
}

/**
 * Handler: Mandate Active
 */
async function handleMandateActive(
  event: WebhookEvent,
  supabase: SupabaseClientType,
) {
  const mandateId = event.links.mandate;

  console.log(`Mandate active: ${mandateId}`);

  const { error } = await supabase
    .from("profiles")
    .update({ mandate_status: "active" })
    .eq("gocardless_mandate_id", mandateId);

  if (error) {
    console.error("Error updating profile mandate status:", error);
  }
}

/**
 * Handler: Subscription Cancelled
 */
async function handleSubscriptionCancelled(
  event: WebhookEvent,
  supabase: SupabaseClientType,
) {
  const subscriptionId = event.links.subscription;

  console.log(`Subscription cancelled: ${subscriptionId}`);

  const { error } = await supabase
    .from("direct_debit_settings")
    .update({ active: false })
    .eq("gocardless_subscription_id", subscriptionId);

  if (error) {
    console.error("Error deactivating subscription:", error);
  }
}
