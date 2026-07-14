"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Bot } from "lucide-react";
import { GlassCard } from "./glass-card";

export interface AICardProps {
  title: string;
  message: string;
  type?: "insight" | "tip" | "warning" | "success";
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export function AICard({ title, message, type = "insight", onAction, actionLabel, className = "" }: AICardProps) {
  const typeStyles = {
    insight: { icon: Sparkles, color: "text-[var(--accent)]", bg: "bg-[var(--accent-glow)]" },
    tip: { icon: Bot, color: "text-[var(--accent-secondary)]", bg: "bg-[var(--info-subtle)]" },
    warning: { icon: Sparkles, color: "text-[var(--warning)]", bg: "bg-[var(--warning-subtle)]" },
    success: { icon: Sparkles, color: "text-[var(--success)]", bg: "bg-[var(--success-subtle)]" },
  };

  const { icon: Icon, color, bg } = typeStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <GlassCard className="relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 ${bg} rounded-full blur-3xl opacity-30`} />
        <div className="relative flex gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[var(--foreground)] text-sm mb-1">{title}</h4>
            <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{message}</p>
            {onAction && actionLabel && (
              <button
                onClick={onAction}
                className="mt-3 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-strong)] transition-colors"
              >
                {actionLabel} →
              </button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
