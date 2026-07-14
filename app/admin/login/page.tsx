"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "@/providers/admin-auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const { login, user, isLoading, refresh } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@titancorp.ai");
  const [password, setPassword] = useState("Titan@Admin2026");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.replace("/admin");
  }, [isLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.success) {
      await refresh();
      router.replace("/admin");
    } else {
      setError(res.error ?? "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gradient-hero)] bg-[var(--gradient-surface)] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--gradient-primary)] text-white shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-extrabold text-[var(--foreground)]">Titan Enterprise Admin</h1>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">Secure control center for platform operators</p>
        </div>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-3 pr-10 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)]" aria-label="Toggle password">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="rounded-lg bg-[var(--danger-subtle)] px-3 py-2 text-[11px] text-[var(--danger)]">{error}</p>
            )}
            <Button type="submit" variant="premium" size="lg" loading={submitting} className="w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
            <p className="text-center text-[10px] text-[var(--foreground-subtle)]">
              Demo: admin@titancorp.ai / Titan@Admin2026
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
