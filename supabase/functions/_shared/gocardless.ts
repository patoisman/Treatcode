// Shared GoCardless API configuration and utilities
// Used by all Edge Functions that interact with GoCardless

export const GOCARDLESS_CONFIG = {
  // GoCardless API base URLs
  SANDBOX_URL: "https://api-sandbox.gocardless.com",
  LIVE_URL: "https://api.gocardless.com",

  // API version
  API_VERSION: "2015-07-06",

  // Default currency
  CURRENCY: "GBP",

  // Direct Debit scheme for UK
  SCHEME: "bacs",

  // Amount limits (in pence)
  MIN_AMOUNT: 1000, // £10
  MAX_AMOUNT: 50000, // £500

  // Collection day (1st of month)
  DEFAULT_COLLECTION_DAY: 1,
} as const;

/**
 * Get the GoCardless API URL based on environment
 */
export function getGoCardlessUrl(): string {
  const environment = Deno.env.get("GOCARDLESS_ENVIRONMENT") || "sandbox";
  return environment === "live"
    ? GOCARDLESS_CONFIG.LIVE_URL
    : GOCARDLESS_CONFIG.SANDBOX_URL;
}

/**
 * Get GoCardless access token from environment
 */
export function getGoCardlessToken(): string {
  const token = Deno.env.get("GOCARDLESS_ACCESS_TOKEN");
  if (!token) {
    throw new Error("GOCARDLESS_ACCESS_TOKEN not configured");
  }
  return token;
}

/**
 * Get GoCardless webhook secret from environment
 */
export function getGoCardlessWebhookSecret(): string {
  const secret = Deno.env.get("GOCARDLESS_WEBHOOK_SECRET");
  if (!secret) {
    throw new Error("GOCARDLESS_WEBHOOK_SECRET not configured");
  }
  return secret;
}

/**
 * Common headers for GoCardless API requests
 */
export function getGoCardlessHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getGoCardlessToken()}`,
    "GoCardless-Version": GOCARDLESS_CONFIG.API_VERSION,
    "Content-Type": "application/json",
  };
}

/**
 * Make a request to the GoCardless API
 */
export async function goCardlessRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${getGoCardlessUrl()}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getGoCardlessHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("GoCardless API Error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });

    throw new Error(
      `GoCardless API error: ${response.status} - ${
        errorData.error?.message || response.statusText
      }`,
    );
  }

  return response.json();
}

/**
 * Format amount from pounds to pence
 */
export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100);
}

/**
 * Format amount from pence to pounds
 */
export function penceToPounds(pence: number): number {
  return pence / 100;
}

/**
 * Validate amount is within allowed limits
 */
export function validateAmount(amountInPence: number): boolean {
  return (
    amountInPence >= GOCARDLESS_CONFIG.MIN_AMOUNT &&
    amountInPence <= GOCARDLESS_CONFIG.MAX_AMOUNT
  );
}

/**
 * Calculate next collection date based on collection day
 */
export function calculateNextCollectionDate(
  collectionDay: number = GOCARDLESS_CONFIG.DEFAULT_COLLECTION_DAY,
): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Create date for this month's collection day
  let nextDate = new Date(year, month, collectionDay);

  // If we've already passed this month's collection day, move to next month
  if (nextDate <= today) {
    nextDate = new Date(year, month + 1, collectionDay);
  }

  // Format as YYYY-MM-DD
  return nextDate.toISOString().split("T")[0];
}

/**
 * Verify webhook signature from GoCardless
 */
export async function verifyWebhookSignature(
  requestBody: string,
  signature: string,
): Promise<boolean> {
  const secret = getGoCardlessWebhookSecret();
  
  // Debug logging (remove in production)
  console.log("Webhook signature verification:");
  console.log("- Secret length:", secret.length);
  console.log("- Received signature:", signature);
  console.log("- Body length:", requestBody.length);

  // GoCardless uses HMAC SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(requestBody);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData,
  );

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const computedSignature = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  console.log("- Computed signature:", computedSignature);
  console.log("- Match:", computedSignature === signature);

  return computedSignature === signature;
}
