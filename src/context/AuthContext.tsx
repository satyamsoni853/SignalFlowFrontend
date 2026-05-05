'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthUser { id: string; email: string }
interface AuthContextValue {
  user:   AuthUser | null;
  token:  string | null;
  login:  (user: AuthUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,  setUser]  = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('sf_token');
    const u = localStorage.getItem('sf_user');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
  }, []);

  const login = (user: AuthUser, token: string) => {
    localStorage.setItem('sf_token', token);
    localStorage.setItem('sf_user', JSON.stringify(user));
    setUser(user); setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
    setUser(null); setToken(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
