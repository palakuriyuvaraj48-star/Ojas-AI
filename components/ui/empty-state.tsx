"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface)]">
          <Icon className="h-8 w-8 text-[var(--foreground-muted)]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
      {description && <p className="text-sm text-[var(--foreground-muted)] mb-6 max-w-sm">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-medium hover:brightness-110 transition-all active:scale-95"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
