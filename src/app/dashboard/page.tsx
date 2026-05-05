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

  const handleAlert = useCallback(
    (alert: { assetSymbol: string; condition: string; targetPrice: number; triggeredPrice: number }) => {
      const dir = alert.condition === 'GREATER_THAN' ? 'above' : 'below';
      toast(
        `🔔 ${alert.assetSymbol} hit ${alert.triggeredPrice.toLocaleString()} (target ${dir} ${alert.targetPrice.toLocaleString()})`,
        'alert'
      );
      // Refresh rules list so status updates are reflected
      setRulesRefresh((n) => n + 1);
    },
    [toast]
  );

  const { status } = useAlertStream(token, handleAlert);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Navbar */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">SignalFlow</span>
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} title={`SSE: ${status}`} />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">{user.email}</span>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 flex flex-col gap-8">
        {/* Live Prices */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">Live Prices</h2>
          <PriceTicker />
        </section>

        {/* Create Rule */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">New Alert</h2>
          <CreateRuleForm onCreated={() => setRulesRefresh((n) => n + 1)} />
        </section>

        {/* Rules List */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">Your Rules</h2>
          <AlertRuleList refresh={rulesRefresh} />
        </section>
      </main>
    </div>
  );
}
