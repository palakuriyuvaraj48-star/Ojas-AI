"use client";

import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1 text-left w-full">
        {label && (
          <label htmlFor={inputId} className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase block tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`w-full rounded-xl border bg-black/20 p-3 text-xs text-[var(--foreground)] placeholder-white/25 focus:outline-none transition-all duration-200 ${
            error ? "border-red-500/50 focus:border-red-500/80" : "border-[var(--border)] focus:border-[var(--accent)]/50"
          } ${className}`}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} role="alert" className="text-[9px] text-red-400 font-medium block">
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${inputId}-hint`} className="text-[9px] text-[var(--foreground-muted)] block">
            {hint}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
