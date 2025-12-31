import { Expense, Income, Settings, Asset } from './types';

export const CATEGORIES: { label: string; value: string }[] = [
  { label: 'Food', value: 'Food' },
  { label: 'Transport', value: 'Transport' },
  { label: 'Rent', value: 'Rent' },
  { label: 'Internet', value: 'Internet' },
  { label: 'Fun', value: 'Entertainment' },
  { label: 'Other', value: 'Other' },
];

export const INITIAL_SETTINGS: Settings = {
  exchangeRate: 115.0,
  savingsGoalUSD: 10000,
  recurringEnabled: true,
  userName: 'Freelancer',
};

// Mock Data Generation
const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

export const INITIAL_EXPENSES: Expense[] = [
  { id: '1', amountETB: 450, category: 'Food', date: formatDate(today), isRecurring: false, note: 'Lunch at cafe' },
  { id: '2', amountETB: 300, category: 'Transport', date: formatDate(today), isRecurring: false, note: 'Uber to meeting' },
  { id: '3', amountETB: 1200, category: 'Internet', date: formatDate(new Date(today.getTime() - 86400000)), isRecurring: true, frequency: 'Monthly', note: 'EthioTelecom' },
  { id: '4', amountETB: 800, category: 'Food', date: formatDate(new Date(today.getTime() - 86400000 * 2)), isRecurring: false, note: 'Groceries' },
  { id: '5', amountETB: 25000, category: 'Rent', date: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), isRecurring: true, frequency: 'Monthly', note: 'Apartment Rent' },
];

export const INITIAL_INCOMES: Income[] = [
  { id: '1', amountUSD: 2000, source: 'Retainer Client A', date: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), type: 'Stable' },
  { id: '1b', amountUSD: 500, source: 'Maintenance Contract', date: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), type: 'Stable' },
  { id: '2', amountUSD: 450, source: 'Upwork Project', date: formatDate(new Date(today.getTime() - 86400000 * 5)), type: 'Variable' },
  { id: '3', amountUSD: 300, source: 'Consultation', date: formatDate(new Date(today.getTime() - 86400000 * 10)), type: 'Variable' },
];

export const INITIAL_ASSETS: Asset[] = [
  { id: '1', name: 'Emergency Fund', amountUSD: 5000, type: 'Cash' },
  { id: '2', name: 'Bitcoin Cold Storage', amountUSD: 2500, type: 'Crypto' },
  { id: '3', name: 'Tech ETF', amountUSD: 1500, type: 'Stock' },
];