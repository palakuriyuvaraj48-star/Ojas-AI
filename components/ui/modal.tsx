"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = "md" }) => {
  const sizeMap = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={title ? "modal-title" : undefined}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`relative z-10 w-full ${sizeMap[size]} rounded-3xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--background-secondary)] p-6 shadow-2xl text-left`}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
              {title && (
                <h3 id="modal-title" className="font-bold text-[var(--foreground)] text-sm">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-[var(--foreground-muted)] hover:bg-white/5 hover:text-[var(--foreground)] transition ml-auto"
                aria-label="Close dialog"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto pr-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
