import { Expense, Income, Settings, Asset } from './types';

export const CATEGORIES: { label: string; value: string }[] = [
  { label: 'Food', value: 'Food' },
  { label: 'Coffee', value: 'Coffee' },
  { label: 'Item', value: 'Item' },
  { label: 'Transport', value: 'Transport' },
  { label: 'Rent', value: 'Rent' },
  { label: 'Internet', value: 'Internet' },
  { label: 'Fun', value: 'Entertainment' },
  { label: 'Other', value: 'Other' },
];

export const INITIAL_SETTINGS: Settings = {
  exchangeRate: 180.0,
  savingsGoalUSD: 10000,
  recurringEnabled: true,
  userName: 'Freelancer',
  monthly_budget: 1000,
  theme: 'light',
};

// Mock Data Generation
const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

export const INITIAL_EXPENSES: Expense[] = [
  { id: '1', title: 'Lunch at cafe', amount: 450, category: 'Food', date: formatDate(today), isRecurring: false, note: 'Lunch at cafe' },
  { id: '2', title: 'Uber to meeting', amount: 300, category: 'Transport', date: formatDate(today), isRecurring: false, note: 'Uber to meeting' },
  { id: '3', title: 'EthioTelecom', amount: 1200, category: 'Internet', date: formatDate(new Date(today.getTime() - 86400000)), isRecurring: true, frequency: 'Monthly', note: 'EthioTelecom' },
  { id: '4', title: 'Groceries', amount: 800, category: 'Food', date: formatDate(new Date(today.getTime() - 86400000 * 2)), isRecurring: false, note: 'Groceries' },
  { id: '5', title: 'Apartment Rent', amount: 25000, category: 'Rent', date: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), isRecurring: true, frequency: 'Monthly', note: 'Apartment Rent' },
];

export const INITIAL_INCOMES: Income[] = [
  { id: '1', amount: 2000, source: 'Retainer Client A', date: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), type: 'Stable' },
  { id: '1b', amount: 500, source: 'Maintenance Contract', date: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), type: 'Stable' },
  { id: '2', amount: 450, source: 'Upwork Project', date: formatDate(new Date(today.getTime() - 86400000 * 5)), type: 'Variable' },
  { id: '3', amount: 300, source: 'Consultation', date: formatDate(new Date(today.getTime() - 86400000 * 10)), type: 'Variable' },
];

export const INITIAL_ASSETS: Asset[] = [
  { id: '1', name: 'Emergency Fund', amount: 5000, type: 'Cash', currency: 'USD' },
  { id: '2', name: 'Bitcoin Cold Storage', amount: 2500, type: 'Crypto', currency: 'USD' },
  { id: '3', name: 'Tech ETF', amount: 1500, type: 'Stock', currency: 'USD' },
];