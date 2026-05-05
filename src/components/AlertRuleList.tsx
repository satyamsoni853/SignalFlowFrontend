'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, AlertRule } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STATUS_BADGE: Record<string, string> = {
  active:    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  triggered: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

export default function AlertRuleList({ refresh }: { refresh: number }) {
  const { token } = useAuth();
  const { toast }  = useToast();
  const [rules,   setRules]   = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.alertRules.getAll(token);
      setRules(data);
    } catch {
      toast('Failed to load alert rules', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => { fetchRules(); }, [fetchRules, refresh]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await api.alertRules.delete(token, id);
      setRules((r) => r.filter((rule) => rule.id !== id));
      toast('Rule deleted', 'success');
    } catch {
      toast('Failed to delete rule', 'error');
    }
  };

  if (loading) return <p className="text-sm text-zinc-400">Loading rules…</p>;
  if (rules.length === 0) return <p className="text-sm text-zinc-400">No alert rules yet.</p>;

  return (
    <div className="flex flex-col gap-2">
      {rules.map((rule) => (
        <div key={rule.id} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-zinc-800 dark:text-zinc-100 w-16">{rule.asset_symbol}</span>
            <span className="text-sm text-zinc-500">
              {rule.condition === 'GREATER_THAN' ? '▲ above' : '▼ below'} {Number(rule.target_price).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[rule.status]}`}>
              {rule.status}
            </span>
            <button
              onClick={() => handleDelete(rule.id)}
              className="text-xs text-zinc-400 hover:text-red-500"
              aria-label="Delete rule"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
