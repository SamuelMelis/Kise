import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from 'recharts';
import { HistoryItem } from '../types';
import { History } from 'lucide-react';

interface HistoryChartProps {
    history: HistoryItem[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
    const [timeRange, setTimeRange] = React.useState<'7D' | '30D' | '3M' | '1Y' | 'ALL'>('ALL');

    if (history.length < 2) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <History className="w-5 h-5" />
                </div>
                <p className="text-slate-400 text-sm">Not enough history yet.</p>
                <p className="text-xs text-slate-300">Check back tomorrow!</p>
            </div>
        );
    }

    // Deduplicate history by date (take the latest entry for each date)
    const uniqueHistoryMap = new Map();
    history.forEach(h => {
        const dateStr = new Date(h.date).toLocaleDateString();
        uniqueHistoryMap.set(dateStr, h);
    });

    let uniqueHistory = Array.from(uniqueHistoryMap.values()).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Filter by Time Range
    const now = new Date();
    uniqueHistory = uniqueHistory.filter((h: any) => {
        if (timeRange === 'ALL') return true;
        const itemDate = new Date(h.date);
        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (timeRange === '7D') return diffDays <= 7;
        if (timeRange === '30D') return diffDays <= 30;
        if (timeRange === '3M') return diffDays <= 90;
        if (timeRange === '1Y') return diffDays <= 365;
        return true;
    });

    // Ensure we have at least some data to show, else show full history or empty state
    if (uniqueHistory.length === 0) {
        // Fallback if filter excludes everything (e.g. user selects 7D but only has old data)
        // Optionally show a message or just show what we have. Let's show empty for correctness.
    }

    // Calculate domain for Y-axis (min/max with some padding)
    const dataValues = uniqueHistory.map((h: any) => h.net_worth);
    const minVal = Math.min(...dataValues);
    const maxVal = Math.max(...dataValues);
    const padding = (maxVal - minVal) * 0.1 || 100; // Default padding if flat line

    const data = uniqueHistory.map((h: any) => ({
        date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        val: h.net_worth
    }));

    const isGrowing = data.length > 1 ? data[data.length - 1].val >= data[0].val : true;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Net Worth History</h4>

                {/* Time Range Selector */}
                <div className="flex bg-slate-100 rounded-lg p-0.5">
                    {(['7D', '30D', '3M', '1Y', 'ALL'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${timeRange === range
                                    ? 'bg-white text-slate-700 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isGrowing ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={isGrowing ? "#10b981" : "#ef4444"} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            hide={true}
                            domain={[minVal - padding, maxVal + padding]}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
                        />
                        <Area
                            type="monotone"
                            dataKey="val"
                            stroke={isGrowing ? "#10b981" : "#ef4444"}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorVal)"
                            dot={{ r: 4, fill: isGrowing ? "#10b981" : "#ef4444", strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HistoryChart;
