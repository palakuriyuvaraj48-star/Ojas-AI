"use client";

import React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

export interface ChartProps {
  data: any[];
  type?: "line" | "area" | "bar" | "pie";
  width?: number | string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const COLORS = ["#a78bfa", "#38bdf8", "#34d399", "#fbbf24", "#f87171"];

export function Chart({
  data,
  type = "line",
  width = "100%",
  height = 300,
  color = "#a78bfa",
  showGrid = true,
  showTooltip = true,
  className = "",
}: ChartProps) {
  const commonProps = {
    data,
    width: width as any,
    height: height as any,
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />}
            <XAxis dataKey="name" stroke="var(--foreground-subtle)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--foreground-subtle)" fontSize={12} tickLine={false} axisLine={false} />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }} />}
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color }} />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />}
            <XAxis dataKey="name" stroke="var(--foreground-subtle)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--foreground-subtle)" fontSize={12} tickLine={false} axisLine={false} />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }} />}
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={0.3} fill={color} />
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />}
            <XAxis dataKey="name" stroke="var(--foreground-subtle)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--foreground-subtle)" fontSize={12} tickLine={false} axisLine={false} />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }} />}
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case "pie":
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }} />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <ResponsiveContainer width={width as any} height={height as any}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
