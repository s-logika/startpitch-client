"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { loginUser, registerUser } from "@/lib/api/auth";
import { getMe } from "@/lib/api/users";
import { setAuthExpiredHandler } from "@/lib/api/client";
import { clearTokens, getAccessToken, setTokens } from "@/lib/auth/token-storage";
import type { User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, role: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!getAccessToken());
  const router = useRouter();

  const bootstrap = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setAuthExpiredHandler(() => {
      setUser(null);
      router.push("/login");
    });
    if (getAccessToken()) {
      // bootstrap() is async — setUser/setLoading only run after the awaited
      // getMe() resolves, never synchronously during this effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      bootstrap();
    }
    return () => setAuthExpiredHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginUser({ email, password });
    setTokens(tokens);
    const me = await getMe();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (email: string, password: string, role: string) => {
    await registerUser({ email, password, role });
    return login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    clearTokens();
    // Hard navigation: avoids a race with the dashboard layout's own
    // "no user -> /login" guard effect firing before the client-side
    // router finishes leaving /dashboard, and resets all cached query state.
    window.location.href = "/";
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await getMe();
    setUser(me);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
