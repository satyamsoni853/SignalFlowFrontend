'use client';

import { useEffect, useRef, useState } from 'react';

export interface AlertEvent {
  ruleId:         string;
  assetSymbol:    string;
  condition:      string;
  targetPrice:    number;
  triggeredPrice: number;
  triggeredAt:    string;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export function useAlertStream(
  token: string | null,
  onAlert?: (alert: AlertEvent) => void
) {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const esRef               = useRef<EventSource | null>(null);
  const retryRef            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount          = useRef(0);
  const onAlertRef          = useRef(onAlert);
  onAlertRef.current        = onAlert; // keep stable ref

  useEffect(() => {
    if (!token) return;

    function connect() {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const es   = new EventSource(`${base}/events?token=${encodeURIComponent(token!)}`);
      esRef.current = es;
      setStatus('connecting');

      es.addEventListener('connected', () => {
        setStatus('connected');
        retryCount.current = 0;
      });

      es.addEventListener('alert', (e: MessageEvent) => {
        try {
          const alert: AlertEvent = JSON.parse(e.data);
          setAlerts((prev) => [alert, ...prev].slice(0, 50));
          onAlertRef.current?.(alert);
        } catch { /* ignore parse errors */ }
      });

      es.onerror = () => {
        es.close();
        setStatus('disconnected');
        if (retryCount.current < 5) {
          const delay = Math.min(1000 * 2 ** retryCount.current, 30_000);
          retryCount.current += 1;
          retryRef.current = setTimeout(connect, delay);
        }
      };
    }

    connect();
    return () => {
      esRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [token]);

  return { alerts, status, clearAlerts: () => setAlerts([]) };
}
