export type Currency = 'USD' | 'ETB';

export type Category = 'Food' | 'Transport' | 'Rent' | 'Internet' | 'Entertainment' | 'Coffee' | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string; // ISO date string YYYY-MM-DD
  isRecurring: boolean;
  frequency?: 'Daily' | 'Weekly' | 'Monthly';
  note?: string;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  type: 'Stable' | 'Variable';
}

export type AssetType = 'Cash' | 'Crypto' | 'Stock' | 'Real Estate' | 'Debt' | 'Other';

export interface Asset {
  id: string;
  name: string;
  amount: number;
  type: AssetType;
  currency: Currency;
}

export interface Settings {
  exchangeRate: number; // 1 USD = X ETB
  savingsGoalUSD: number;
  recurringEnabled: boolean;
  userName: string;
  monthly_budget: number; // Matched DB column
  theme: 'light' | 'dark';
}

export interface FinanceContextType {
  userId: string | null;
  expenses: Expense[];
  incomes: Income[];
  assets: Asset[];
  settings: Settings;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  deleteIncome: (id: string) => void;
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  deleteAsset: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  isInputActive: boolean;
  setIsInputActive: (active: boolean) => void;
}