"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/admin/client";

export interface AdminUserInfo {
  id: string;
  email: string;
  name: string;
  role: AdminUserRole;
  avatarColor: string;
  permissions: string[];
  active: boolean;
  lastLoginAt?: string;
}

export type AdminUserRole = "super_admin" | "admin" | "moderator" | "viewer";

interface AdminAuthContext {
  user: AdminUserInfo | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AdminAuthContext | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await adminFetch<{ user: AdminUserInfo | null }>("/api/admin/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await adminFetch<{ user: AdminUserInfo }>("/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? "Login failed" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminFetch("/api/admin/auth/logout", { method: "DELETE" });
    } finally {
      setUser(null);
    }
  }, []);

  const can = useCallback(
    (permission: string) => !!user?.permissions.includes(permission) || user?.role === "super_admin",
    [user],
  );

  return (
    <Ctx.Provider value={{ user, isLoading, login, logout, can, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
