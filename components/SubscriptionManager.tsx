import React, { useState } from 'react';
import { Subscription } from '../types';
import { Plus, Trash2, CalendarCheck, RotateCcw } from 'lucide-react';

interface SubscriptionManagerProps {
    subscriptions: Subscription[];
    onAdd: (name: string, amount: number) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onLogToExpenses: (subs: Subscription[]) => Promise<void>;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ subscriptions, onAdd, onDelete, onLogToExpenses }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isLogging, setIsLogging] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount) return;
        await onAdd(name, parseFloat(amount));
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
                            <span className="text-slate-900 font-bold text-sm">${sub.amount}</span>
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
                <form onSubmit={handleAdd} className="flex gap-2 items-center animate-in fade-in slide-in-from-top-2">
                    <input
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        placeholder="Netflix..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                    />
                    <input
                        className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        placeholder="$$"
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                    <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg">
                        <Plus className="w-4 h-4" />
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
