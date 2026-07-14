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
  UserCircle2,
  BellRing,
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
  Calendar,
  History,
  GitCompareArrows,
  Scale,
  Award,
  Play,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  icon: any;
  href: string;
  badge?: string;
  premium?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: Activity, href: "/dashboard" },
  { label: "Workouts", icon: Dumbbell, href: "/workouts" },
  { label: "  • Workout Home", icon: Dumbbell, href: "/workouts?tab=dashboard" },
  { label: "  • AI Generator", icon: Sparkles, href: "/workouts?tab=generator" },
  { label: "  • Exercise Library", icon: Search, href: "/workouts?tab=library" },
  { label: "  • Personal Records", icon: Trophy, href: "/workouts?tab=history" },
  { label: "Nutrition", icon: UtensilsCrossed, href: "/nutrition" },
  { label: "  • Nutrition Dashboard", icon: Apple, href: "/nutrition?tab=dashboard" },
  { label: "  • AI Meal Planner", icon: Sparkles, href: "/nutrition?tab=planner" },
  { label: "  • Food & Scanner Log", icon: Camera, href: "/nutrition?tab=scanner" },
  { label: "  • AI Dietitian Coach", icon: UtensilsCrossed, href: "/nutrition?tab=coach" },
  { label: "  • Grocery List", icon: ShoppingCart, href: "/nutrition?tab=grocery" },
  { label: "  • Recipe Maker", icon: BookOpen, href: "/nutrition?tab=recipes" },
  { label: "  • Water Tracker", icon: Waves, href: "/nutrition?tab=water" },
  { label: "  • Nutrition Analytics", icon: TrendingUp, href: "/nutrition?tab=analytics" },
  { label: "  • Restaurant Dining", icon: MapPin, href: "/nutrition?tab=restaurant" },
  { label: "  • Smart Alerts", icon: Bell, href: "/nutrition?tab=notifications" },
  { label: "Analytics & Insights Hub", icon: BarChart3, href: "/progress" },
  { label: "Recovery", icon: HeartPulse, href: "/recovery" },
  { label: "  • Recovery Dashboard", icon: Activity, href: "/recovery?tab=dashboard" },
  { label: "  • Sleep Analysis", icon: Moon, href: "/recovery?tab=sleep" },
  { label: "  • DOMS Tracker", icon: ShieldAlert, href: "/recovery?tab=doms" },
  { label: "  • Mobility", icon: Activity, href: "/recovery?tab=mobility" },
  { label: "  • Stretching", icon: HeartPulse, href: "/recovery?tab=stretching" },
  { label: "  • Rest Day Planner", icon: Moon, href: "/recovery?tab=rest-day" },
  { label: "  • Decision Engine", icon: GitCompareArrows, href: "/recovery?tab=decision" },
  { label: "  • Recovery Budget", icon: Scale, href: "/recovery?tab=budget" },
  { label: "  • Weekly Review", icon: Award, href: "/recovery?tab=review" },
  { label: "  • Analytics", icon: BarChart3, href: "/recovery?tab=analytics" },
  { label: "AI Coach", icon: Sparkles, href: "/coach", badge: "AI" },
  { label: "  • Coach Home", icon: Sparkles, href: "/coach?tab=home" },
  { label: "  • Chat Coach", icon: Sparkles, href: "/coach?tab=chat" },
  { label: "  • Voice Assistant", icon: Sparkles, href: "/coach?tab=voice" },
  { label: "  • AI Plans", icon: Sparkles, href: "/coach?tab=plans" },
  { label: "  • AI Insights", icon: Sparkles, href: "/coach?tab=insights" },
  { label: "  • Memory Vault", icon: Sparkles, href: "/coach?tab=memory" },
  { label: "Form Coach", icon: Camera, href: "/form-coach", badge: "CV" },
  { label: "  • Workout Camera", icon: Camera, href: "/workout-camera" },
  { label: "  • Workout Replay", icon: Play, href: "/form-coach?tab=replay" },
  { label: "  • Movement Analytics", icon: BarChart3, href: "/form-coach?tab=progress" },
  { label: "  • Biomechanics Lab", icon: Activity, href: "/biomechanics" },
  { label: "  • Motion Laboratory", icon: Activity, href: "/motion-lab" },
  { label: "Vision Lens", icon: Camera, href: "/vision", premium: true },
  { label: "Music", icon: Music, href: "/music" },
  { label: "Community", icon: Users, href: "/community" },
  { label: "Motivation & Habits", icon: Trophy, href: "/motivation" },
  { label: "Premium", icon: Crown, href: "/premium", premium: true },
  { label: "  • Future Simulator", icon: Activity, href: "/premium/future-simulator", premium: true },
  { label: "  • AI Digital Twin", icon: Activity, href: "/premium/digital-twin", premium: true },
  { label: "  • Injury Risk Audit", icon: Activity, href: "/premium/injury-risk", premium: true },
  { label: "  • BI Analytics", icon: Activity, href: "/premium/analytics", premium: true },
  { label: "  • Wearable Sync", icon: Activity, href: "/premium/wearables", premium: true },
  { label: "  • AI Meal Planner", icon: Activity, href: "/premium/meal-ai", premium: true },
  { label: "  • Weekly Calendar", icon: Activity, href: "/premium/weekly-planner", premium: true },
  { label: "  • Smart Alert Suite", icon: Activity, href: "/premium/notifications", premium: true },
  { label: "  • Visual Automations", icon: Activity, href: "/premium/automation", premium: true },
];

const bottomItems: NavItem[] = [
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Admin", icon: ShieldCheck, href: "/admin" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userAvatar?: string;
}

export function Sidebar({ isOpen, onClose, userName = "User", userAvatar }: SidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-[var(--foreground)]">Titan</h1>
                  <p className="text-xs text-[var(--foreground-muted)]">AI Fitness OS</p>
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
                  placeholder="Search..."
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
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                        isActive
                          ? "bg-[var(--accent-glow)] text-[var(--accent)]"
                          : "text-[var(--foreground-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-[var(--accent)]" : ""}`} />
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
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
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-[var(--accent-glow)] text-[var(--accent)]"
                            : "text-[var(--foreground-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.label}</span>
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
                  <Avatar src={userAvatar} name={userName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{userName}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">Free Plan</p>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors">
                    <LogOut className="h-4 w-4 text-[var(--foreground-muted)]" />
                  </button>
                </div>
              </GlassCard>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
