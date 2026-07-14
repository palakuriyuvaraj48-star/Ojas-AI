"use client";

import React from "react";

export interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "optimal" | "warning" | "fatigued" | "offline";
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = "md", status }) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-sm",
    xl: "h-20 w-20 text-base",
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
      <div
        className={`flex items-center justify-center rounded-full border border-[var(--border)] bg-white/10 font-bold text-[var(--foreground)] overflow-hidden backdrop-blur-md ${sizeClasses[size]}`}
        aria-label={name}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--background)] ${statusColors[status]}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};
