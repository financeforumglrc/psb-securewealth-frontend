import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useWealthStore } from '../store/wealthStore';
import type { Asset, Goal, Transaction } from '../types';

/* ═══════════════════════════════════════════════════════════════
   useSupabaseSync — Bridge between Zustand store and Supabase
   Loads user data on login, syncs changes back to DB
   ═══════════════════════════════════════════════════════════════ */

export function useSupabaseSync() {
  const isSyncing = useRef(false);
  const lastUserId = useRef<string | null>(null);
  const hasHydrated = useRef(false);

  async function hydrateStore(userId: string) {
    if (isSyncing.current) return;
    isSyncing.current = true;
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        useWealthStore.setState({
          user: {
            name: profile.name,
            riskProfile: profile.risk_profile,
            taxBracket: profile.tax_bracket,
            monthlyIncome: Number(profile.monthly_income),
            monthlyExpenses: Number(profile.monthly_expenses),
            monthlySavings: Number(profile.monthly_savings),
          },
        });
      }

      // Fetch assets
      const { data: assets } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId);

      if (assets) {
        useWealthStore.setState({
          assets: assets.map((a): Asset => ({
            id: a.id,
            name: a.name,
            type: a.type,
            value: Number(a.value),
            liquidity: a.liquidity,
            returns: a.returns ? Number(a.returns) : undefined,
            linkedViaAA: a.linked_via_aa,
          })),
        });
      }

      // Fetch transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(50);

      if (transactions) {
        useWealthStore.setState({
          transactions: transactions.map((t): Transaction => ({
            id: t.id,
            date: t.date,
            description: t.description,
            category: t.category,
            amount: Number(t.amount),
            type: t.txn_type,
            status: t.status,
            riskLevel: t.risk_level,
            score: t.score ?? undefined,
            referenceId: t.reference_id ?? undefined,
          })),
        });
      }

      // Fetch goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      if (goals) {
        useWealthStore.setState({
          goals: goals.map((g): Goal => ({
            id: g.id,
            name: g.name,
            type: g.goal_type,
            targetAmount: Number(g.target_amount),
            currentAmount: Number(g.current_amount),
            deadline: g.deadline,
          })),
        });
      }

      // Fetch bills
      const { data: bills } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', userId);

      if (bills) {
        useWealthStore.setState({
          bills: bills.map((b) => ({
            id: b.id,
            name: b.name,
            category: b.category,
            amount: Number(b.amount),
            predictedAmount: b.predicted_amount ? Number(b.predicted_amount) : undefined,
            dueDay: b.due_day,
            icon: b.icon,
            color: b.color,
            status: b.status,
            isRecurring: b.is_recurring,
            frequency: b.frequency,
            autoDetected: b.auto_detected,
            lastPaid: b.last_paid,
            history: b.history || [],
          })),
        });
      }
    } catch (err) {
      console.error('Failed to hydrate store from Supabase:', err);
    } finally {
      isSyncing.current = false;
    }
  }

  async function syncToSupabase() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || isSyncing.current) return;

    const userId = session.user.id;
    const state = useWealthStore.getState();

    // Sync profile changes
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        name: state.user.name,
        risk_profile: state.user.riskProfile,
        tax_bracket: state.user.taxBracket,
        monthly_income: state.user.monthlyIncome,
        monthly_expenses: state.user.monthlyExpenses,
        monthly_savings: state.user.monthlySavings,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Profile sync failed:', e);
    }
  }

  // Hydrate from Supabase when user logs in
  useEffect(() => {
    let cancelled = false;

    const unsubscribe = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id;
        if (lastUserId.current === userId && hasHydrated.current) return;
        lastUserId.current = userId;
        hasHydrated.current = true;

        // Defer hydration to avoid render-phase state updates
        setTimeout(() => {
          if (!cancelled) hydrateStore(userId);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        lastUserId.current = null;
        hasHydrated.current = false;
      }
    });

    return () => {
      cancelled = true;
      unsubscribe.data.subscription.unsubscribe();
    };
  }, []);

  // Periodic sync: push local changes to Supabase every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      syncToSupabase();
    }, 10000);
    return () => clearInterval(interval);
  }, []);
}

// Standalone helpers for components to use directly
export async function syncAssetToSupabase(asset: Asset) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase.from('assets').upsert({
    id: asset.id,
    user_id: userId,
    name: asset.name,
    type: asset.type,
    value: asset.value,
    liquidity: asset.liquidity,
    returns: asset.returns,
    linked_via_aa: asset.linkedViaAA,
  });

  if (error) console.error('Asset sync error:', error);
}

export async function syncTransactionToSupabase(txn: Transaction) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase.from('transactions').insert({
    user_id: userId,
    txn_id: txn.id,
    date: txn.date,
    description: txn.description,
    category: txn.category,
    amount: txn.amount,
    txn_type: txn.type,
    status: txn.status,
    risk_level: txn.riskLevel,
    score: txn.score,
    reference_id: txn.referenceId,
  });

  if (error) console.error('Transaction sync error:', error);
}

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
