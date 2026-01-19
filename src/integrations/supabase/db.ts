import { supabase } from './client'
import type { Database } from './types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Account = Database['public']['Tables']['accounts']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']

// Profile operations
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Account operations
export async function getAccount(userId: string) {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createAccount(userId: string, initialBalance: number = 0) {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .insert([
        {
          user_id: userId,
          balance: initialBalance
        }
      ])
      .select()
      .single()
    
    if (error) {
      // If duplicate key error, fetch the existing account
      if (error.code === '23505') {
        const existingAccount = await getAccount(userId)
        if (existingAccount) return existingAccount
      }
      throw error
    }
    return data
  } catch (error: any) {
    if (error.code === '23505') {
      // Double-check for race condition
      const existingAccount = await getAccount(userId)
      if (existingAccount) return existingAccount
    }
    throw error
  }
}

// Transaction operations
export async function getTransactions(accountId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createTransaction(
  accountId: string,
  amount: number,
  type: 'deposit' | 'withdrawal',
  description?: string
) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        account_id: accountId,
        amount,
        type,
        description
      }
    ])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Fetch user's complete financial data
export async function getUserFinancialData(userId: string) {
  try {
    // First try to get the account, as it should exist
    let account = await getAccount(userId);
    
    // If no account exists, create one
    if (!account) {
      account = await createAccount(userId, 0);
    }

    // After ensuring we have an account, get profile and transactions
    const [profile, transactions] = await Promise.all([
      getProfile(userId),
      account ? getTransactions(account.id) : Promise.resolve([])
    ]);

    return {
      profile,
      account,
      transactions
    };
  } catch (error) {
    console.error('Error in getUserFinancialData:', error);
    throw error;
  }
}
