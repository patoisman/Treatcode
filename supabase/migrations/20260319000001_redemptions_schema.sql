-- Migration: Redemptions system
-- Adds the redemptions table and is_admin flag to profiles.
-- Run this in the Supabase SQL editor.

-- 1. Add is_admin to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Create redemptions table
CREATE TABLE IF NOT EXISTS public.redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_name text NOT NULL,
  brand_slug text NOT NULL,           -- maps to Tillo retailer ID in future phase
  amount integer NOT NULL,            -- in pence
  status text NOT NULL DEFAULT 'pending'
    CHECK (status = ANY (ARRAY['pending'::text, 'fulfilled'::text, 'cancelled'::text])),
  voucher_code text,                  -- null until admin fulfils
  voucher_instructions text,          -- shown to user
  admin_notes text,                   -- internal only, never shown to user
  fulfilled_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  cancellation_reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT redemptions_pkey PRIMARY KEY (id),
  CONSTRAINT redemptions_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS redemptions_status_created_at_idx
  ON public.redemptions (status, created_at);

CREATE INDEX IF NOT EXISTS redemptions_user_id_created_at_idx
  ON public.redemptions (user_id, created_at DESC);

-- 4. Row Level Security
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own redemptions (frontend direct queries use this)
CREATE POLICY "Users can view own redemptions"
  ON public.redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- All writes go through Edge Functions using the service role key (bypasses RLS)
-- No insert/update/delete policies needed for the anon/authenticated role

-- -----------------------------------------------------------------------
-- After running this migration:
-- 1. Go to Table Editor > profiles
-- 2. Find the admin user's row and set is_admin = true
-- 3. Add the following secrets in Supabase Dashboard > Settings > Edge Functions > Secrets:
--      RESEND_API_KEY     — from your Resend dashboard
--      RESEND_FROM_EMAIL  — e.g. Treatcode <hello@treatcode.co.uk>
--      ADMIN_EMAIL        — the email address to receive new voucher request notifications
-- -----------------------------------------------------------------------
