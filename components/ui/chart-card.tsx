"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./glass-card";
import { Chart } from "./chart";

export interface ChartCardProps {
  title: string;
  data: any[];
  type?: "line" | "area" | "bar" | "pie";
  color?: string;
  height?: number;
  className?: string;
}

export function ChartCard({ title, data, type = "line", color, height = 200, className = "" }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">{title}</h3>
        <Chart data={data} type={type} color={color} height={height} showGrid={false} />
      </GlassCard>
    </motion.div>
  );
}
