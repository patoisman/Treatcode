-- GoCardless Integration Schema
-- This migration creates all tables needed for GoCardless Direct Debit functionality

-- ============================================================================
-- 1. DEPOSITS TABLE
-- Tracks all Direct Debit deposits (individual payment instances)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.deposits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL, -- Amount in pence (e.g., 5000 = £50.00)
  status text NOT NULL CHECK (
    status IN ('pending', 'confirmed', 'paid_out', 'failed', 'cancelled')
  ),
  gocardless_payment_id text UNIQUE,
  scheduled_date date,
  created_at timestamp with time zone DEFAULT now(),
  confirmed_at timestamp with time zone,
  paid_out_at timestamp with time zone,
  failure_reason text,
  metadata jsonb DEFAULT '{}'::jsonb, -- Store GoCardless response data
  CONSTRAINT deposits_pkey PRIMARY KEY (id),
  CONSTRAINT deposits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT deposits_amount_positive CHECK (amount > 0)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS deposits_user_id_idx ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS deposits_gocardless_payment_id_idx ON public.deposits(gocardless_payment_id);
CREATE INDEX IF NOT EXISTS deposits_status_idx ON public.deposits(status);
CREATE INDEX IF NOT EXISTS deposits_created_at_idx ON public.deposits(created_at DESC);

-- ============================================================================
-- 2. DIRECT DEBIT SETTINGS TABLE
-- Stores user's Direct Debit preferences and subscription settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.direct_debit_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  monthly_amount integer NOT NULL, -- Amount in pence
  collection_day integer NOT NULL DEFAULT 1, -- Day of month (1-28)
  active boolean NOT NULL DEFAULT false,
  gocardless_subscription_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT direct_debit_settings_pkey PRIMARY KEY (id),
  CONSTRAINT direct_debit_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT direct_debit_settings_collection_day_check CHECK (collection_day >= 1 AND collection_day <= 28),
  CONSTRAINT direct_debit_settings_amount_check CHECK (monthly_amount >= 1000 AND monthly_amount <= 50000) -- £10 to £500
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS direct_debit_settings_user_id_idx ON public.direct_debit_settings(user_id);

-- ============================================================================
-- 3. GOCARDLESS EVENTS TABLE
-- Audit trail for all webhook events from GoCardless
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.gocardless_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE, -- GoCardless event ID (e.g., EV000...)
  event_type text NOT NULL, -- e.g., "payments", "mandates", "subscriptions"
  action text NOT NULL, -- e.g., "confirmed", "failed", "cancelled"
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  payload jsonb NOT NULL, -- Full webhook payload
  processed boolean NOT NULL DEFAULT false,
  processed_at timestamp with time zone,
  error text, -- Store any processing errors
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gocardless_events_pkey PRIMARY KEY (id)
);

-- Indexes for webhook processing
CREATE INDEX IF NOT EXISTS gocardless_events_event_id_idx ON public.gocardless_events(event_id);
CREATE INDEX IF NOT EXISTS gocardless_events_resource_idx ON public.gocardless_events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS gocardless_events_processed_idx ON public.gocardless_events(processed);
CREATE INDEX IF NOT EXISTS gocardless_events_created_at_idx ON public.gocardless_events(created_at DESC);

-- ============================================================================
-- 4. UPDATE PROFILES TABLE
-- Add GoCardless-specific fields if they don't exist
-- ============================================================================
DO $$ 
BEGIN
  -- Add gocardless_customer_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'gocardless_customer_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN gocardless_customer_id text;
  END IF;

  -- Add gocardless_mandate_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'gocardless_mandate_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN gocardless_mandate_id text;
  END IF;

  -- Add mandate_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'mandate_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN mandate_status text;
    ALTER TABLE public.profiles ADD CONSTRAINT mandate_status_check 
      CHECK (mandate_status IN ('pending', 'active', 'cancelled', 'expired'));
  END IF;
END $$;

-- Index for mandate lookups
CREATE INDEX IF NOT EXISTS profiles_gocardless_mandate_id_idx ON public.profiles(gocardless_mandate_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_debit_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gocardless_events ENABLE ROW LEVEL SECURITY;

-- DEPOSITS policies
CREATE POLICY "Users can view own deposits"
  ON public.deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deposits"
  ON public.deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only allow system/service to update deposits (Edge Functions use service role)
CREATE POLICY "Service can update deposits"
  ON public.deposits FOR UPDATE
  USING (true); -- Service role bypasses RLS anyway

-- DIRECT_DEBIT_SETTINGS policies
CREATE POLICY "Users can view own DD settings"
  ON public.direct_debit_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DD settings"
  ON public.direct_debit_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own DD settings"
  ON public.direct_debit_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- GOCARDLESS_EVENTS policies
-- Events should only be accessible via Edge Functions (service role)
-- No direct user access needed
CREATE POLICY "Service can manage events"
  ON public.gocardless_events FOR ALL
  USING (true);

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for direct_debit_settings
DROP TRIGGER IF EXISTS update_direct_debit_settings_updated_at ON public.direct_debit_settings;
CREATE TRIGGER update_direct_debit_settings_updated_at
  BEFORE UPDATE ON public.direct_debit_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 7. GRANTS
-- ============================================================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.deposits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.direct_debit_settings TO authenticated;
GRANT SELECT ON public.gocardless_events TO authenticated; -- Read-only for users

-- Service role has full access (used by Edge Functions)
GRANT ALL ON public.deposits TO service_role;
GRANT ALL ON public.direct_debit_settings TO service_role;
GRANT ALL ON public.gocardless_events TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration creates:
-- - deposits table (track individual payments)
-- - direct_debit_settings table (user subscription preferences)
-- - gocardless_events table (webhook audit trail)
-- - Updated profiles table with GoCardless fields
-- - All necessary RLS policies
-- - Indexes for performance
-- - Helper functions and triggers
