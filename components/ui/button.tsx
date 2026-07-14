"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "premium" | "glass" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "glass", size = "md", loading, icon, className = "", ...props }, ref) => {
    const baseStyle =
      "relative flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

    const variants = {
      premium:
        "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] text-[#131315] hover:brightness-110 shadow-lg shadow-[var(--accent-glow)]",
      glass:
        "bg-white/10 hover:bg-white/15 border border-[var(--border)] text-[var(--foreground)] backdrop-blur-md",
      outline:
        "border border-[var(--border)] bg-transparent hover:bg-white/5 text-[var(--foreground)]",
      ghost: "bg-transparent hover:bg-white/5 text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
      danger: "bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-[10px]",
      md: "px-4 py-2 text-xs",
      lg: "px-6 py-3 text-sm",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={loading || props.disabled}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
        {!loading && icon && <span className="mr-1.5">{icon}</span>}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
