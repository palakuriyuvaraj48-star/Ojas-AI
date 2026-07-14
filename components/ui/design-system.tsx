"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Info, Loader2 } from "lucide-react";

// 1. Premium Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "premium" | "glass" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "glass", size = "md", loading, icon, className = "", ...props }, ref) => {
    const baseStyle = "relative flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden active:scale-95";
    
    const variants = {
      premium: "bg-gradient-to-r from-[#adc6ff] to-[#4d8eff] text-black hover:brightness-110 shadow-lg shadow-[#4d8eff]/10",
      glass: "bg-white/10 hover:bg-white/15 border border-white/10 text-white backdrop-blur-md",
      outline: "border border-white/20 bg-transparent hover:bg-white/5 text-white",
      ghost: "bg-transparent hover:bg-white/5 text-white/70 hover:text-white",
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
        {...(props as any)}
      >
        {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
        {!loading && icon && <span className="mr-1.5">{icon}</span>}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

// 2. Glass Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1 text-left w-full">
        {label && <label className="text-[10px] font-bold text-white/40 uppercase block tracking-wider">{label}</label>}
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-black/20 p-3 text-xs text-white placeholder-white/25 focus:outline-none transition-all duration-200 ${
            error ? "border-red-500/50 focus:border-red-500/80" : "border-white/10 focus:border-[#adc6ff]/50"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-[9px] text-red-400 font-medium block">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

// 3. Dropdown Select
export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, error, options, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1 text-left w-full">
        {label && <label className="text-[10px] font-bold text-white/40 uppercase block tracking-wider">{label}</label>}
        <select
          ref={ref}
          className={`w-full rounded-xl border bg-black/35 p-3 text-xs text-white focus:outline-none transition-all duration-200 appearance-none cursor-pointer ${
            error ? "border-red-500/50 focus:border-red-500/80" : "border-white/10 focus:border-[#adc6ff]/50"
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#131315] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-[9px] text-red-400 font-medium block">{error}</span>}
      </div>
    );
  }
);
Dropdown.displayName = "Dropdown";

// 4. SVG Progress Ring
export interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 40,
  strokeWidth = 4,
  color = "#adc6ff",
  className = "",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg className="-rotate-90 transform" width={size} height={size}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-white/5 fill-none"
          strokeWidth={strokeWidth}
        />
        {/* Progress Fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

// 5. Avatar with Status Dot
export interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  status?: "optimal" | "warning" | "fatigued" | "offline";
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = "md", status }) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-sm",
  };

  const statusColors = {
    optimal: "bg-emerald-400",
    warning: "bg-yellow-400",
    fatigued: "bg-red-400",
    offline: "bg-white/20",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative inline-block">
      <div className={`flex items-center justify-center rounded-full border border-white/10 bg-white/10 font-bold text-white overflow-hidden backdrop-blur-md ${sizeClasses[size]}`}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#131315] ${statusColors[status]}`} />
      )}
    </div>
  );
};

// 6. Badge Tag
export interface BadgeProps {
  label: string;
  variant?: "primary" | "success" | "warning" | "danger" | "neutral";
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = "neutral" }) => {
  const styles = {
    primary: "bg-[#adc6ff]/10 border border-[#adc6ff]/20 text-[#adc6ff]",
    success: "bg-emerald-400/10 border border-emerald-400/20 text-emerald-400",
    warning: "bg-yellow-400/10 border border-yellow-400/20 text-yellow-400",
    danger: "bg-red-400/10 border border-red-400/20 text-red-400",
    neutral: "bg-white/5 border border-white/10 text-white/70",
  };

  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${styles[variant]}`}>
      {label}
    </span>
  );
};

// 7. Shimmer Skeleton Loader
export const Skeleton: React.FC<{ className?: string; width?: string | number; height?: string | number }> = ({
  className = "",
  width,
  height,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white/5 ${className}`}
      style={{ width, height }}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
    </div>
  );
};

// 8. Modal Dialog Container
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-[#1c1b1d] to-[#131315] p-6 shadow-2xl text-left"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              {title && <h3 className="font-bold text-white text-sm">{title}</h3>}
              <button onClick={onClose} className="rounded-lg p-1 text-white/50 hover:bg-white/5 hover:text-white transition">
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

// 9. Toast Notification Handler
export interface ToastProps {
  message: string;
  type?: "success" | "warning" | "error" | "info";
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
    error: <AlertTriangle className="h-4 w-4 text-red-400" />,
    info: <Info className="h-4 w-4 text-[#adc6ff]" />,
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
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-xs text-white shadow-xl backdrop-blur-lg w-full max-w-sm pointer-events-auto"
    >
      {icons[type]}
      <span className="flex-1 text-left font-medium leading-tight">{message}</span>
      <button onClick={onClose} className="text-white/40 hover:text-white transition">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};
