import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { CATEGORIES } from '../constants';
import { TrendingUp, Calendar } from 'lucide-react';

// Sophisticated Palette for "A Bit of Color"
// Obsidian, Electric Blue, Teal, Amber, Violet, Rose
const COLORS = ['#18181b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e'];

export const ReportsTab: React.FC = () => {
  const { expenses } = useFinance();
  const [viewPeriod, setViewPeriod] = useState<'Week' | 'Month'>('Week');

  // 1. Category Data Calculation
  const categoryData = CATEGORIES.map(cat => {
    const total = expenses
      .filter(e => e.category === cat.value)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name: cat.label, value: total };
  }).filter(item => item.value > 0).sort((a, b) => b.value - a.value);

  // 2. Trend Data Calculation
  const daysToShow = viewPeriod === 'Week' ? 7 : 30;
  const trendData = Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse().map(date => {
    const total = expenses
      .filter(e => e.date === date)
      .reduce((sum, e) => sum + e.amount, 0);
    const dateObj = new Date(date);
    return {
      name: viewPeriod === 'Week' ? dateObj.toLocaleDateString('en-US', { weekday: 'short' }) : dateObj.getDate().toString(),
      fullDate: date,
      amount: total
    };
  });

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const avgDaily = totalSpent / (expenses.length > 0 ? new Set(expenses.map(e => e.date)).size : 1);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-500">

      {/* Header */}
      <div className="pt-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#18181b] mb-1">Analytics</h2>
          <p className="text-sm text-gray-500 font-medium">Spending insights & trends</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewPeriod('Week')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewPeriod === 'Week' ? 'bg-white text-[#18181b] shadow-sm' : 'text-gray-400'}`}
          >
            7D
          </button>
          <button
            onClick={() => setViewPeriod('Month')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewPeriod === 'Month' ? 'bg-white text-[#18181b] shadow-sm' : 'text-gray-400'}`}
          >
            30D
          </button>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 rounded-md text-blue-600">
              <TrendingUp size={16} />
            </div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Lifetime</span>
          </div>
          <div className="text-xl font-bold text-[#18181b] tracking-tight">{totalSpent.toLocaleString()}</div>
          <div className="text-[10px] font-medium text-gray-400 mt-1">Total ETB Spent</div>
        </div>

        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-600">
              <Calendar size={16} />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Daily Avg</span>
          </div>
          <div className="text-xl font-bold text-[#18181b] tracking-tight">{Math.round(avgDaily).toLocaleString()}</div>
          <div className="text-[10px] font-medium text-gray-400 mt-1">ETB / Day</div>
        </div>
      </div>

      {/* Spending Breakdown (Pie Chart) */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
          Category Allocation
        </h3>

        {categoryData.length > 0 ? (
          <div className="grid grid-cols-[1.1fr_0.9fr] items-center gap-6 pr-4">
            {/* Pie Chart Left */}
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="stroke-white stroke-2"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: 'white', color: '#18181b', padding: '12px' }}
                    itemStyle={{ color: '#18181b', fontWeight: 'bold', fontSize: '11px' }}
                    formatter={(value: number) => [`${value.toLocaleString()} ETB`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Vertical Legend Right */}
            <div className="flex flex-col gap-2.5 border-l border-gray-50 pl-6 py-2">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-3 group transition-transform hover:translate-x-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{entry.name}</span>
                    <span className="text-[9px] font-bold text-gray-300 font-mono">({entry.value.toLocaleString()})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
            No Expense Data
          </div>
        )}
      </section>

      {/* Spend Trend (Bar/Area Chart) */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Spending Trend</h3>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">ETB</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} barSize={viewPeriod === 'Week' ? 32 : 8}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#18181b" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3f3f46" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9ca3af', fontWeight: 600 }}
                dy={10}
                interval={viewPeriod === 'Month' ? 5 : 0}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: '#f3f4f6', radius: 6 }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#18181b', color: 'white' }}
                itemStyle={{ color: 'white', fontWeight: 'bold' }}
                formatter={(value: number) => [`${value} ETB`, '']}
                labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
              />
              <Bar
                dataKey="amount"
                fill="url(#colorBar)"
                radius={[6, 6, 6, 6]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
};