import { createClient } from '@supabase/supabase-js';
import { Asset, Debt, Expense, Subscription, HistoryItem } from '../types';

// ---------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------
// Hardcoded credentials to ensure connection
const SUPABASE_URL = 'https://czzpwchqixkawyhomrmx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enB3Y2hxaXhrYXd5aG9tcm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODY3MzUsImV4cCI6MjA4MDg2MjczNX0.5WRgo31iYxQpwqBsvzG82eNKaAoP3aXryuciZjB-ySA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const isConfigured = true;

const getTelegramUserId = () => {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    return window.Telegram.WebApp.initDataUnsafe.user.id;
  }
  return 999999;
};

// --- ASSETS ---

export const fetchAssets = async (): Promise<Asset[]> => {
  if (!isConfigured) return [];
  const userId = getTelegramUserId();
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return []; }
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    value: parseFloat(item.value),
    category: item.category,
    dateAdded: item.created_at
  }));
};

export const addAssetToDb = async (name: string, value: number, category: string): Promise<Asset | null> => {
  if (!isConfigured) return null;
  const userId = getTelegramUserId();
  const { data, error } = await supabase
    .from('assets')
    .insert([{ user_id: userId, name, value, category }])
    .select().single();

  if (error) {
    alert(`FAILED: ${error.message}\nHint: ${error.hint || 'No hint'}\nDetails: ${error.details || 'No details'}`);
    console.error("Supabase Error:", error);
    return null;
  }
  return { id: data.id, name: data.name, value: parseFloat(data.value), category: data.category, dateAdded: data.created_at };
};

export const deleteAssetFromDb = async (id: string) => {
  if (!isConfigured) return;
  const userId = getTelegramUserId();
  await supabase.from('assets').delete().eq('id', id).eq('user_id', userId);
};

// --- DEBTS ---

export const fetchDebts = async (): Promise<Debt[]> => {
  if (!isConfigured) return [];
  const userId = getTelegramUserId();
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return []; }
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    amount: parseFloat(item.amount),
    dateAdded: item.created_at
  }));
};

export const addDebtToDb = async (name: string, amount: number): Promise<Debt | null> => {
  if (!isConfigured) return null;
  const userId = getTelegramUserId();
  const { data, error } = await supabase
    .from('debts')
    .insert([{ user_id: userId, name, amount }])
    .select().single();

  if (error) return null;
  return { id: data.id, name: data.name, amount: parseFloat(data.amount), dateAdded: data.created_at };
};

export const deleteDebtFromDb = async (id: string) => {
  if (!isConfigured) return;
  const userId = getTelegramUserId();
  await supabase.from('debts').delete().eq('id', id).eq('user_id', userId);
};

// --- EXPENSES ---

export const fetchExpenses = async (): Promise<Expense[]> => {
  if (!isConfigured) return [];
  const userId = getTelegramUserId();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date_occurred', { ascending: false })
    .limit(100); // Limit to last 100 for performance

  if (error) { console.error(error); return []; }
  return data.map((item: any) => ({
    id: item.id,
    description: item.description,
    amount: parseFloat(item.amount),
    category: item.category,
    dateOccurred: item.date_occurred
  }));
};

export const addExpenseToDb = async (description: string, amount: number, category: string): Promise<Expense | null> => {
  if (!isConfigured) return null;
  const userId = getTelegramUserId();
  const { data, error } = await supabase
    .from('expenses')
    .insert([{ user_id: userId, description, amount, category }])
    .select().single();

  if (error) return null;
  return {
    id: data.id,
    description: data.description,
    amount: parseFloat(data.amount),
    category: data.category,
    dateOccurred: data.date_occurred
  };
};

export const deleteExpenseFromDb = async (id: string) => {
  if (!isConfigured) return;
  const userId = getTelegramUserId();
  await supabase.from('expenses').delete().eq('id', id).eq('user_id', userId);
};

// --- USER SETTINGS ---

// --- USER SETTINGS ---

export const fetchUserSettings = async (): Promise<{ goal: number; exchangeRate: number }> => {
  if (!isConfigured) return { goal: 10000, exchangeRate: 120 };
  const userId = getTelegramUserId();
  const { data, error } = await supabase.from('user_settings').select('goal, exchange_rate').eq('user_id', userId).single();

  if (data) {
    return {
      goal: parseFloat(data.goal),
      exchangeRate: data.exchange_rate ? parseFloat(data.exchange_rate) : 120
    };
  }

  if (!data || error) {
    const defaultGoal = 10000;
    const defaultRate = 120;
    await supabase.from('user_settings').insert([{ user_id: userId, goal: defaultGoal, exchange_rate: defaultRate }]);
    return { goal: defaultGoal, exchangeRate: defaultRate };
  }
  return { goal: 10000, exchangeRate: 120 };
};

export const updateUserSettings = async (newGoal: number, newRate: number) => {
  if (!isConfigured) return;
  const userId = getTelegramUserId();
  await supabase.from('user_settings').upsert({ user_id: userId, goal: newGoal, exchange_rate: newRate });
};

// --- SUBSCRIPTIONS ---

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  if (!isConfigured) return [];
  const userId = getTelegramUserId();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return []; }
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    amount: parseFloat(item.amount)
  }));
};

export const addSubscriptionToDb = async (name: string, amount: number): Promise<Subscription | null> => {
  if (!isConfigured) return null;
  const userId = getTelegramUserId();
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([{ user_id: userId, name, amount }])
    .select().single();

  if (error) return null;
  return { id: data.id, name: data.name, amount: parseFloat(data.amount) };
};

export const deleteSubscriptionFromDb = async (id: string) => {
  if (!isConfigured) return;
  const userId = getTelegramUserId();
  await supabase.from('subscriptions').delete().eq('id', id).eq('user_id', userId);
};

// --- HISTORY LOGGING ---

export const fetchHistory = async (): Promise<HistoryItem[]> => {
  if (!isConfigured) return [];
  const userId = getTelegramUserId();
  // Get last 30 snapshots
  const { data, error } = await supabase
    .from('history_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .limit(30);

  if (error) return [];
  return data.map((item: any) => ({
    id: item.id,
    net_worth: parseFloat(item.net_worth),
    date: item.date
  }));
};

export const logHistorySnapshot = async (netWorth: number) => {
  if (!isConfigured) return;
  const userId = getTelegramUserId();
  // Use local date YYYY-MM-DD to match user's wall clock
  const today = new Date().toLocaleDateString('en-CA');

  // Check if we already have a snapshot for today
  const { data: existingRows } = await supabase
    .from('history_snapshots')
    .select('id')
    .eq('user_id', userId)
    .eq('date', today);

  if (existingRows && existingRows.length > 0) {
    // Update the first one
    const firstId = existingRows[0].id;
    await supabase.from('history_snapshots').update({ net_worth: netWorth }).eq('id', firstId);

    // Cleanup duplicates if any
    if (existingRows.length > 1) {
      const idsToDelete = existingRows.slice(1).map(r => r.id);
      await supabase.from('history_snapshots').delete().in('id', idsToDelete);
    }
  } else {
    // Insert new
    await supabase.from('history_snapshots').insert([{ user_id: userId, net_worth: netWorth, date: today }]);
  }
};
