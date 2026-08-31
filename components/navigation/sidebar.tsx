"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Dumbbell,
  UtensilsCrossed,
  Trophy,
  Users,
  Settings,
  X,
  ChevronRight,
  Sparkles,
  Camera,
  HeartPulse,
  Music,
  Crown,
  ShieldCheck,
  LogOut,
  Search,
  ShoppingCart,
  BookOpen,
  Waves,
  TrendingUp,
  MapPin,
  Bell,
  Apple,
  Moon,
  ShieldAlert,
  GitCompareArrows,
  Scale,
  Award,
  Play,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { TranslationDictionary } from "@/lib/i18n/types";

interface NavItemConfig {
  key?: keyof TranslationDictionary;
  defaultLabel: string;
  icon: any;
  href: string;
  badge?: string;
  premium?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userAvatar?: string;
}

export function Sidebar({ isOpen, onClose, userName = "User", userAvatar }: SidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  const navItems: NavItemConfig[] = [
    { key: "nav_dashboard", defaultLabel: "Dashboard", icon: Activity, href: "/dashboard" },
    { key: "nav_sports_performance" as any, defaultLabel: "Sports & Performance", icon: Trophy, href: "/sports", badge: "NEW" },
    { key: "nav_workouts", defaultLabel: "Workouts", icon: Dumbbell, href: "/workouts" },
    { key: "nav_workout_home", defaultLabel: "Workout Home", icon: Dumbbell, href: "/workouts?tab=dashboard" },
    { key: "nav_ai_generator", defaultLabel: "AI Generator", icon: Sparkles, href: "/workouts?tab=generator" },
    { key: "nav_exercise_library", defaultLabel: "Exercise Library", icon: Search, href: "/workouts?tab=library" },
    { key: "nav_prs", defaultLabel: "Personal Records", icon: Trophy, href: "/workouts?tab=history" },
    { key: "nav_nutrition", defaultLabel: "Nutrition", icon: UtensilsCrossed, href: "/nutrition" },
    { key: "nav_nutrition_dashboard", defaultLabel: "Nutrition Dashboard", icon: Apple, href: "/nutrition?tab=dashboard" },
    { key: "nav_meal_planner", defaultLabel: "AI Meal Planner", icon: Sparkles, href: "/nutrition?tab=planner" },
    { key: "nav_food_scanner", defaultLabel: "Food & Scanner Log", icon: Camera, href: "/nutrition?tab=scanner" },
    { key: "nav_ai_dietitian", defaultLabel: "AI Dietitian Coach", icon: UtensilsCrossed, href: "/nutrition?tab=coach" },
    { key: "nav_grocery", defaultLabel: "Grocery List", icon: ShoppingCart, href: "/nutrition?tab=grocery" },
    { key: "nav_recipes", defaultLabel: "Recipe Maker", icon: BookOpen, href: "/nutrition?tab=recipes" },
    { key: "nav_water_tracker", defaultLabel: "Water Tracker", icon: Waves, href: "/nutrition?tab=water" },
    { key: "nav_nutrition_analytics", defaultLabel: "Nutrition Analytics", icon: TrendingUp, href: "/nutrition?tab=analytics" },
    { key: "nav_restaurant_dining", defaultLabel: "Restaurant Dining", icon: MapPin, href: "/nutrition?tab=restaurant" },
    { key: "nav_smart_alerts", defaultLabel: "Smart Alerts", icon: Bell, href: "/nutrition?tab=notifications" },
    { key: "nav_analytics", defaultLabel: "Analytics & Insights Hub", icon: BarChart3, href: "/progress" },
    { key: "nav_recovery", defaultLabel: "Recovery", icon: HeartPulse, href: "/recovery" },
    { key: "nav_recovery_dashboard", defaultLabel: "Recovery Dashboard", icon: Activity, href: "/recovery?tab=dashboard" },
    { key: "nav_sleep_analysis", defaultLabel: "Sleep Analysis", icon: Moon, href: "/recovery?tab=sleep" },
    { key: "nav_doms_tracker", defaultLabel: "DOMS Soreness", icon: ShieldAlert, href: "/recovery?tab=doms" },
    { key: "nav_mobility", defaultLabel: "Mobility", icon: Activity, href: "/recovery?tab=mobility" },
    { key: "nav_stretching", defaultLabel: "Stretching", icon: HeartPulse, href: "/recovery?tab=stretching" },
    { key: "nav_rest_day", defaultLabel: "Rest Day Planner", icon: Moon, href: "/recovery?tab=rest-day" },
    { key: "nav_ai_coach", defaultLabel: "AI Fitness Coach", icon: Sparkles, href: "/coach", badge: "AI" },
    { key: "nav_form_coach", defaultLabel: "Smart Form Coach", icon: Camera, href: "/form-coach", badge: "CV" },
    { key: "nav_digital_twin", defaultLabel: "AI Digital Twin", icon: Sparkles, href: "/twin" },
    { key: "nav_sports_performance" as any, defaultLabel: "Sports & Performance", icon: Trophy, href: "/sports", badge: "NEW" },
    { key: "nav_community", defaultLabel: "Community", icon: Users, href: "/community" },
    { key: "nav_achievements", defaultLabel: "Achievements", icon: Trophy, href: "/achievements" },
    { key: "nav_sih_demo", defaultLabel: "SIH Demo Mode", icon: Sparkles, href: "/adaptive-demo" },
  ];

  const bottomItems: NavItemConfig[] = [
    { key: "nav_settings", defaultLabel: "Settings", icon: Settings, href: "/settings" },
  ];

  const filteredItems = navItems.filter((item) => {
    const label = item.key ? t(item.key, item.defaultLabel) : item.defaultLabel;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-[var(--background-secondary)] border-r border-[var(--border)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#4d8eff] to-[#1e50ff] flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-[var(--foreground)] text-lg">Ojas AI</h1>
                  <p className="text-xs text-[var(--foreground-muted)]">Fitness Operating System</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors lg:hidden"
              >
                <X className="h-5 w-5 text-[var(--foreground-muted)]" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
                <input
                  type="text"
                  placeholder={t("common_loading", "Search...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-2">
              <div className="space-y-1">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const label = item.key ? t(item.key, item.defaultLabel) : item.defaultLabel;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                        isActive
                          ? "bg-[var(--accent-glow)] text-[var(--accent)] font-semibold"
                          : "text-[var(--foreground-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-[var(--accent)]" : ""}`} />
                      <span className="flex-1 text-sm font-medium">{label}</span>
                      {item.badge && (
                        <Badge variant="primary" label={item.badge} />
                      )}
                      {item.premium && (
                        <Crown className="h-3 w-3 text-[var(--warning)]" />
                      )}
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <div className="space-y-1">
                  {bottomItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const label = item.key ? t(item.key, item.defaultLabel) : item.defaultLabel;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-[var(--accent-glow)] text-[var(--accent)] font-semibold"
                            : "text-[var(--foreground-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-[var(--border)]">
              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={userName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{userName}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">Ojas Core</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
