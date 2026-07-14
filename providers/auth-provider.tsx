"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AuthSession, AuthUser } from "@/types/profile";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { StorageService, TABLES } from "@/database/storage";
import { validateAuthLogin, validateAuthRegister } from "@/lib/validation";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithApple: () => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  pendingEmail: string | null;
  biometricReady: boolean;
  authenticateWithBiometric: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function createSession(user: AuthUser, rememberMe: boolean): AuthSession {
  const days = rememberMe ? config.auth.sessionDurationDays : 1;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  return {
    user,
    token: `titan_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    rememberMe,
    expiresAt,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const session = StorageService.get<AuthSession>(TABLES.AUTH_SESSION);
    if (session && new Date(session.expiresAt) > new Date()) {
      setUser(session.user);
      setRememberMe(session.rememberMe);
    }
    setIsLoading(false);
  }, []);

  const persistSession = useCallback((session: AuthSession) => {
    StorageService.set(TABLES.AUTH_SESSION, session);
    setUser(session.user);
    setRememberMe(session.rememberMe);
  }, []);

  const login = useCallback(async (email: string, password: string, remember = false) => {
    const validation = validateAuthLogin(email, password);
    if (!validation.valid) {
      return { success: false, error: Object.values(validation.errors)[0] };
    }
    const authUser: AuthUser = {
      id: `user_${Date.now()}`,
      email,
      name: email.split("@")[0],
      provider: "email",
      createdAt: new Date().toISOString(),
    };
    persistSession(createSession(authUser, remember));
    logger.info("User logged in", { email });
    return { success: true };
  }, [persistSession]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const validation = validateAuthRegister(name, email, password);
    if (!validation.valid) {
      return { success: false, error: Object.values(validation.errors)[0] };
    }
    const authUser: AuthUser = {
      id: `user_${Date.now()}`,
      email,
      name,
      provider: "email",
      createdAt: new Date().toISOString(),
    };
    setPendingUser(authUser);
    setPendingEmail(email);
    return { success: true };
  }, []);

  const verifyOtp = useCallback(async (code: string) => {
    if (code !== config.auth.otpDemoCode) {
      return { success: false, error: "Invalid verification code. Use 1234 for demo." };
    }
    if (!pendingUser) {
      return { success: false, error: "No pending registration found." };
    }
    persistSession(createSession(pendingUser, true));
    setPendingUser(null);
    setPendingEmail(null);
    return { success: true };
  }, [pendingUser, persistSession]);

  const loginWithGoogle = useCallback(async () => {
    const authUser: AuthUser = {
      id: `google_${Date.now()}`,
      email: "user@gmail.com",
      name: "Google User",
      provider: "google",
      createdAt: new Date().toISOString(),
    };
    persistSession(createSession(authUser, true));
    logger.info("Google OAuth simulated");
    return { success: true };
  }, [persistSession]);

  const loginWithApple = useCallback(async () => {
    const authUser: AuthUser = {
      id: `apple_${Date.now()}`,
      email: "user@icloud.com",
      name: "Apple User",
      provider: "apple",
      createdAt: new Date().toISOString(),
    };
    persistSession(createSession(authUser, true));
    logger.info("Apple OAuth simulated");
    return { success: true };
  }, [persistSession]);

  const resetPassword = useCallback(async (email: string) => {
    if (!email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }
    logger.info("Password reset requested", { email });
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    StorageService.remove(TABLES.AUTH_SESSION);
    setUser(null);
    setRememberMe(false);
  }, []);

  const authenticateWithBiometric = useCallback(async () => {
    if (!config.auth.biometricReady) {
      return { success: false, error: "Biometric authentication not available." };
    }
    const session = StorageService.get<AuthSession>(TABLES.AUTH_SESSION);
    if (session) {
      setUser(session.user);
      return { success: true };
    }
    return { success: false, error: "No saved session for biometric unlock." };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        rememberMe,
        login,
        register,
        loginWithGoogle,
        loginWithApple,
        verifyOtp,
        resetPassword,
        logout,
        pendingEmail,
        biometricReady: config.auth.biometricReady,
        authenticateWithBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
