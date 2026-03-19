// Edge Function: Get Redemptions
// Dual-mode endpoint:
//   mode='user'  → returns the calling user's own redemptions (admin_notes stripped)
//   mode='admin' → returns all redemptions with user details (requires is_admin=true)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createSupabaseClient,
  verifyAuth,
  corsHeaders,
} from "../_shared/supabase.ts";

type RedemptionStatus = "pending" | "fulfilled" | "cancelled" | "all";

interface GetRedemptionsBody {
  mode: "user" | "admin";
  status?: RedemptionStatus;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const userId = await verifyAuth(req.headers.get("Authorization"));
    const { mode, status = "all" }: GetRedemptionsBody = await req.json();

    const supabase = createSupabaseClient();

    if (mode === "admin") {
      // Check admin flag
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .single();

      if (profileError || !profile?.is_admin) {
        return new Response(
          JSON.stringify({ error: "Not authorized" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Fetch redemptions (redemptions.user_id → auth.users, not public.profiles,
      // so PostgREST auto-join is not available — fetch profiles separately)
      let redemptionsQuery = supabase
        .from("redemptions")
        .select("*")
        .order("created_at", { ascending: true });

      if (status !== "all") {
        redemptionsQuery = redemptionsQuery.eq("status", status);
      }

      const { data: redemptions, error } = await redemptionsQuery;

      if (error) throw error;

      // Fetch profiles for all unique user IDs in one query
      const userIds = [...new Set((redemptions || []).map((r) => r.user_id))];
      const profileMap: Record<string, { full_name: string | null; email: string | null }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        for (const p of profiles || []) {
          profileMap[p.id] = { full_name: p.full_name, email: p.email };
        }
      }

      // Merge profile data into redemption records
      const result = (redemptions || []).map((r) => ({
        ...r,
        user_name: profileMap[r.user_id]?.full_name ?? null,
        user_email: profileMap[r.user_id]?.email ?? null,
      }));

      return new Response(
        JSON.stringify({ success: true, redemptions: result }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // User mode — own redemptions only, no admin_notes
    let query = supabase
      .from("redemptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: redemptions, error } = await query;

    if (error) throw error;

    // Strip admin_notes before returning to user
    const result = (redemptions || []).map(
      // deno-lint-ignore no-unused-vars
      ({ admin_notes, ...rest }) => rest,
    );

    return new Response(
      JSON.stringify({ success: true, redemptions: result }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in get-redemptions:", error);
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
