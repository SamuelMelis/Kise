import React from 'react';
import { Expense } from '../types';
import { Trash2, Receipt, Calendar } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
          <Receipt className="w-6 h-6 text-amber-300" />
        </div>
        <p className="text-sm font-medium">No expenses today.</p>
      </div>
    );
  }

  // Group by date
  const grouped = expenses.reduce((groups, expense) => {
    const date = new Date(expense.dateOccurred).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  return (
    <div className="space-y-6 pb-4">
      {Object.entries(grouped).map(([date, items]: [string, Expense[]]) => (
        <div key={date}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 ml-1">
            <Calendar className="w-3 h-3" />
            {date === new Date().toLocaleDateString() ? 'Today' : date}
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-3.5 ${index !== items.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {item.category.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{item.description}</h4>
                    <div className="text-[10px] text-slate-400">{item.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="font-bold text-slate-900 text-sm">
                    -${item.amount.toLocaleString()}
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;