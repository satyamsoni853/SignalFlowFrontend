'use client';

import { useState } from 'react';
import { api, CreateAlertRuleDto } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SYMBOLS   = ['BTC', 'ETH', 'NIFTY50'];
const CONDITIONS = [
  { value: 'GREATER_THAN', label: 'Greater than ▲' },
  { value: 'LESS_THAN',    label: 'Less than ▼' },
];

export default function CreateRuleForm({ onCreated }: { onCreated: () => void }) {
  const { token } = useAuth();
  const { toast }  = useToast();
  const [form, setForm] = useState<CreateAlertRuleDto>({
    asset_symbol: 'BTC',
    condition:    'GREATER_THAN',
    target_price: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (form.target_price <= 0) { toast('Target price must be positive', 'error'); return; }
    setLoading(true);
    try {
      await api.alertRules.create(token, form);
      toast(`Alert rule created for ${form.asset_symbol}`, 'success');
      setForm({ asset_symbol: 'BTC', condition: 'GREATER_THAN', target_price: 0 });
      onCreated();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to create rule', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="font-semibold text-zinc-800 dark:text-zinc-100">New Alert Rule</h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Asset</label>
          <select
            value={form.asset_symbol}
            onChange={(e) => setForm((f) => ({ ...f, asset_symbol: e.target.value }))}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
          >
            {SYMBOLS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Condition</label>
          <select
            value={form.condition}
            onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as CreateAlertRuleDto['condition'] }))}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
          >
            {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Target Price</label>
          <input
            type="number"
            min="0"
            step="any"
            value={form.target_price || ''}
            onChange={(e) => setForm((f) => ({ ...f, target_price: parseFloat(e.target.value) || 0 }))}
            placeholder="e.g. 70000"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="self-end rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {loading ? 'Creating…' : 'Create Rule'}
      </button>
    </form>
  );
}
