"use client";

import React from "react";

export interface BadgeProps {
  label: string;
  variant?: "primary" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = "neutral", size = "sm" }) => {
  const styles = {
    primary: "bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)]",
    success: "bg-emerald-400/10 border border-emerald-400/20 text-emerald-400",
    warning: "bg-yellow-400/10 border border-yellow-400/20 text-yellow-400",
    danger: "bg-red-400/10 border border-red-400/20 text-red-400",
    neutral: "bg-white/5 border border-[var(--border)] text-[var(--foreground-muted)]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[9px]",
    md: "px-2.5 py-1 text-[10px]",
  };

  return (
    <span className={`inline-flex items-center rounded-lg font-bold uppercase tracking-wider ${styles[variant]} ${sizes[size]}`}>
      {label}
    </span>
  );
};
