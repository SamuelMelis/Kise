import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../constants';
import {
  Plus,
  X,
  Utensils,
  Car,
  Home,
  Wifi,
  Coffee,
  Layers,
  Repeat
} from 'lucide-react';
import { Category } from '../types';

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  Food: Utensils,
  Coffee: Coffee,
  Transport: Car,
  Rent: Home,
  Internet: Wifi,
  Entertainment: Coffee,
  Other: Layers,
};

export const ExpensesTab: React.FC = () => {
  const { expenses, addExpense, settings, deleteExpense, setIsInputActive } = useFinance();
  const [isAdding, setIsAdding] = useState(false);

  const toggleAdding = (value: boolean) => {
    setIsAdding(value);
    setIsInputActive(value);
  };

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    addExpense({
      title: note || category, // Use note as title, fallback to category
      amount: parseFloat(amount), // Context expects 'amount'
      // amountETB: parseFloat(amount), // Remove incorrect property
      category,
      date,
      isRecurring,
      note,
      frequency: isRecurring ? 'Monthly' : undefined
    });

    setAmount('');
    setNote('');
    setIsRecurring(false);
    toggleAdding(false);
  };

  const groupedExpenses = useMemo(() => {
    const grouped: Record<string, typeof expenses> = {};
    expenses.forEach(exp => {
      if (!grouped[exp.date]) grouped[exp.date] = [];
      grouped[exp.date].push(exp);
    });
    return Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [expenses]);

  const spentMonth = expenses
    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex justify-between items-end mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#18181b]">Expenses</h1>
          <p className="text-sm text-gray-500 font-medium">Track your spending</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total (Month)</div>
          <div className="text-xl font-bold text-[#18181b] tracking-tight">{spentMonth.toLocaleString()} ETB</div>
        </div>
      </div>

      {/* Add Expense Button */}
      {!isAdding && (
        <button
          onClick={() => toggleAdding(true)}
          className="w-full bg-gradient-to-br from-[#18181b] to-[#27272a] text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-10 group"
        >
          <span className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center">
            <Plus size={14} />
          </span>
          Add Expense
        </button>
      )}

      {/* Add Expense Form */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] bg-white p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold tracking-tight text-[#18181b]">New Expense</h3>
              <button
                onClick={() => toggleAdding(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-[#18181b] flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount Input */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Amount (ETB)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full text-4xl font-bold tracking-tighter py-1 border-b border-gray-200 focus:border-[#18181b] outline-none bg-transparent placeholder-gray-200 text-[#18181b] font-mono"
                  placeholder="0"
                  autoFocus
                  required
                />
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 font-medium">
                  <span>≈ ${(amount ? (parseFloat(amount) / settings.exchangeRate) : 0).toFixed(2)} USD</span>
                </div>
              </div>

              {/* Category Grid */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Select Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => {
                    const Icon = CATEGORY_ICONS[cat.value as Category];
                    const isSelected = category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value as Category)}
                        className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border-2 ${isSelected
                          ? 'bg-[#18181b] text-white border-[#18181b] shadow-md scale-[1.02]'
                          : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                          }`}
                      >
                        <Icon size={16} strokeWidth={isSelected ? 2 : 1.5} />
                        <span className="text-[9px] font-bold uppercase tracking-tight">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date & Note</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full h-12 pl-3 pr-2 bg-gray-50 rounded-xl text-xs font-bold text-[#18181b] border-none focus:ring-2 focus:ring-[#18181b]/5 outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Note"
                      className="flex-[1.5] h-12 pl-3 bg-gray-50 rounded-xl text-xs font-medium text-[#18181b] border-none focus:ring-2 focus:ring-[#18181b]/5 outline-none placeholder-gray-400"
                    />
                  </div>
                </div>

                {settings.recurringEnabled && (
                  <div
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isRecurring ? 'bg-[#18181b] border-[#18181b] text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-tight">Recurring Monthly</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isRecurring ? 'border-white bg-white' : 'border-gray-300'}`}>
                      {isRecurring && <div className="w-2 h-2 rounded-full bg-[#18181b]" />}
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-gradient-to-br from-[#18181b] to-[#27272a] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-900 transition-colors shadow-lg">
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="space-y-10">
        {groupedExpenses.map(([day, dayExpenses]) => {
          const isToday = day === new Date().toISOString().split('T')[0];

          return (
            <div key={day}>
              <div className="flex items-center gap-4 mb-4">
                <h4 className={`text-sm font-bold uppercase tracking-widest ${isToday ? 'text-[#18181b]' : 'text-gray-400'}`}>
                  {new Date(day).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                </h4>
                <div className="h-px bg-gray-100 flex-1"></div>
              </div>

              <div className="space-y-4">
                {dayExpenses.map((expense) => {
                  const Icon = CATEGORY_ICONS[expense.category] || Layers;
                  return (
                    <div key={expense.id} className="group relative bg-white flex items-center justify-between p-2 rounded-xl transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#18181b] border border-gray-100 group-hover:border-[#18181b] transition-colors">
                          <Icon size={20} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="font-bold text-[#18181b] text-sm">{expense.category}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            {expense.isRecurring && <Repeat size={10} className="text-[#18181b]" />}
                            <span>
                              {expense.note || (expense.isRecurring ? 'Recurring' : 'One-time')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-[#18181b] text-sm">{expense.amount.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-400 font-mono">ETB</div>
                        </div>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-[#18181b] hover:bg-gray-100 rounded-full transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {groupedExpenses.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl m-4">
            <p className="text-gray-300 text-sm font-bold uppercase tracking-widest mb-4">No Data</p>
            <p className="text-xs text-gray-400 max-w-[150px]">Tap the button above to start tracking your expenses.</p>
          </div>
        )}
      </div>
    </div >
  );
};