"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Search, User, Sparkles, X, Dumbbell } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { OjasLiteToggle } from "@/components/fitness/ojas-lite-toggle";
import { useTranslation } from "@/lib/i18n";

interface TopNavProps {
  onMenuClick: () => void;
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
}

export function TopNav({ onMenuClick, userName = "Anil Kumar", userAvatar, notificationCount = 0 }: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 px-4 py-3 bg-[var(--background-secondary)]/80 backdrop-blur-xl border-b border-[var(--border)]"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] flex items-center justify-center text-black">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="font-bold text-[var(--foreground)] hidden sm:block">Ojas AI</span>
          </div>
        </div>

        {/* Center: Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search workouts, meals, insights..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Ojas Lite Mode Toggle */}
          <div className="hidden sm:block">
            <OjasLiteToggle />
          </div>

          {/* Centralized Language Selector */}
          <LanguageSelector />

          {/* Search (mobile) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-[var(--danger)] rounded-full text-[10px] font-medium text-white flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl shadow-[var(--elevation-lg)] overflow-hidden"
                >
                  <div className="p-4 border-b border-[var(--border)]">
                    <h3 className="font-semibold text-[var(--foreground)]">Notifications</h3>
                  </div>
                  <div className="p-4 text-center text-sm text-[var(--foreground-muted)]">
                    No new notifications
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
            <Avatar name={userName} size="sm" />
            <span className="text-xs font-semibold text-[var(--foreground)] hidden xl:block">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
