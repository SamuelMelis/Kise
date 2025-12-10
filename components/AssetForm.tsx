import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AssetFormProps {
  onAdd: (name: string, value: number, category: string) => void;
}

const CATEGORIES = [
  "Cash",
  "Stocks",
  "Crypto",
  "Real Estate",
  "Savings",
  "Vehicle",
  "Electronics",
  "Collectibles",
  "Other"
];

const AssetForm: React.FC<AssetFormProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('Cash');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;

    onAdd(name, parseFloat(value), category);
    setName('');
    setValue('');
    setCategory('Cash');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-1.5 ml-1">Asset Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Bitcoin, Tesla Stock"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          autoFocus
        />
      </div>
      
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-1.5 ml-1">Value ($)</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>
        <div className="w-1/2">
           <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-1.5 ml-1">Category</label>
           <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none"
           >
             {CATEGORIES.map(cat => (
               <option key={cat} value={cat}>{cat}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!name || !value}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Add Asset
        </button>
      </div>
    </form>
  );
};

export default AssetForm;