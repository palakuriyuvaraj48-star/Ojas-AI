"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Dumbbell,
  UtensilsCrossed,
  BarChart3,
  Sparkles,
  Waves,
  HeartPulse,
  Crosshair,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: any;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", icon: Activity, href: "/dashboard" },
  { label: "Workout", icon: Dumbbell, href: "/workouts" },
  { label: "Recovery", icon: HeartPulse, href: "/recovery" },
  { label: "Nutrition", icon: UtensilsCrossed, href: "/nutrition" },
  { label: "Progress", icon: BarChart3, href: "/progress" },
  { label: "AI Coach", icon: Sparkles, href: "/coach" },
  { label: "Form", icon: Crosshair, href: "/form-coach" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-[var(--background-secondary)]/80 backdrop-blur-xl border-t border-[var(--border)] z-40 safe-area-bottom"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative ${isActive ? "text-[var(--accent)]" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[var(--accent-glow)] rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="h-5 w-5 relative z-10" />
              </motion.div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
