const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://signalflowbackend.onrender.com';

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string } }>(
        '/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string } }>(
        '/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
  },
  prices: {
    getAll: (token: string) =>
      request<Record<string, { symbol: string; price: number; timestamp: string }>>(
        '/api/prices', {}, token
      ),
  },
  alertRules: {
    getAll: (token: string) =>
      request<AlertRule[]>('/api/alert-rules', {}, token),
    create: (token: string, data: CreateAlertRuleDto) =>
      request<AlertRule>('/api/alert-rules', { method: 'POST', body: JSON.stringify(data) }, token),
    update: (token: string, id: string, data: Partial<CreateAlertRuleDto>) =>
      request<AlertRule>(`/api/alert-rules/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    delete: (token: string, id: string) =>
      request<void>(`/api/alert-rules/${id}`, { method: 'DELETE' }, token),
  },
};

export interface AlertRule {
  id:           string;
  asset_symbol: string;
  condition:    'GREATER_THAN' | 'LESS_THAN';
  target_price: string;
  status:       'active' | 'triggered';
  createdAt:    string;
}

export interface CreateAlertRuleDto {
  asset_symbol: string;
  condition:    'GREATER_THAN' | 'LESS_THAN';
  target_price: number;
}
