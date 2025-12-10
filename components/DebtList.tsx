import React from 'react';
import { Debt } from '../types';
import { Trash2, CreditCard, ArrowDown } from 'lucide-react';

interface DebtListProps {
  debts: Debt[];
  onDelete: (id: string) => void;
}

const DebtList: React.FC<DebtListProps> = ({ debts, onDelete }) => {
  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
          <CreditCard className="w-6 h-6 text-red-300" />
        </div>
        <p className="text-sm font-medium">Debt free! Or you haven't added any yet.</p>
      </div>
    );
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-4 pb-4">
      <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between">
        <span className="text-red-600 text-xs font-bold uppercase tracking-wide">Total Liability</span>
        <span className="text-red-700 font-bold text-lg">${totalDebt.toLocaleString()}</span>
      </div>

      <div className="space-y-2">
        {debts.map((debt) => (
          <div 
            key={debt.id} 
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-sm font-bold shrink-0">
                <ArrowDown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">{debt.name}</h4>
                <div className="text-[10px] text-slate-400">Added {new Date(debt.dateAdded).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="font-bold text-red-600 text-sm">
                -${debt.amount.toLocaleString()}
              </div>
              <button
                onClick={() => onDelete(debt.id)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebtList;
