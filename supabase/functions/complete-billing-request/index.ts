// Edge Function: Complete Billing Request
// This function completes the GoCardless setup after user authorization
// It retrieves mandate details and creates a subscription for recurring payments

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createSupabaseClient,
  verifyAuth,
  corsHeaders,
} from "../_shared/supabase.ts";
import { goCardlessRequest, GOCARDLESS_CONFIG } from "../_shared/gocardless.ts";

interface CompleteBillingRequestBody {
  flow_id: string;
}

interface BillingRequestFlowResponse {
  billing_request_flows: {
    id: string;
    links: {
      billing_request: string;
    };
  };
}

interface BillingRequestResponse {
  billing_requests: {
    id: string;
    status: string;
    // Links contain the IDs we need
    links?: {
      customer?: string;
      customer_billing_detail?: string;
    };
    // Mandate request contains mandate ID after fulfillment
    mandate_request?: {
      currency?: string;
      scheme?: string;
      links?: {
        mandate?: string;
      };
    };
    // Payment request contains payment ID after fulfillment
    payment_request?: {
      amount?: number;
      currency?: string;
      description?: string;
      links?: {
        payment?: string;
      };
    };
    // Resources contain full objects (not IDs)
    resources?: {
      customer?: {
        id: string;
        email?: string;
        given_name?: string;
        family_name?: string;
        metadata?: Record<string, string>;
      };
      customer_bank_account?: {
        id: string;
      };
    };
  };
}

interface SubscriptionResponse {
  subscriptions: {
    id: string;
    status: string;
    amount: number;
    start_date: string;
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
    const { flow_id }: CompleteBillingRequestBody = await req.json();

    if (!flow_id) {
      return new Response(JSON.stringify({ error: "flow_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Completing billing request flow:", flow_id);

    // Initialize Supabase client
    const supabase = createSupabaseClient();

    // Step 1: Fetch the billing request flow to get the billing request ID
    // Note: The flow is already completed when user returns, we just need to fetch it
    const flowResponse = await goCardlessRequest<BillingRequestFlowResponse>(
      `/billing_request_flows/${flow_id}`,
      {
        method: "GET",
      },
    );

    const billingRequestId =
      flowResponse.billing_request_flows.links.billing_request;
    console.log("Flow completed, billing request:", billingRequestId);

    // Step 2: Fulfill the billing request to create the mandate and payment
    // This is required after the user completes authorization
    console.log("Fulfilling billing request:", billingRequestId);
    await goCardlessRequest(
      `/billing_requests/${billingRequestId}/actions/fulfil`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );

    console.log(
      "Billing request fulfillment initiated, polling for completion...",
    );

    // Step 3: Poll for billing request to reach "fulfilled" status
    // Fulfillment is asynchronous and can take a few seconds
    let billingRequestResponse: BillingRequestResponse;
    const maxAttempts = 10;
    const delayMs = 2000; // 2 seconds between attempts

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Polling attempt ${attempt}/${maxAttempts}...`);

      billingRequestResponse = await goCardlessRequest<BillingRequestResponse>(
        `/billing_requests/${billingRequestId}`,
        {
          method: "GET",
        },
      );

      const status = billingRequestResponse.billing_requests.status;
      console.log(`Billing request status: ${status}`);

      if (status === "fulfilled") {
        console.log("Billing request successfully fulfilled");
        break;
      }

      if (status !== "fulfilling") {
        throw new Error(
          `Unexpected billing request status: ${status}. Expected "fulfilling" or "fulfilled".`,
        );
      }

      if (attempt < maxAttempts) {
        console.log(`Waiting ${delayMs}ms before next poll...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        throw new Error(
          `Billing request fulfillment timed out after ${(maxAttempts * delayMs) / 1000} seconds. Status: ${status}`,
        );
      }
    }

    // Step 4: Extract IDs from the fulfilled billing request
    // The IDs are in different locations in the response:
    // - Mandate ID: mandate_request.links.mandate
    // - Customer ID: links.customer OR resources.customer.id
    // - Payment ID: payment_request.links.payment
    const billingRequest = billingRequestResponse!.billing_requests;

    const mandateId = billingRequest.mandate_request?.links?.mandate;
    const customerId =
      billingRequest.links?.customer ||
      billingRequest.resources?.customer?.id;
    const paymentId = billingRequest.payment_request?.links?.payment || null;

    if (!mandateId || !customerId) {
      console.error("Full billing request response:", JSON.stringify(billingRequest, null, 2));
      throw new Error(
        `Could not extract mandate or customer ID. Mandate: ${mandateId}, Customer: ${customerId}, Status: ${billingRequest.status}`,
      );
    }

    console.log("Extracted IDs:", { mandateId, customerId, paymentId });

    // Step 5: Get DD settings to retrieve monthly amount
    const { data: ddSettings, error: settingsError } = await supabase
      .from("direct_debit_settings")
      .select("monthly_amount, collection_day")
      .eq("user_id", userId)
      .single();

    if (settingsError || !ddSettings) {
      throw new Error("Direct debit settings not found");
    }

    // Step 6: Create subscription for recurring monthly payments
    console.log("Creating subscription for mandate:", mandateId);

    const subscriptionResponse = await goCardlessRequest<SubscriptionResponse>(
      "/subscriptions",
      {
        method: "POST",
        body: JSON.stringify({
          subscriptions: {
            amount: ddSettings.monthly_amount,
            currency: GOCARDLESS_CONFIG.CURRENCY,
            name: "Treatcode Monthly Deposit",
            interval_unit: "monthly",
            interval: 1,
            day_of_month: ddSettings.collection_day,
            links: {
              mandate: mandateId,
            },
            metadata: {
              treatcode_user_id: userId,
            },
          },
        }),
      },
    );

    const subscriptionId = subscriptionResponse.subscriptions.id;
    console.log("Created subscription:", subscriptionId);

    // Step 7: Update database with mandate and subscription details

    // Update profile with mandate info
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        gocardless_mandate_id: mandateId,
        mandate_status: "active",
        gocardless_customer_id: customerId,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
    }

    // Update DD settings with subscription ID and set active
    const { error: updateSettingsError } = await supabase
      .from("direct_debit_settings")
      .update({
        gocardless_subscription_id: subscriptionId,
        active: true,
      })
      .eq("user_id", userId);

    if (updateSettingsError) {
      console.error("Error updating DD settings:", updateSettingsError);
    }

    // Step 8: Create initial deposit record if payment was included
    if (paymentId) {
      console.log("Creating deposit record for initial payment:", paymentId);

      const { error: depositError } = await supabase.from("deposits").insert({
        user_id: userId,
        amount: ddSettings.monthly_amount,
        status: "pending",
        gocardless_payment_id: paymentId,
        scheduled_date: new Date().toISOString().split("T")[0],
        metadata: {
          type: "initial_setup",
          subscription_id: subscriptionId,
        },
      });

      if (depositError) {
        console.error("Error creating deposit record:", depositError);
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        mandate_id: mandateId,
        subscription_id: subscriptionId,
        payment_id: paymentId,
        message: "Direct Debit setup completed successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in complete-billing-request:", error);
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
