'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAlertStream } from '../../hooks/useAlertStream';
import PriceTicker from '../../components/PriceTicker';
import CreateRuleForm from '../../components/CreateRuleForm';
import AlertRuleList from '../../components/AlertRuleList';

const STATUS_DOT: Record<string, string> = {
  connected:    'bg-green-500',
  connecting:   'bg-yellow-400',
  disconnected: 'bg-zinc-400',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const [rulesRefresh, setRulesRefresh] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (token === null && typeof window !== 'undefined') {
      const stored = localStorage.getItem('sf_token');
      if (!stored) router.push('/login');
    }
  }, [token, router]);

  // Audio beep for notifications
  const playPing = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch(e) {}
  }, []);

  const handleAlert = useCallback(
    (alert: { assetSymbol: string; condition: string; targetPrice: number; triggeredPrice: number }) => {
      const dir = alert.condition === 'GREATER_THAN' ? 'above' : 'below';
      toast(
        `🔔 ${alert.assetSymbol} hit ${alert.triggeredPrice.toLocaleString()} (target ${dir} ${alert.targetPrice.toLocaleString()})`,
        'alert'
      );
      playPing(); // 🎵 Play sound!
      // Refresh rules list so status updates are reflected
      setRulesRefresh((n) => n + 1);
    },
    [toast, playPing]
  );

  const { status } = useAlertStream(token, handleAlert);

  // Dark Mode Toggle State
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
      {/* Navbar */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 transition-colors duration-300">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Kapoor Signal Flow</span>
            <span className={`h-2 w-2 rounded-full shadow-sm ${STATUS_DOT[status]}`} title={`SSE: ${status}`} />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500 hidden sm:inline">{user.email}</span>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 flex flex-col gap-8">
        {/* Live Prices */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Live Prices</h2>
            <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">Updates every 5s</span>
          </div>
          <PriceTicker />
        </section>

        {/* Create Rule */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">New Alert Rule</h2>
          <CreateRuleForm onCreated={() => setRulesRefresh((n) => n + 1)} />
        </section>

        {/* Rules List */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">Your Active Rules</h2>
          <AlertRuleList refresh={rulesRefresh} />
        </section>
      </main>
    </div>
  );
}
