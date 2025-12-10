import React, { useState } from 'react';
import { Plus, Check, Briefcase, CreditCard, Receipt } from 'lucide-react';

interface UniversalFormProps {
  type: 'asset' | 'debt' | 'expense';
  onAdd: (data: any) => void;
  exchangeRate: number;
}

const UniversalForm: React.FC<UniversalFormProps> = ({ type, onAdd, exchangeRate }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'ETB'>('USD'); // Default to USD

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    let finalAmount = parseFloat(amount);
    if (currency === 'ETB') {
      finalAmount = finalAmount / exchangeRate;
    }

    if (type === 'asset') {
      onAdd({ name, value: finalAmount, category: 'Other' });
    } else if (type === 'debt') {
      onAdd({ name, amount: finalAmount });
    } else {
      onAdd({ description: name, amount: finalAmount, category: 'General' });
    }

    setName('');
    setAmount('');
  };

  const getColor = () => {
    if (type === 'asset') return 'indigo';
    if (type === 'debt') return 'red';
    return 'amber';
  };

  const color = getColor();
  const convertedAmount = currency === 'ETB' && amount ? (parseFloat(amount) / exchangeRate).toFixed(2) : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className={`p-3 rounded-xl bg-${color}-50 border border-${color}-100 flex items-center justify-between mb-2`}>
        <div className="flex items-center gap-3">
          {type === 'asset' && <Briefcase className={`w-5 h-5 text-${color}-600`} />}
          {type === 'debt' && <CreditCard className={`w-5 h-5 text-${color}-600`} />}
          {type === 'expense' && <Receipt className={`w-5 h-5 text-${color}-600`} />}
          <span className={`text-sm font-bold text-${color}-700 uppercase`}>
            {type === 'asset' ? 'New Asset' : type === 'debt' ? 'New Debt' : 'Daily Expense'}
          </span>
        </div>

        {/* Currency Toggle */}
        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${currency === 'USD' ? `bg-${color}-100 text-${color}-700` : 'text-slate-400 hover:text-slate-600'}`}
          >
            USD
          </button>
          <button
            type="button"
            onClick={() => setCurrency('ETB')}
            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${currency === 'ETB' ? `bg-${color}-100 text-${color}-700` : 'text-slate-400 hover:text-slate-600'}`}
          >
            ETB
          </button>
        </div>
      </div>

      <div>
        <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-1.5 ml-1">
          {type === 'expense' ? 'Description' : 'Name'}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={type === 'expense' ? 'e.g., Lunch' : 'e.g., Loan'}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          autoFocus
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5 ml-1">
          <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide">
            Amount ({currency})
          </label>
          {convertedAmount && (
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              ≈ ${convertedAmount} USD
            </span>
          )}
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step={currency === 'USD' ? "0.01" : "1"}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
        />
        {currency === 'ETB' && (
          <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
            Rate: 1 USD = {exchangeRate} ETB
          </p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!name || !amount}
          className={`w-full bg-${color}-600 hover:bg-${color}-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-${color}-600/20 active:scale-[0.98]`}
        >
          <Check className="w-5 h-5" />
          Save {type}
        </button>
      </div>
    </form>
  );
};

export default UniversalForm;
