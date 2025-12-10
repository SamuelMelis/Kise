import React from 'react';
import { Expense } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, Calendar, AlertTriangle } from 'lucide-react';

interface MonthlyReportProps {
  expenses: Expense[];
}

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#64748b'];

const MonthlyReport: React.FC<MonthlyReportProps> = ({ expenses }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.dateOccurred);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const dataMap = monthlyExpenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(dataMap)
    .map(([name, value]: [string, number]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-4 pb-4">
        
      {/* Summary Card */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-center justify-between">
        <div>
          <h3 className="text-amber-800 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            {monthName} Spending
          </h3>
          <div className="text-2xl font-bold text-amber-900">
            ${totalSpent.toLocaleString()}
          </div>
        </div>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm">
            <TrendingDown className="w-5 h-5" />
        </div>
      </div>

      {monthlyExpenses.length > 0 ? (
        <>
        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 h-64">
           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Category Breakdown</h4>
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
                <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
            </PieChart>
           </ResponsiveContainer>
        </div>

        {/* Top Spending List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Top Categories</h4>
            </div>
            {data.map((item, idx) => (
                <div key={item.name} className="flex justify-between items-center p-3 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">${item.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center">
            <p className="text-slate-400 text-sm">No spending recorded for {monthName} yet.</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyReport;