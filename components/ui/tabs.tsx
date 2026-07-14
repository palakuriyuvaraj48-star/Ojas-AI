"use client";

import React from "react";
import { motion } from "framer-motion";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "pills" | "underline";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, variant = "pills", className = "" }) => {
  if (variant === "underline") {
    return (
      <div className={`flex gap-1 border-b border-[var(--border)] ${className}`} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === tab.id ? "text-[var(--accent)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-1 rounded-xl bg-black/30 p-1 border border-[var(--border-subtle)] ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            activeTab === tab.id ? "text-[var(--accent)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-pill"
              className="absolute inset-0 rounded-lg bg-[var(--accent)]/15"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};
