'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface PriceSnap { symbol: string; price: number; timestamp: string }

const SYMBOLS = ['BTC', 'ETH', 'NIFTY50'];

export default function PriceTicker() {
  const { token } = useAuth();
  const [prices, setPrices] = useState<Record<string, PriceSnap>>({});
  const [prev,   setPrev]   = useState<Record<string, number>>({});

  useEffect(() => {
    if (!token) return;
    const poll = async () => {
      try {
        const data = await api.prices.getAll(token);
        setPrev((p) => {
          const next: Record<string, number> = {};
          for (const s of SYMBOLS) next[s] = p[s] ?? data[s]?.price ?? 0;
          return next;
        });
        setPrices(data);
      } catch { /* silent */ }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [token]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {SYMBOLS.map((sym) => {
        const snap = prices[sym];
        const prevPrice = prev[sym] ?? 0;
        const up = snap ? snap.price >= prevPrice : null;
        return (
          <div key={sym} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{sym}</p>
            {snap ? (
              <p className={`mt-1 text-xl font-bold tabular-nums ${up ? 'text-green-500' : 'text-red-500'}`}>
                {up ? '▲' : '▼'} {snap.price.toLocaleString()}
              </p>
            ) : (
              <p className="mt-1 text-xl font-bold text-zinc-300">—</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
