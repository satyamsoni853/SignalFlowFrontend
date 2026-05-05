'use client';

import { useToast } from '../context/ToastContext';

const STYLES: Record<string, string> = {
  success: 'bg-green-600 text-white',
  error:   'bg-red-600 text-white',
  info:    'bg-zinc-800 text-white',
  alert:   'bg-amber-500 text-white',
};

const ICONS: Record<string, string> = {
  success: '✓', error: '✕', info: 'ℹ', alert: '🔔',
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg text-sm ${STYLES[t.type]}`}
        >
          <span className="shrink-0 font-bold">{ICONS[t.type]}</span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-70 hover:opacity-100">✕</button>
        </div>
      ))}
    </div>
  );
}
