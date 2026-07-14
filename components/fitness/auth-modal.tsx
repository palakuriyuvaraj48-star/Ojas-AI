"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Camera, Mail, Lock, User, KeyRound, AlertCircle, X, Fingerprint, Check } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "otp">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricsReady, setBiometricsReady] = useState(false);
  const [isScanningBiometrics, setIsScanningBiometrics] = useState(false);

  const { login, register, verifyOtp, loginWithGoogle, loginWithApple, resetPassword } = useAuth();

  // Handle remember me on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("titan_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
      setBiometricsReady(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        if (rememberMe) {
          localStorage.setItem("titan_remembered_email", email);
        } else {
          localStorage.removeItem("titan_remembered_email");
        }

        const result = await login(email, password);
        if (result.success) {
          onSuccess();
        } else {
          setErrorMsg(result.error || "Login failed");
        }
      } else if (mode === "register") {
        const result = await register(name, email, password);
        if (result.success) {
          setMode("otp");
        } else {
          setErrorMsg(result.error || "Registration failed");
        }
      } else if (mode === "forgot") {
        const result = await resetPassword(email);
        if (result.success) {
          alert(`Password reset instructions sent to ${email}`);
          setMode("login");
        } else {
          setErrorMsg(result.error || "Password reset failed");
        }
      } else if (mode === "otp") {
        const result = await verifyOtp(otpCode);
        if (result.success) {
          onSuccess();
        } else {
          setErrorMsg(result.error || "Invalid OTP code");
        }
      }
    } catch (error) {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        onSuccess();
      } else {
        setErrorMsg(result.error || "Google login failed");
      }
    } catch (error) {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await loginWithApple();
      if (result.success) {
        onSuccess();
      } else {
        setErrorMsg(result.error || "Apple login failed");
      }
    } catch (error) {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setIsScanningBiometrics(true);
    setErrorMsg("");
    try {
      // Simulate physical touch ID / face scan delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Auto authenticate via default mock credentials
      const result = await login("athlete@titan.ai", "password123");
      if (result.success) {
        onSuccess();
      } else {
        setErrorMsg("Biometric verification failed. Please login with password.");
      }
    } catch (err) {
      setErrorMsg("Biometrics authentication error");
    } finally {
      setIsScanningBiometrics(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-6 sm:p-8 space-y-6 relative border-[var(--border-subtle)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition p-1 rounded-full hover:bg-[var(--surface)]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-white mx-auto">
            <Camera className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Project Titan Login</h3>
          <p className="text-xs text-[var(--foreground-muted)]">Human Performance Operating System</p>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-subtle)] p-3 text-xs text-[var(--danger)] flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {(mode === "login" || mode === "register") && (
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleGoogleLogin}
              disabled={isLoading || isScanningBiometrics}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleAppleLogin}
              disabled={isLoading || isScanningBiometrics}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </Button>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[var(--background-secondary)] text-[var(--foreground-muted)]">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Name</label>
              <Input
                type="text"
                required
                placeholder="Maya Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading || isScanningBiometrics}
              />
            </div>
          )}

          {(mode === "login" || mode === "register" || mode === "forgot") && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Email Address</label>
              <Input
                type="email"
                required
                placeholder="maya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isScanningBiometrics}
              />
            </div>
          )}

          {(mode === "login" || mode === "register") && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Password</label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isScanningBiometrics}
              />
            </div>
          )}

          {mode === "login" && (
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[var(--border)] bg-[var(--background-tertiary)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-offset-0"
                />
                Remember Me
              </label>
              {biometricsReady && (
                <button
                  type="button"
                  onClick={handleBiometricAuth}
                  className="flex items-center gap-1.5 text-[var(--accent)] hover:text-[var(--accent-strong)] hover:underline transition bg-transparent border-0 cursor-pointer p-0 font-medium"
                  disabled={isLoading || isScanningBiometrics}
                >
                  <Fingerprint className={`h-4 w-4 ${isScanningBiometrics ? "animate-pulse text-[var(--accent-strong)]" : ""}`} />
                  {isScanningBiometrics ? "Scanning..." : "Biometric Sign In"}
                </button>
              )}
            </div>
          )}

          {mode === "otp" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Verification OTP Code</label>
              <Input
                type="text"
                required
                placeholder="Enter 1234 to verify"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="text-center font-bold tracking-widest"
                disabled={isLoading}
              />
              <p className="text-[9px] text-[var(--foreground-subtle)] text-center mt-1">Check email inbox for verification credentials.</p>
            </div>
          )}

          <Button
            type="submit"
            variant="premium"
            className="w-full mt-2"
            loading={isLoading || isScanningBiometrics}
          >
            {mode === "login"
              ? "Sign In to Titan OS"
              : mode === "register"
              ? "Register Account"
              : mode === "forgot"
              ? "Send Password Reset Link"
              : "Verify Credentials"}
          </Button>
        </form>

        <div className="flex flex-col gap-2 items-center justify-between pt-4 border-t border-[var(--border)] text-xs">
          {mode === "login" && (
            <>
              <button onClick={() => setMode("forgot")} className="text-[var(--accent)] hover:underline">
                Forgot password?
              </button>
              <p className="text-[var(--foreground-muted)] mt-1">
                New to Titan?{" "}
                <button onClick={() => setMode("register")} className="text-[var(--foreground)] font-bold hover:underline">
                  Create Account
                </button>
              </p>
            </>
          )}

          {mode === "register" && (
            <p className="text-[var(--foreground-muted)]">
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-[var(--foreground)] font-bold hover:underline">
                Sign In
              </button>
            </p>
          )}

          {(mode === "forgot" || mode === "otp") && (
            <button onClick={() => setMode("login")} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] underline">
              Return to Login
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}


