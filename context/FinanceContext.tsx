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
      setIsLoading(true);
      try {
        // Fetch Expenses
        const { data: expData } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });
        if (expData) setExpenses(expData.map(e => ({ ...e, id: e.id.toString(), amount: Number(e.amount) })));

        // Fetch Incomes
        const { data: incData } = await supabase
          .from('incomes')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });
        if (incData) setIncomes(incData.map(i => ({ ...i, id: i.id.toString(), amount: Number(i.amount) })));

        // Fetch Assets
        const { data: assetData } = await supabase
          .from('assets')
          .select('*')
          .eq('user_id', userId);
        if (assetData) setAssets(assetData.map(a => ({ ...a, id: a.id.toString(), amount: Number(a.amount) })));

        // Fetch Settings
        const { data: settingsData } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (settingsData) setSettings({ ...settingsData, monthly_budget: Number(settingsData.monthly_budget) });
        else await supabase.from('settings').upsert({ user_id: userId, ...INITIAL_SETTINGS }); // Init settings if missing

      } catch (error) {
        console.error('Error loading data:', error);
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
    setSettings(prev => ({ ...prev, ...newSettings }));
    await supabase.from('settings').upsert({ user_id: userId, ...settings, ...newSettings });
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