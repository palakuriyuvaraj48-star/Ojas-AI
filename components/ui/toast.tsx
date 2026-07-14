"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "success" | "warning" | "error" | "info";
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-400" aria-hidden="true" />,
    error: <AlertTriangle className="h-4 w-4 text-red-400" aria-hidden="true" />,
    info: <Info className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />,
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-black/80 px-4 py-3 text-xs text-[var(--foreground)] shadow-xl backdrop-blur-lg w-full max-w-sm pointer-events-auto"
      role="alert"
      aria-live="polite"
    >
      {icons[type]}
      <span className="flex-1 text-left font-medium leading-tight">{message}</span>
      <button onClick={onClose} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition" aria-label="Dismiss notification">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};
