"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, login as apiLogin } from "@/lib/api";

const TOKEN_KEY = "vex_crm_token";

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
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setRole(null);
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    getMe(stored)
      .then((user) => {
        if (user.role === "STAFF" || user.role === "ADMIN") {
          setToken(stored);
          setRole(user.role);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .catch(logout)
      .finally(() => setLoading(false));
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    if (data.user.role !== "STAFF" && data.user.role !== "ADMIN") {
      throw new Error("Staff or admin access required");
    }
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, data.token);
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
