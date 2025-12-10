export interface Asset {
  id: string;
  name: string;
  value: number;
  category: string;
  dateAdded: string;
}

export interface Debt {
  id: string;
  name: string;
  amount: number;
  dateAdded: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  dateOccurred: string;
}

export interface PortfolioStats {
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
  progressPercentage: number;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
}

export interface HistoryItem {
  id: string;
  net_worth: number;
  date: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}
