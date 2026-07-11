"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { api, getToken, getUser, setToken, setUser, clearToken, clearUser, User } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  mounted: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, isHost: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) setUserState(savedUser);
    setMounted(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const resp = await api.login({ email, password });
      setToken(resp.access_token);
      setUser(resp.user);
      setUserState(resp.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, isHost: boolean) => {
    setLoading(true);
    try {
      const resp = await api.signup({ name, email, password, is_host: isHost });
      setToken(resp.access_token);
      setUser(resp.user);
      setUserState(resp.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearUser();
    setUserState(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) return;
    try {
      const u = await api.me();
      setUser(u);
      setUserState(u);
    } catch {
      clearToken();
      clearUser();
      setUserState(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, mounted, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}