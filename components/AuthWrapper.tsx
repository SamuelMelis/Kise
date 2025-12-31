// AuthWrapper.tsx
import React, { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { supabase } from '../lib/supabaseClient';
import { X } from 'lucide-react';

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUserId } = useFinance();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      console.log("NomadFinance: Initializing Auth...");
      try {
        // 1. Get Telegram User
        let telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

        // Local dev fallback
        if (!telegramUser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          console.log("NomadFinance: Using local dev mock user");
          telegramUser = {
            id: 123456789,
            first_name: 'Dev',
            last_name: 'User',
            username: 'dev_user'
          };
        }

        if (telegramUser?.id) {
          const userIdStr = telegramUser.id.toString();
          console.log("NomadFinance: Auth for User ID:", userIdStr);

          // 2. Check User in DB
          const { data: user, error: supabaseError } = await supabase
            .from('users')
            .select('password')
            .eq('id', userIdStr)
            .single();

          if (supabaseError && supabaseError.code !== 'PGRST116') {
            console.error("NomadFinance: Supabase Error during auth:", supabaseError);
            setError(`Database connection error: ${supabaseError.message}`);
          } else if (!user || !user.password) {
            console.log("NomadFinance: No user found or no password set. Need registration.");
            setNeedsRegistration(true);
            window.tempTelegramUser = telegramUser;
          } else {
            console.log("NomadFinance: User authenticated successfully.");
            setUserId(userIdStr);
            setIsAuthorized(true);
          }
        } else {
          console.log("NomadFinance: No Telegram user found and not on localhost.");
        }
      } catch (err: any) {
        console.error("NomadFinance: Critical Auth Init Error:", err);
        setError(err.message || "An unknown error occurred during initialization.");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUserId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;

    setLoading(true);
    try {
      const telegramUser = window.tempTelegramUser;
      if (!telegramUser) throw new Error("Telegram user session lost. Please reload.");

      const userIdStr = telegramUser.id.toString();

      // Create/Update User
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: userIdStr,
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          password: passwordInput // In production, hash this!
        });

      if (!upsertError) {
        setUserId(userIdStr);
        setIsAuthorized(true);
      } else {
        throw new Error(upsertError.message);
      }
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-[#18181b] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading NomadFinance...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-red-50">
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <X size={24} />
      </div>
      <h2 className="text-lg font-bold text-red-900 mb-2">Startup Failed</h2>
      <p className="text-red-700 text-xs text-center max-w-xs">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest"
      >
        Retry
      </button>
    </div>
  );

  if (needsRegistration && !isAuthorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-white overflow-hidden">
        <div className="w-full max-w-sm bg-white p-10 rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-gray-100">
          <div className="w-16 h-16 bg-[#18181b] rounded-3xl flex items-center justify-center mb-8 shadow-xl">
            <div className="w-1.5 h-6 bg-white rounded-full mx-0.5" />
            <div className="w-1.5 h-8 bg-white/50 rounded-full mx-0.5" />
            <div className="w-1.5 h-10 bg-white/30 rounded-full mx-0.5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-[#18181b] mb-2">Welcome</h1>
          <p className="text-gray-400 text-sm font-medium mb-10">Set a password to secure your NomadFinance data.</p>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Master Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full h-16 px-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#18181b]/5 outline-none transition-all text-lg font-mono tracking-widest"
                placeholder="••••••"
                autoFocus
                required
              />
            </div>
            <button type="submit" className="w-full h-16 bg-gradient-to-br from-[#18181b] to-[#27272a] text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
              Get Started
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8 bg-[#18181b] text-white">
        <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center mb-10 animate-pulse">
          <div className="w-6 h-6 rounded-full border-2 border-white/50" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Syncing to Telegram...</h2>
        <p className="text-gray-400 text-center text-sm font-medium max-w-xs mb-10 leading-relaxed">
          Open this app directly through your @NomadFinancePro_bot to access your dashboard.
        </p>
        <div className="w-full max-w-xs h-px bg-white/5 mb-10" />
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Session Restricted</p>
      </div>
    );
  }

  return <>{children}</>;
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
        openLink: (url: string) => void;
        initData: string;
      };
    };
  }
}
