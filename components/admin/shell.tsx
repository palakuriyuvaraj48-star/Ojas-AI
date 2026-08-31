"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Flag, Bell, MessageSquare, FileText, Activity, ScrollText, Users, LogOut,
  Menu, X, ShieldCheck, Loader2,
} from "lucide-react";
import { useAdminAuth } from "@/providers/admin-auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { ROLE_LABELS } from "@/lib/admin/rbac";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/feature-flags", label: "Feature Flags", icon: <Flag className="h-4 w-4" />, permission: "flags:read" },
  { href: "/admin/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" />, permission: "notifications:read" },
  { href: "/admin/feedback", label: "Feedback", icon: <MessageSquare className="h-4 w-4" />, permission: "feedback:read" },
  { href: "/admin/content", label: "Content", icon: <FileText className="h-4 w-4" />, permission: "content:read" },
  { href: "/admin/system", label: "System", icon: <Activity className="h-4 w-4" />, permission: "system:read" },
  { href: "/admin/audit", label: "Audit Logs", icon: <ScrollText className="h-4 w-4" />, permission: "audit:read" },
  { href: "/admin/users", label: "Admin Users", icon: <Users className="h-4 w-4" />, permission: "users:read" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout, can } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading && !user && !isLoginRoute) router.replace("/admin/login");
  }, [isLoading, user, router, isLoginRoute]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }
  // Login route renders without the shell chrome.
  if (isLoginRoute) return <>{children}</>;
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const visibleNav = NAV.filter((n) => !n.permission || can(n.permission));

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-[var(--border-subtle)]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gradient-primary)] text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--foreground)] leading-tight">Titan Admin</p>
          <p className="text-[9px] text-[var(--foreground-subtle)] uppercase tracking-widest">Enterprise OS</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Admin navigation">
        {visibleNav.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                active ? "bg-[var(--accent-glow)] text-[var(--accent)]" : "text-[var(--foreground-muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--border-subtle)] p-3">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: user.avatarColor }}>
            {(user.name || "Admin").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[var(--foreground)]">{user.name || "Admin"}</p>
            <p className="truncate text-[9px] text-[var(--foreground-subtle)]">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}</p>
          </div>
          <button onClick={toggleTheme} className="rounded-lg p-1.5 text-[var(--foreground-muted)] hover:bg-white/10" aria-label="Toggle theme">
            {resolvedTheme === "dark" ? "☀" : "☾"}
          </button>
          <button onClick={logout} className="rounded-lg p-1.5 text-[var(--foreground-muted)] hover:bg-white/10 hover:text-[var(--danger)]" aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <aside className="hidden md:block w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl">
        {SidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-[var(--border)] bg-[var(--background-secondary)]">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-[var(--foreground)]" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold">Titan Admin</span>
          <div className="h-8 w-8" />
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
