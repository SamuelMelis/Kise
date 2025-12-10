import React from 'react';
import { Asset } from '../types';
import { Trash2, DollarSign, Tag, Briefcase } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
  onDelete: (id: string) => void;
}

const AssetList: React.FC<AssetListProps> = ({ assets, onDelete }) => {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
          <Briefcase className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm font-medium">No assets tracked yet.</p>
        <p className="text-xs opacity-70">Tap + to add one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {assets.map((asset) => (
        <div 
          key={asset.id} 
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group active:scale-[0.99] transition-transform duration-100"
        >
          <div className="flex items-center gap-4 overflow-hidden">
            {/* Icon Box */}
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0 shadow-inner">
              {asset.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Text Content */}
            <div className="min-w-0">
              <h4 className="font-semibold text-slate-800 truncate text-sm sm:text-base">{asset.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase tracking-wide">
                  <Tag className="w-2.5 h-2.5" />
                  {asset.category}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 pl-2">
            <div className="text-right">
              <div className="font-bold text-slate-900 text-sm sm:text-base">
                ${asset.value.toLocaleString()}
              </div>
            </div>
            
            <button
              onClick={() => onDelete(asset.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetList;