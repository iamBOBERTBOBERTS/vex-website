"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isCrmPortalRole } from "@vex/shared";
import { getMe, login as apiLogin, refreshSession } from "@/lib/api";
import { getCrmApiBase } from "@/lib/runtimeConfig";

const TOKEN_KEY = "vex_crm_token";
const REFRESH_KEY = "vex_crm_refresh";

type AuthContextValue = {
  token: string | null;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem(TOKEN_KEY);
      const apiBase = getCrmApiBase();
      if (t && apiBase) {
        void fetch(`${apiBase}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${t}` },
        });
      }
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
    setToken(null);
    setRole(null);
  }, []);

  const bootstrap = useCallback(async () => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      let t = stored;
      let user = await getMe(t);
      if (!user && typeof window !== "undefined") {
        const rt = localStorage.getItem(REFRESH_KEY);
        if (rt) {
          const next = await refreshSession(rt);
          if (next) {
            localStorage.setItem(TOKEN_KEY, next.token);
            localStorage.setItem(REFRESH_KEY, next.refreshToken);
            t = next.token;
            user = await getMe(t);
          }
        }
      }
      if (user && isCrmPortalRole(user.role)) {
        setToken(t);
        setRole(user.role);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    if (!isCrmPortalRole(data.user.role)) {
      throw new Error("Staff, admin, or group admin access required");
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, data.token);
      if (data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
    }
    setToken(data.token);
    setRole(data.user.role);
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
