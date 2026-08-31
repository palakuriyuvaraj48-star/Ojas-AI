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
  HeartPulse,
  Crosshair,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { TranslationDictionary } from "@/lib/i18n/types";

interface NavItem {
  key: keyof TranslationDictionary;
  defaultLabel: string;
  icon: any;
  href: string;
}

const navItems: NavItem[] = [
  { key: "nav_dashboard", defaultLabel: "Home", icon: Activity, href: "/dashboard" },
  { key: "nav_workouts", defaultLabel: "Workout", icon: Dumbbell, href: "/workouts" },
  { key: "nav_recovery", defaultLabel: "Recovery", icon: HeartPulse, href: "/recovery" },
  { key: "nav_nutrition", defaultLabel: "Nutrition", icon: UtensilsCrossed, href: "/nutrition" },
  { key: "nav_analytics", defaultLabel: "Progress", icon: BarChart3, href: "/progress" },
  { key: "nav_ai_coach", defaultLabel: "AI Coach", icon: Sparkles, href: "/coach" },
  { key: "nav_form_coach", defaultLabel: "Form", icon: Crosshair, href: "/form-coach" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-[var(--background-secondary)]/90 backdrop-blur-xl border-t border-[var(--border)] z-40 safe-area-bottom"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const label = t(item.key, item.defaultLabel);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all ${
                isActive
                  ? "text-[var(--accent)] font-semibold"
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
              <span className="text-[10px] font-medium truncate max-w-[60px] text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
