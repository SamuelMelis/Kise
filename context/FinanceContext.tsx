import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, Income, Asset, Settings, FinanceContextType } from '../types';
import { INITIAL_EXPENSES, INITIAL_INCOMES, INITIAL_ASSETS, INITIAL_SETTINGS } from '../constants';
import { supabase } from '../lib/supabaseClient';

interface FinanceContextTypeWithUser extends FinanceContextType {
  userId: string | null;
  setUserId: (id: string | null) => void;
}

const FinanceContext = createContext<FinanceContextTypeWithUser | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);

  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [incomes, setIncomes] = useState<Income[]>(INITIAL_INCOMES);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  // Load data from Supabase when userId changes
  useEffect(() => {
    if (!userId) {
      setExpenses(INITIAL_EXPENSES);
      setIncomes(INITIAL_INCOMES);
      setAssets(INITIAL_ASSETS);
      setSettings(INITIAL_SETTINGS);
      return;
    }

    const loadData = async () => {
      console.log("NomadFinance: Loading data for user...", userId);
      setIsLoading(true);
      try {
        // Parallel fetch for speed
        const [expensesRes, incomesRes, assetsRes, settingsRes] = await Promise.all([
          supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }),
          supabase.from('incomes').select('*').eq('user_id', userId).order('date', { ascending: false }),
          supabase.from('assets').select('*').eq('user_id', userId),
          supabase.from('settings').select('*').eq('user_id', userId).single()
        ]);

        if (expensesRes.data) {
          setExpenses(expensesRes.data.map(e => ({ ...e, id: e.id.toString(), amount: Number(e.amount) })));
        }

        if (incomesRes.data) {
          setIncomes(incomesRes.data.map(i => ({ ...i, id: i.id.toString(), amount: Number(i.amount) })));
        }

        if (assetsRes.data) {
          setAssets(assetsRes.data.map(a => ({ ...a, id: a.id.toString(), amount: Number(a.amount) })));
        }

        if (settingsRes.data) {
          const loadedSettings = {
            ...INITIAL_SETTINGS,
            ...settingsRes.data,
            monthly_budget: Number(settingsRes.data.monthly_budget || 1000)
          };
          setSettings(loadedSettings);

          // Migration: Update legacy 115 rate to new 180 default
          if (loadedSettings.exchangeRate === 115.0) {
            console.log("NomadFinance: Migrating legacy exchange rate 115 -> 180");
            updateSettings({ exchangeRate: 180.0 });
          }
        } else if (settingsRes.error && settingsRes.error.code === 'PGRST116') {
          console.log("NomadFinance: No settings found, initializing default...");
          await supabase.from('settings').upsert({ user_id: userId, ...INITIAL_SETTINGS });
          setSettings(INITIAL_SETTINGS);
        } else if (settingsRes.error) {
          console.error("NomadFinance: Settings fetch error:", settingsRes.error);
        }

      } catch (error) {
        console.error('NomadFinance: Critical error during data load:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!userId) return;
    const tempId = Date.now().toString();
    const newExpense = { ...expense, id: tempId };

    // Optimistic Update
    setExpenses(prev => [newExpense, ...prev]);

    // Sync to DB
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        user_id: userId,
        title: expense.title || expense.category || 'Expense', // Ensure title is never null
        amount: expense.amount,
        category: expense.category,
        date: expense.date // Ensure this matches DB format (ISO string usually works)
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      // Revert optimistic update (optional simplification)
      setExpenses(prev => prev.filter(e => e.id !== tempId));
    } else if (data) {
      // Replace temp ID with real ID
      setExpenses(prev => prev.map(e => e.id === tempId ? { ...e, id: data.id.toString() } : e));
    }
  };

  const deleteExpense = async (id: string) => {
    if (!userId) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
    await supabase.from('expenses').delete().eq('id', id);
  };

  const addIncome = async (income: Omit<Income, 'id'>) => {
    if (!userId) return;
    const tempId = Date.now().toString();
    const newIncome = { ...income, id: tempId };

    setIncomes(prev => [newIncome, ...prev]);

    const { data, error } = await supabase
      .from('incomes')
      .insert([{
        user_id: userId,
        source: income.source,
        amount: income.amount,
        date: income.date
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding income:', error);
      setIncomes(prev => prev.filter(i => i.id !== tempId));
    } else if (data) {
      setIncomes(prev => prev.map(i => i.id === tempId ? { ...i, id: data.id.toString() } : i));
    }
  };

  const deleteIncome = async (id: string) => {
    if (!userId) return;
    setIncomes(prev => prev.filter(i => i.id !== id));
    await supabase.from('incomes').delete().eq('id', id);
  };

  const addAsset = async (asset: Omit<Asset, 'id'>) => {
    if (!userId) return;
    const tempId = Date.now().toString();
    const newAsset = { ...asset, id: tempId };

    setAssets(prev => [newAsset, ...prev]);

    const { data, error } = await supabase
      .from('assets')
      .insert([{
        user_id: userId,
        name: asset.name,
        amount: asset.amount,
        type: asset.type,
        currency: asset.currency || 'USD'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding asset:', error);
      setAssets(prev => prev.filter(a => a.id !== tempId));
    } else if (data) {
      setAssets(prev => prev.map(a => a.id === tempId ? { ...a, id: data.id.toString() } : a));
    }
  };

  const deleteAsset = async (id: string) => {
    if (!userId) return;
    setAssets(prev => prev.filter(a => a.id !== id));
    await supabase.from('assets').delete().eq('id', id);
  };

  const [isInputActive, setIsInputActive] = useState(false);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!userId) return;
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      supabase.from('settings').upsert({ user_id: userId, ...updated }).then(({ error }) => {
        if (error) console.error('Error updating settings:', error);
      });
      return updated;
    });
  };

  return (
    <FinanceContext.Provider value={{
      userId,
      setUserId,
      expenses,
      incomes,
      assets,
      settings,
      addExpense,
      deleteExpense,
      addIncome,
      deleteIncome,
      addAsset,
      deleteAsset,
      updateSettings,
      isInputActive,
      setIsInputActive
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};