"use client";

import React from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function Card({ children, className = "", glow = false, hover = false, padding = "md" }: CardProps) {
  const paddingMap = { sm: "p-3", md: "p-5", lg: "p-6" };
  const Component = hover ? motion.div : "div";
  const motionProps = hover
    ? { whileHover: { y: -2 }, transition: { duration: 0.2 } }
    : {};

  return (
    <Component
      className={`rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[0_20px_60px_var(--shadow-color)] backdrop-blur-2xl ${paddingMap[padding]} ${glow ? "shadow-[var(--accent-glow)]" : ""} ${className}`}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

// Re-export GlassCard alias for backward compatibility
export { Card as GlassCard };
