import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, Lightbulb } from 'lucide-react';
import { Asset } from '../types';
import { getPortfolioInsight } from '../services/geminiService';

interface AiCoachProps {
  assets: Asset[];
  goal: number;
  totalValue: number;
}

const AiCoach: React.FC<AiCoachProps> = ({ assets, goal, totalValue }) => {
  const [insight, setInsight] = useState<string>("");
  const [tip, setTip] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    if (assets.length === 0) return;
    setLoading(true);
    const result = await getPortfolioInsight(assets, goal, totalValue);
    setInsight(result.insight);
    setTip(result.tip);
    setLoading(false);
  };

  // Initial fetch when assets change significantly (debouncing logic handled by user action for now or simple effect)
  // To avoid spamming API on every keystroke, we'll give the user a button, but also auto-run on mount if data exists
  useEffect(() => {
    if (assets.length > 0 && !insight) {
      fetchInsight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  if (assets.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-6 border border-violet-100 mb-6 relative">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-violet-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          ኪሴ AI Coach
        </h3>
        <button 
          onClick={fetchInsight} 
          disabled={loading}
          className="text-violet-400 hover:text-violet-700 transition-colors"
          title="Refresh Insight"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="animate-pulse flex flex-col gap-2">
             <div className="h-4 bg-violet-200 rounded w-3/4"></div>
             <div className="h-4 bg-violet-200 rounded w-1/2"></div>
           </div>
        ) : insight ? (
          <>
            <p className="text-violet-800 text-sm leading-relaxed border-l-2 border-violet-300 pl-3">
              "{insight}"
            </p>
            <div className="bg-white/60 rounded-xl p-3 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-violet-900 uppercase tracking-wide block mb-1">Smart Tip</span>
                <p className="text-sm text-violet-700 italic">{tip}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-violet-400 text-sm italic">Tap refresh to analyze your portfolio...</p>
        )}
      </div>
    </div>
  );
};

export default AiCoach;