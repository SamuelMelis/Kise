// AuthWrapper.tsx
import React, { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { supabase } from '../lib/supabaseClient';

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUserId } = useFinance();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Get Telegram User
      let telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

      // Local dev fallback
      if (!telegramUser && window.location.hostname === 'localhost') {
        telegramUser = {
          id: 123456789,
          first_name: 'Dev',
          last_name: 'User',
          username: 'dev_user'
        };
      }

      if (telegramUser?.id) {
        const userIdStr = telegramUser.id.toString();

        // 2. Check User in DB
        const { data: user, error } = await supabase
          .from('users')
          .select('password')
          .eq('id', userIdStr)
          .single();

        if (error || !user || !user.password) {
          // New User needing registration
          setNeedsRegistration(true);
          window.tempTelegramUser = telegramUser; // Save for registration
        } else {
          // User exists and has password -> Auto-Login per request "dont ask again"
          setUserId(userIdStr);
          setIsAuthorized(true);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [setUserId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;

    const telegramUser = window.tempTelegramUser;
    if (!telegramUser) return;

    const userIdStr = telegramUser.id.toString();

    // Create/Update User
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userIdStr,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        password: passwordInput // In production, hash this!
      });

    if (!error) {
      setUserId(userIdStr);
      setIsAuthorized(true);
    } else {
      alert("Registration failed: " + error.message);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  if (needsRegistration && !isAuthorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl">
          <h1 className="text-2xl font-bold text-[#18181b] mb-2">Welcome</h1>
          <p className="text-gray-400 text-sm mb-8">Set a secure password to protect your financial data.</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Create Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#18181b] outline-none transition-all"
                placeholder="••••••"
                autoFocus
              />
            </div>
            <button type="submit" className="w-full h-14 bg-[#18181b] text-white rounded-xl font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all">
              Start Tracking
            </button>
          </form>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
};

// Add to window type
declare global {
  interface Window {
    tempTelegramUser: any;
    Telegram: {
      WebApp: {
        initDataUnsafe: {
          user?: {
            id: number;
            username?: string;
            first_name: string;
            last_name?: string;
          };
        };
      };
    };
  }
}
