"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getPublicApiBase } from "@/lib/apiBase";

const API_BASE = getPublicApiBase();
const TOKEN_KEY = "vex_token";
const REFRESH_KEY = "vex_refresh";

export interface User {
  id: string;
  email: string;
  role: string;
  name: string | null;
  phone: string | null;
  tier: string | null;
  createdAt: string;
  updatedAt: string;
}

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function refreshSession(refreshToken: string): Promise<{ token: string; refreshToken: string } | null> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { token: string; refreshToken: string };
  if (!data.token || !data.refreshToken) return null;
  return { token: data.token, refreshToken: data.refreshToken };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((t: string | null) => {
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
      }
    }
    setTokenState(t);
    if (!t) setUser(null);
  }, []);

  const persistSession = useCallback((access: string, refresh: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, access);
      localStorage.setItem(REFRESH_KEY, refresh);
    }
    setTokenState(access);
  }, []);

  const fetchUser = useCallback(
    async (t: string) => {
      let res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401 && typeof window !== "undefined") {
        const rt = localStorage.getItem(REFRESH_KEY);
        if (rt) {
          const next = await refreshSession(rt);
          if (next) {
            persistSession(next.token, next.refreshToken);
            res = await fetch(`${API_BASE}/auth/me`, {
              headers: { Authorization: `Bearer ${next.token}` },
            });
          }
        }
      }
      if (!res.ok) {
        setToken(null);
        if (typeof window !== "undefined") localStorage.removeItem(REFRESH_KEY);
        return;
      }
      const data = await res.json();
      setUser(data);
    },
    [persistSession, setToken]
  );

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    setTokenState(stored);
    fetchUser(stored).finally(() => setLoading(false));
  }, [fetchUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || "Login failed");
      }
      const data = (await res.json()) as { token: string; refreshToken: string; user: User };
      persistSession(data.token, data.refreshToken);
      setUser(data.user);
    },
    [persistSession]
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || "Registration failed");
      }
      const data = (await res.json()) as { token: string; refreshToken: string; user: User };
      persistSession(data.token, data.refreshToken);
      setUser(data.user);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (t) {
      void fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
      });
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
    setTokenState(null);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
