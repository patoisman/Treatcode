-- Fix critical security vulnerability in transactions RLS policies
-- The policies were incorrectly comparing accounts.user_id with transactions.account_id
-- instead of accounts.id with transactions.account_id

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;

-- Create corrected policies with proper JOIN logic
CREATE POLICY "Users can create own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM accounts
    WHERE accounts.user_id = auth.uid() 
    AND accounts.id = transactions.account_id
  )
);

CREATE POLICY "Users can view own transactions" 
ON public.transactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM accounts
    WHERE accounts.user_id = auth.uid() 
    AND accounts.id = transactions.account_id
  )
);