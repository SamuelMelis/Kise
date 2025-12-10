import React from 'react';
import { Target, TrendingUp, AlertCircle, Edit2, ShieldCheck, ShieldAlert } from 'lucide-react';

interface NetWorthCardProps {
  assetsTotal: number;
  debtsTotal: number;
  goal: number;
  setGoal: (val: number) => void;
}

const NetWorthCard: React.FC<NetWorthCardProps> = ({ assetsTotal, debtsTotal, goal, setGoal }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempGoal, setTempGoal] = React.useState(goal.toString());

  const netWorth = assetsTotal - debtsTotal;
  const progress = Math.min(100, Math.max(0, (netWorth / (goal || 1)) * 100));
  
  const handleGoalSubmit = () => {
    const num = parseFloat(tempGoal);
    if (!isNaN(num) && num > 0) {
      setGoal(num);
      setIsEditing(false);
    }
  };

  const isPositive = netWorth >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 relative overflow-hidden">
      {/* Background Decor */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-60 pointer-events-none ${isPositive ? 'bg-indigo-50' : 'bg-red-50'}`}></div>

      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            {isPositive ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldAlert className="w-3.5 h-3.5 text-red-500" />}
            Net Worth
          </h2>
          <div className={`text-3xl font-bold tracking-tight ${isPositive ? 'text-slate-900' : 'text-red-600'}`}>
            ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className={`text-right px-2 py-1 rounded-lg ${progress >= 100 ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
           <div className="font-bold text-sm">
             {progress.toFixed(0)}%
           </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm text-slate-500 relative z-10">
        <span>Goal:</span>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={tempGoal}
              onChange={(e) => setTempGoal(e.target.value)}
              className="w-24 border-b border-indigo-500 focus:outline-none text-slate-900 bg-transparent font-medium p-0"
              autoFocus
            />
            <button 
              onClick={handleGoalSubmit}
              className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded"
            >
              Save
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 font-medium hover:text-indigo-600 transition-colors border-b border-dashed border-slate-300 hover:border-indigo-600"
          >
            ${goal.toLocaleString()}
            <Edit2 className="w-3 h-3 opacity-50" />
          </button>
        )}
      </div>

      <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${
            progress >= 100 ? 'bg-gradient-to-r from-green-400 to-emerald-600' : 
            isPositive ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-red-500'
          }`}
          style={{ width: `${isPositive ? progress : 100}%` }}
        >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      
      <div className="mt-3 flex gap-4">
        <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Assets</span>
            <span className="text-xs font-semibold text-emerald-600">+${assetsTotal.toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Debts</span>
            <span className="text-xs font-semibold text-red-500">-${debtsTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default NetWorthCard;
