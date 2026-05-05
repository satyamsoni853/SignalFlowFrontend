'use client';

import { useAlertStream, AlertEvent } from '../hooks/useAlertStream';

interface Props {
  token: string | null;
}

const STATUS_COLORS = {
  connected:    'bg-green-500',
  connecting:   'bg-yellow-400',
  disconnected: 'bg-red-500',
};

function AlertCard({ alert }: { alert: AlertEvent }) {
  const dir = alert.condition === 'GREATER_THAN' ? '▲' : '▼';
  const time = new Date(alert.triggeredAt).toLocaleTimeString();

  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <span className="mt-0.5 text-lg">{dir}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
          {alert.assetSymbol} alert triggered
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Target: {alert.targetPrice} &nbsp;|&nbsp; Hit: {alert.triggeredPrice}
        </p>
      </div>
      <span className="shrink-0 text-xs text-zinc-400">{time}</span>
    </div>
  );
}

export default function AlertFeed({ token }: Props) {
  const { alerts, status, clearAlerts } = useAlertStream(token);

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
          <span className="text-sm font-medium capitalize text-zinc-600 dark:text-zinc-300">
            {status}
          </span>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={clearAlerts}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Alert list */}
      {alerts.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          No alerts yet — waiting for triggers...
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <li key={`${alert.ruleId}-${alert.triggeredAt}`}>
              <AlertCard alert={alert} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
