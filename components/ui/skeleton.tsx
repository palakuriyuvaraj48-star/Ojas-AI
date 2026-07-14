"use client";

import React from "react";

export const Skeleton: React.FC<{
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
}> = ({ className = "", width, height, rounded = "md" }) => {
  const roundedMap = { sm: "rounded-lg", md: "rounded-xl", lg: "rounded-2xl", full: "rounded-full" };

  return (
    <div
      className={`relative overflow-hidden bg-white/5 ${roundedMap[rounded]} ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      <span className="sr-only">Loading...</span>
    </div>
  );
};
