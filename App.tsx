import React, { useState, useEffect, useMemo } from 'react';
import { Asset, Debt, Expense, Subscription, HistoryItem } from './types';
import UniversalForm from './components/UniversalForm';
import AssetList from './components/AssetList';
import DebtList from './components/DebtList';
import ExpenseList from './components/ExpenseList';
import NetWorthCard from './components/GoalProgress';
import MonthlyReport from './components/MonthlyReport';
import HistoryChart from './components/HistoryChart';
import SubscriptionManager from './components/SubscriptionManager';
import SettingsModal from './components/SettingsModal';
import { LayoutGrid, PieChart, Plus, X, Wallet, Receipt, CreditCard, Settings } from 'lucide-react';
import {
  fetchAssets, addAssetToDb, deleteAssetFromDb,
  fetchDebts, addDebtToDb, deleteDebtFromDb,
  fetchExpenses, addExpenseToDb, deleteExpenseFromDb,
  fetchUserSettings, updateUserSettings,
  fetchSubscriptions, addSubscriptionToDb, deleteSubscriptionFromDb,
  fetchHistory, logHistorySnapshot
} from './services/supabase';

// Add Telegram Type definition for TS
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        version: string;
        addToHomeScreen: () => void; // Available in v8.0+
        checkHomeScreenStatus: (callback: (status: string) => void) => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            username?: string;
          }
        };
      }
    }
  }
}

type Tab = 'assets' | 'debts' | 'expenses' | 'insights';
type AddType = 'asset' | 'debt' | 'expense';

const App: React.FC = () => {
  // --- State ---
  const [assets, setAssets] = useState<Asset[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [goal, setGoal] = useState<number>(10000);
  const [exchangeRate, setExchangeRate] = useState<number>(120); // Default exchange rate
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('assets');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [addType, setAddType] = useState<AddType>('asset');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For selecting what to add

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginAnswer, setLoginAnswer] = useState('');
  const [loginError, setLoginError] = useState(false);

  // --- Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAnswer.trim().toLowerCase() === '2x') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  // --- Telegram Init & Data Fetching ---
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();

      // Auto-Login for Admin
      const username = window.Telegram.WebApp.initDataUnsafe?.user?.username;
      if (username === 'Samuel_Melis') {
        setIsAuthenticated(true);
      }
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [lAssets, lDebts, lExpenses, lSettings, lSubs, lHistory] = await Promise.all([
          fetchAssets(),
          fetchDebts(),
          fetchExpenses(),
          fetchUserSettings(),
          fetchSubscriptions(),
          fetchHistory()
        ]);
        setAssets(lAssets);
        setDebts(lDebts);
        setExpenses(lExpenses);
        setGoal(lSettings.goal);
        setExchangeRate(lSettings.exchangeRate);
        setSubscriptions(lSubs);
        setHistory(lHistory);

        // Calculate and Log Net Worth Snapshot for today
        const totalA = lAssets.reduce((sum, a) => sum + a.value, 0);
        const totalD = lDebts.reduce((sum, d) => sum + d.amount, 0);
        await logHistorySnapshot(totalA - totalD);

      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // --- Handlers ---
  const handleAdd = async (data: any) => {
    if (addType === 'asset') {
      const newItem = await addAssetToDb(data.name, data.value, data.category);
      if (newItem) setAssets(prev => [newItem, ...prev]);
    } else if (addType === 'debt') {
      const newItem = await addDebtToDb(data.name, data.amount);
      if (newItem) setDebts(prev => [newItem, ...prev]);
    } else {
      const newItem = await addExpenseToDb(data.description, data.amount, data.category);
      if (newItem) setExpenses(prev => [newItem, ...prev]);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteAsset = async (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    await deleteAssetFromDb(id);
  };

  const handleDeleteDebt = async (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    await deleteDebtFromDb(id);
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    await deleteExpenseFromDb(id);
  };

  // --- Realtime History Updates ---
  useEffect(() => {
    if (isLoading) return;

    const currentNetWorth = assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.amount, 0);
    // Use local date YYYY-MM-DD to match user's wall clock
    const today = new Date().toLocaleDateString('en-CA');

    setHistory(prev => {
      const newHistory = [...prev];
      const lastItem = newHistory[newHistory.length - 1];

      // Careful: Check if lastItem exists before accessing property
      if (lastItem && lastItem.date === today) {
        // Update today's entry
        lastItem.net_worth = currentNetWorth;
      } else {
        // Add new entry for today if it doesn't match
        // Note: This logic assumes 'prev' is sorted by date.
        // If 'today' is significantly newer than last item, simple push is fine.
        newHistory.push({ id: 'temp-today', net_worth: currentNetWorth, date: today });
      }
      return newHistory;
    });

    logHistorySnapshot(currentNetWorth);
  }, [assets, debts, isLoading]); // Update whenever assets or debts change

  const handleUpdateSettings = async (newGoal: number, newRate: number) => {
    setGoal(newGoal);
    setExchangeRate(newRate);
    await updateUserSettings(newGoal, newRate);
  };

  // --- Subscription Handlers ---
  const handleAddSubscription = async (name: string, amount: number) => {
    const newItem = await addSubscriptionToDb(name, amount);
    if (newItem) setSubscriptions(prev => [newItem, ...prev]);
  };

  const handleDeleteSubscription = async (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    await deleteSubscriptionFromDb(id);
  };

  const handleLogSubscriptions = async (subs: Subscription[]) => {
    for (const sub of subs) {
      const newItem = await addExpenseToDb(sub.name, sub.amount, 'Bills'); // Default to "Bills" for Subs
      if (newItem) setExpenses(prev => [newItem, ...prev]);
    }
  };


  const openAddModal = (type: AddType) => {
    setAddType(type);
    setIsMenuOpen(false);
    setIsAddModalOpen(true);
  };

  // --- Derived State ---
  const assetsTotal = useMemo(() => assets.reduce((sum, item) => sum + item.value, 0), [assets]);
  const debtsTotal = useMemo(() => debts.reduce((sum, item) => sum + item.amount, 0), [debts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Syncing ኪሴ...</p>
        </div>
      </div>
    );
  }

  // --- Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome to ኪሴ</h1>
            <p className="text-slate-500 text-sm">Security Check</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-2">
                What is your favourite word?
              </label>
              <input
                type="text"
                value={loginAnswer}
                onChange={(e) => {
                  setLoginAnswer(e.target.value);
                  setLoginError(false);
                }}
                className={`w-full bg-slate-50 border ${loginError ? 'border-red-300 focus:border-red-500 ring-red-200' : 'border-slate-200 focus:border-indigo-500'} rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all font-medium text-center placeholder-slate-400`}
                placeholder="Type answer..."
                autoFocus
              />
              {loginError && (
                <p className="text-red-500 text-xs mt-2 text-center font-bold animate-pulse">
                  NOT YOUR ኪስ
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              Unlock App
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">ኪሴ</h1>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-slate-600">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-5">

          {/* Net Worth Card (Always Visible) */}
          <NetWorthCard
            assetsTotal={assetsTotal}
            debtsTotal={debtsTotal}
            goal={goal}
            setGoal={(g) => handleUpdateSettings(g, exchangeRate)} // Allow quick goal edit from card
          />



          {/* Tab Views */}
          {activeTab === 'assets' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Assets</h2>
              </div>
              <AssetList assets={assets} onDelete={handleDeleteAsset} />
            </div>
          )}

          {activeTab === 'debts' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Debts</h2>
              </div>
              <DebtList debts={debts} onDelete={handleDeleteDebt} />
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">

              {/* Subscriptions Section */}
              <SubscriptionManager
                subscriptions={subscriptions}
                onAdd={handleAddSubscription}
                onDelete={handleDeleteSubscription}
                onLogToExpenses={handleLogSubscriptions}
                exchangeRate={exchangeRate}
              />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Spending</h2>
                </div>
                <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              {/* History Chart moved here */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Net Worth History</h2>
                </div>
                <HistoryChart history={history} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Monthly Report</h2>
                </div>
                <MonthlyReport expenses={expenses} />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Floating Action Button (FAB) Group */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3">
        {isMenuOpen && (
          <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 fade-in duration-200 mb-2">
            <button onClick={() => openAddModal('expense')} className="flex items-center gap-3 bg-white text-slate-700 px-4 py-2 rounded-full shadow-lg border border-slate-100 font-medium text-sm">
              Add Expense <span className="bg-amber-100 p-1.5 rounded-full text-amber-600"><Receipt className="w-4 h-4" /></span>
            </button>
            <button onClick={() => openAddModal('debt')} className="flex items-center gap-3 bg-white text-slate-700 px-4 py-2 rounded-full shadow-lg border border-slate-100 font-medium text-sm">
              Add Debt <span className="bg-red-100 p-1.5 rounded-full text-red-600"><CreditCard className="w-4 h-4" /></span>
            </button>
            <button onClick={() => openAddModal('asset')} className="flex items-center gap-3 bg-white text-slate-700 px-4 py-2 rounded-full shadow-lg border border-slate-100 font-medium text-sm">
              Add Asset <span className="bg-indigo-100 p-1.5 rounded-full text-indigo-600"><Wallet className="w-4 h-4" /></span>
            </button>
          </div>
        )}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-14 h-14 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'bg-slate-800 rotate-45' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
        >
          <Plus className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-50 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-white">
              <h3 className="text-lg font-bold text-slate-800">
                {addType === 'asset' && 'Add Asset'}
                {addType === 'debt' && 'Record Debt'}
                {addType === 'expense' && 'Log Expense'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4">
              <UniversalForm type={addType} onAdd={handleAdd} exchangeRate={exchangeRate} />
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          currentGoal={goal}
          currentRate={exchangeRate}
          onSave={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 pb-safe z-30 flex justify-between items-center px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('assets')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'assets' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] font-medium">Assets</span>
        </button>

        <button onClick={() => setActiveTab('debts')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'debts' ? 'text-red-600' : 'text-slate-400'}`}>
          <CreditCard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Debts</span>
        </button>

        <button onClick={() => setActiveTab('expenses')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'expenses' ? 'text-amber-600' : 'text-slate-400'}`}>
          <Receipt className="w-6 h-6" />
          <span className="text-[10px] font-medium">Daily</span>
        </button>

        <button onClick={() => setActiveTab('insights')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'insights' ? 'text-purple-600' : 'text-slate-400'}`}>
          <PieChart className="w-6 h-6" />
          <span className="text-[10px] font-medium">Report</span>
        </button>
      </nav>
    </div>
  );
};

export default App;