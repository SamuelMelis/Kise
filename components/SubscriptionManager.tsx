import React, { useState } from 'react';
import { Subscription } from '../types';
import { Plus, Trash2, CalendarCheck, RotateCcw } from 'lucide-react';

interface SubscriptionManagerProps {
    subscriptions: Subscription[];
    onAdd: (name: string, amount: number) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onLogToExpenses: (subs: Subscription[]) => Promise<void>;
    exchangeRate: number;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ subscriptions, onAdd, onDelete, onLogToExpenses, exchangeRate }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<'USD' | 'ETB'>('USD'); // Default to USD
    const [isAdding, setIsAdding] = useState(false);
    const [isLogging, setIsLogging] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount) return;

        let finalAmount = parseFloat(amount);
        if (currency === 'ETB') {
            finalAmount = finalAmount / exchangeRate;
        }

        await onAdd(name, finalAmount);
        setName('');
        setAmount('');
        setIsAdding(false);
    };

    const handleLog = async () => {
        if (subscriptions.length === 0) return;
        setIsLogging(true);
        await onLogToExpenses(subscriptions);
        setIsLogging(false);
        // Could show a toast here if we had one
    };

    const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-slate-500" />
                        Subscriptions
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Monthly Fixed: <span className="text-slate-700">${totalMonthly.toLocaleString()}</span></p>
                </div>

                <button
                    onClick={handleLog}
                    disabled={subscriptions.length === 0 || isLogging}
                    className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50 flex items-center gap-1.6"
                >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    {isLogging ? 'Logging...' : 'Log All'}
                </button>
            </div>

            {/* List */}
            <div className="space-y-2 mb-4">
                {subscriptions.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                        <div className="font-medium text-slate-700 text-sm">{sub.name}</div>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-900 font-bold text-sm">${sub.amount.toFixed(2)}</span>
                            <button onClick={() => onDelete(sub.id)} className="text-slate-400 hover:text-red-500">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}

                {subscriptions.length === 0 && !isAdding && (
                    <div className="text-center py-4 text-slate-400 text-xs italic">
                        No subscriptions yet.
                    </div>
                )}
            </div>

            {/* Add New */}
            {isAdding ? (
                <form onSubmit={handleAdd} className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">New Subscription</span>
                        <div className="flex bg-white rounded-md p-0.5 border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setCurrency('USD')}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${currency === 'USD' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'}`}
                            >
                                USD
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrency('ETB')}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${currency === 'ETB' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'}`}
                            >
                                ETB
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="Usage (e.g. Netflix)"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                        <input
                            className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder={currency}
                            type="number"
                            step={currency === 'USD' ? "0.01" : "1"}
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-xs mt-1 shadow-sm hover:bg-indigo-700 transition-colors">
                        Add Subscription
                    </button>
                </form>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-2 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center gap-1"
                >
                    <Plus className="w-3 h-3" /> Add Subscription
                </button>
            )}
        </div>
    );
};

export default SubscriptionManager;
