// AuthWrapper.tsx
import React, { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { supabase } from '../lib/supabaseClient';

const ALLOWED_USERNAME = 'Samuel_Melis';

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUserId } = useFinance();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Get Telegram User
      let telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

      // Local dev fallback
      if (!telegramUser && window.location.hostname === 'localhost') {
        telegramUser = {
          id: 123456789,
          first_name: 'Samuel',
          last_name: 'Melis',
          username: 'Samuel_Melis'
        };
      }

      // Check if username matches
      if (telegramUser?.username === ALLOWED_USERNAME) {
        const userIdStr = telegramUser.id.toString();

        // Ensure user exists in DB
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('id', userIdStr)
          .single();

        if (!user) {
          // Create user if doesn't exist
          await supabase.from('users').upsert({
            id: userIdStr,
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            password: 'auto_created' // Placeholder since we're not using passwords
          });
        }

        setUserId(userIdStr);
        setIsAuthorized(true);
      } else {
        setAccessDenied(true);
      }

      setLoading(false);
    };

    initAuth();
  }, [setUserId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#18181b]">
        <div className="text-white text-sm font-bold uppercase tracking-widest animate-pulse">Loading...</div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-[#18181b] text-white">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3">Access Denied</h2>
        <p className="text-gray-400 text-center text-sm max-w-xs mb-6">
          This app is restricted to authorized users only.
        </p>
        <div className="px-6 py-3 bg-white/10 rounded-xl">
          <span className="text-xs font-mono text-gray-300">NOT YOUR ኪስ</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-[#18181b] text-white">
        <h2 className="text-xl font-bold mb-4">Open in Telegram</h2>
        <p className="text-gray-400 text-center text-sm mb-6">
          NomadFinance is designed as a Telegram Mini App. Please open it using your Telegram bot.
        </p>
        <div className="p-4 bg-white/10 rounded-xl">
          <span className="text-xs font-mono text-gray-300">@{window.location.hostname}</span>
        </div>
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
      };
    };
  }
}
