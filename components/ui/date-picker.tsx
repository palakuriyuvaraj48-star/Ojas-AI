"use client";

import React from "react";
import { Calendar } from "lucide-react";

export interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, min, max, error }) => {
  const id = label?.toLowerCase().replace(/\s+/g, "-") || "date-picker";

  return (
    <div className="space-y-1 text-left w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase block tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)] pointer-events-none" aria-hidden="true" />
        <input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          className={`w-full rounded-xl border bg-black/20 pl-10 pr-3 py-3 text-xs text-[var(--foreground)] focus:outline-none transition-all duration-200 ${
            error ? "border-red-500/50" : "border-[var(--border)] focus:border-[var(--accent)]/50"
          }`}
        />
      </div>
      {error && <span className="text-[9px] text-red-400 font-medium block">{error}</span>}
    </div>
  );
};
