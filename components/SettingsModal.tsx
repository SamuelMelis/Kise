import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
    currentGoal: number;
    currentRate: number;
    onSave: (goal: number, rate: number) => void;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ currentGoal, currentRate, onSave, onClose }) => {
    const [goal, setGoal] = useState(currentGoal.toString());
    const [rate, setRate] = useState(currentRate.toString());

    const handleSave = () => {
        onSave(parseFloat(goal), parseFloat(rate));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Settings</h3>
                    <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    <div>
                        <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-1.5 ml-1">
                            Financial Goal ($)
                        </label>
                        <input
                            type="number"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-1.5 ml-1">
                            Exchange Rate (1 USD = ? ETB)
                        </label>
                        <input
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        />
                        <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                            Used to convert ETB entries to USD.
                        </p>
                    </div>



                    <div className="pt-2">
                        <button
                            onClick={handleSave}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
