"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, CheckCircle2, Waves, Apple, Activity, AlertTriangle } from "lucide-react";

export function RecoveryNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/recovery/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      })
      .catch(() => {});
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "reminder": return <Waves className="h-4 w-4 text-cyan-400" />;
      case "info": return <Activity className="h-4 w-4 text-[var(--accent)]" />;
      case "success": return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      default: return <Apple className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <GlassCard className="p-6 text-center text-xs text-[var(--foreground-muted)]">
          <BellRing className="h-8 w-8 text-white/20 mx-auto mb-2" />
          <p>No recovery notifications yet.</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((n: any) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`p-4 rounded-2xl border text-left space-y-2 transition ${n.read ? "bg-white/5 border-white/5 opacity-60" : "bg-white/[0.07] border-[var(--accent)]/20"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-white">{n.title}</p>
                      <span className="text-[9px] text-[var(--foreground-muted)]">{n.createdAt}</span>
                    </div>
                    <p className="text-[10px] text-[var(--foreground-muted)] leading-relaxed mt-0.5">{n.message}</p>
                    {n.actionLabel && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="mt-2 px-3 py-1 rounded-lg bg-[var(--accent-glow)] border border-[var(--accent)]/20 text-[9px] font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition"
                      >
                        {n.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
