// Shared Supabase utilities for Edge Functions
import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

export type SupabaseClientType = SupabaseClient;

export function createSupabaseClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/**
 * Verify JWT token and get user ID
 */
export async function verifyAuth(authHeader: string | null): Promise<string> {
  if (!authHeader) {
    throw new Error("No authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error("Invalid or expired token");
  }

  return user.id;
}

/**
 * CORS headers for API responses
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
