"use client";

import React, { useState } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { UserCircle2, ShieldAlert, Sparkles, RefreshCw, Trophy, Download, Trash2, Settings, Lock, Heart, Target, Calendar, Award, Zap, Crown, Bell, Smartphone, Watch, Activity, Check, Plus, Apple, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";

export function ProfileView() {
  const { profile, metrics, calorieTargets, macroTargets, resetData } = useFitness();
  const [activeTab, setActiveTab] = useState<"overview" | "goals" | "achievements" | "privacy" | "subscription" | "nutrition">("overview");

  const handleExportData = () => {
    if (typeof window === "undefined") return;
    let logsHistory = [];
    let checkInHistory = [];
    let preferences = {};
    try {
      logsHistory = localStorage.getItem("lumina_logs") ? JSON.parse(localStorage.getItem("lumina_logs")!) : [];
      checkInHistory = localStorage.getItem("lumina_checkins") ? JSON.parse(localStorage.getItem("lumina_checkins")!) : [];
      preferences = localStorage.getItem("titan_preferences") ? JSON.parse(localStorage.getItem("titan_preferences")!) : {};
    } catch (e) {
      console.error("Error reading localStorage for export", e);
    }
    const data = {
      profile,
      metrics,
      calorieTargets,
      macroTargets,
      logsHistory,
      checkInHistory,
      preferences,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ojas-profile-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you absolutely sure you want to permanently delete your account and purge all data? This action cannot be undone.")) {
      resetData();
      localStorage.removeItem("titan_preferences");
      localStorage.removeItem("titan_auth");
      window.location.reload();
    }
  };

  if (!profile || !metrics || !calorieTargets || !macroTargets) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin text-2xl text-[var(--accent)]">🔄</div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: UserCircle2 },
    { id: "goals", label: "Goals", icon: Target },
    { id: "nutrition", label: "Nutrition", icon: Apple },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "subscription", label: "Subscription", icon: Crown },
  ] as const;

  const achievements = [
    { id: 1, title: "7-Day Streak", description: "Completed workouts for 7 consecutive days", progress: 100, icon: Zap },
    { id: 2, title: "Early Bird", description: "Completed 5 workouts before 8 AM", progress: 60, icon: Activity },
    { id: 3, title: "Protein Master", description: "Hit protein targets for 30 days", progress: 45, icon: Award },
    { id: 4, title: "Marathon Runner", description: "Logged 100km of cardio", progress: 20, icon: Heart },
  ];

  const connectedDevices = [
    { id: 1, name: "Apple Watch Series 8", type: "watch", connected: true, lastSync: "2 hours ago" },
    { id: 2, name: "iPhone 15 Pro", type: "phone", connected: true, lastSync: "5 minutes ago" },
    { id: 3, name: "Garmin Forerunner", type: "watch", connected: false, lastSync: "Never" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-white">
              <UserCircle2 className="h-12 w-12" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[var(--success)] border-2 border-[var(--background-secondary)] flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Maya Chen</h2>
              <Badge variant="primary" label="Premium" />
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">Member since January 2024</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
                <Trophy className="h-3 w-3 text-[var(--warning)]" />
                <span>12 achievements</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
                <Activity className="h-3 w-3 text-[var(--accent)]" />
                <span>Active streak: 14 days</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Biological Parameters */}
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-[var(--accent)]" /> Biological Parameters
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[var(--foreground-muted)] text-xs block">Age</span>
                <span className="font-semibold text-[var(--foreground)]">{profile.age} years</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] text-xs block">Gender</span>
                <span className="font-semibold text-[var(--foreground)] capitalize">{profile.gender}</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] text-xs block">Height / Weight</span>
                <span className="font-semibold text-[var(--foreground)]">{profile.height} cm / {profile.weight} kg</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] text-xs block">BMI</span>
                <span className="font-semibold text-[var(--foreground)]">{metrics.bmi.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] text-xs block">Body Fat</span>
                <span className="font-semibold text-[var(--foreground)]">{profile.bodyFat || "N/A"}%</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] text-xs block">Activity Level</span>
                <span className="font-semibold text-[var(--foreground)] capitalize">{(profile.activityLevel || "moderately-active").replace("-", " ")}</span>
              </div>
            </div>
          </GlassCard>

          {/* Connected Devices */}
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[var(--accent)]" /> Connected Devices
            </h3>
            <div className="space-y-3">
              {connectedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)]">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${device.connected ? "bg-[var(--success-subtle)] text-[var(--success)]" : "bg-[var(--surface-hover)] text-[var(--foreground-muted)]"}`}>
                      {device.type === "watch" ? <Watch className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--foreground)] text-sm">{device.name}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">Last sync: {device.lastSync}</p>
                    </div>
                  </div>
                  <Badge variant={device.connected ? "primary" : "neutral"} label={device.connected ? "Connected" : "Disconnected"} />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add New Device
            </Button>
          </GlassCard>

          {/* Current Program Targets */}
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--accent)]" /> Current Program Targets
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Daily Calorie Target</span>
                <span className="font-bold text-[var(--foreground)]">{calorieTargets.activeTarget} kcal</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Protein Allocation</span>
                <span className="font-bold text-[var(--foreground)]">{macroTargets.protein.grams}g ({macroTargets.protein.calories} kcal)</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Carbohydrate Allocation</span>
                <span className="font-bold text-[var(--foreground)]">{macroTargets.carbs.grams}g ({macroTargets.carbs.calories} kcal)</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Lipid (Fat) Allocation</span>
                <span className="font-bold text-[var(--foreground)]">{macroTargets.fat.grams}g ({macroTargets.fat.calories} kcal)</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Target Water Hydration</span>
                <span className="font-bold text-[var(--foreground)]">{macroTargets.water} Liters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Weekly Step Target</span>
                <span className="font-bold text-[var(--foreground)]">{profile.dailyStepGoal} steps/day</span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Settings className="h-5 w-5 text-[var(--accent)]" /> Quick Actions
            </h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export My Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notification Preferences
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Sync Calendar
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "goals" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Target className="h-5 w-5 text-[var(--accent)]" /> Fitness Goals
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[var(--foreground)]">Primary Goal</span>
                  <Badge variant="primary" label={profile.goal} />
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">Your main fitness objective</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[var(--foreground)]">Target Weight</span>
                  <span className="font-bold text-[var(--accent)]">{profile.targetWeight || "N/A"} kg</span>
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">Your target weight goal</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[var(--foreground)]">Timeline</span>
                  <span className="font-bold text-[var(--accent)]">{profile.timelineWeeks || "N/A"} weeks</span>
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">Expected time to reach goal</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Activity className="h-5 w-5 text-[var(--accent)]" /> Activity Schedule
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[var(--foreground)]">Workout Days</span>
                  <span className="font-bold text-[var(--accent)]">{profile.workoutDaysPerWeek} days/week</span>
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">Your weekly training frequency</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[var(--foreground)]">Daily Steps</span>
                  <span className="font-bold text-[var(--accent)]">{profile.dailyStepGoal} steps</span>
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">Your daily activity target</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[var(--foreground)]">Available Equipment</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(profile.availableEquipment || []).map((eq) => (
                    <Badge key={eq} variant="neutral" label={eq} />
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "nutrition" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Apple className="h-5 w-5 text-[var(--accent)]" /> Nutrition Preferences
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Food Preference</span>
                <span className="font-bold text-[var(--foreground)] capitalize">{profile.foodPreference}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Allergies</span>
                <span className="font-bold text-[var(--foreground)]">{profile.allergies || "None"}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Medical Conditions</span>
                <span className="font-bold text-[var(--foreground)]">{profile.medicalConditions || "None"}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Budget</span>
                <span className="font-bold text-[var(--foreground)] capitalize">{profile.budget}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Sleep Duration</span>
                <span className="font-bold text-[var(--foreground)]">{profile.sleepDuration || "N/A"} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Stress Level</span>
                <span className="font-bold text-[var(--foreground)] capitalize">{profile.stressLevel || "N/A"}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--accent)]" /> Active Nutrition Targets
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Daily Calories</span>
                <span className="font-bold text-[var(--foreground)]">{calorieTargets.activeTarget} kcal</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Protein Target</span>
                <span className="font-bold text-[var(--foreground)]">{macroTargets.protein.grams}g</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Carb Target</span>
                <span className="font-bold text-[var(--foreground)]">{macroTargets.carbs.grams}g</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Fat Target</span>
                <span className="font-bold text-[var(--foreground)]">{macroTargets.fat.grams}g</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--foreground-muted)]">Water Target</span>
                <span className="font-bold text-[var(--foreground)]">{macroTargets.water}L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Fiber Target</span>
                <span className="font-bold text-[var(--foreground)]">{macroTargets.fiber}g</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <GlassCard key={achievement.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <ProgressRing progress={achievement.progress} size={60} strokeWidth={4} color="var(--accent)" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[var(--accent)]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[var(--foreground)]">{achievement.title}</h4>
                    <p className="text-sm text-[var(--foreground-muted)] mt-1">{achievement.description}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--foreground-muted)]">Progress</span>
                        <span className="font-medium text-[var(--foreground)]">{achievement.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] transition-all"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {activeTab === "privacy" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Lock className="h-5 w-5 text-[var(--accent)]" /> Privacy Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)]">
                <div>
                  <p className="font-medium text-[var(--foreground)]">Profile Visibility</p>
                  <p className="text-sm text-[var(--foreground-muted)]">Control who can see your profile</p>
                </div>
                <select className="rounded-lg border border-[var(--border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-[var(--foreground)]">
                  <option>Private</option>
                  <option>Friends Only</option>
                  <option>Public</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)]">
                <div>
                  <p className="font-medium text-[var(--foreground)]">Data Sharing</p>
                  <p className="text-sm text-[var(--foreground-muted)]">Share anonymous data for research</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-[var(--accent)] relative cursor-pointer">
                  <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)]">
                <div>
                  <p className="font-medium text-[var(--foreground)]">Activity Status</p>
                  <p className="text-sm text-[var(--foreground-muted)]">Show when you're active</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-[var(--surface-hover)] relative cursor-pointer">
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-[var(--foreground-muted)]" />
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[var(--danger)]" /> Danger Zone
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--danger-subtle)] border border-[var(--danger)]/20">
                <h4 className="font-semibold text-[var(--danger)] mb-2">Export Data</h4>
                <p className="text-sm text-[var(--foreground-muted)] mb-3">Download all your data in a portable format</p>
                <Button variant="outline" className="w-full" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
              </div>
              <div className="p-4 rounded-xl bg-[var(--danger-subtle)] border border-[var(--danger)]/20">
                <h4 className="font-semibold text-[var(--danger)] mb-2">Delete Account</h4>
                <p className="text-sm text-[var(--foreground-muted)] mb-3">Permanently delete your account and all data</p>
                <Button variant="danger" className="w-full" onClick={handleDeleteAccount}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "subscription" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Crown className="h-5 w-5 text-[var(--warning)]" /> Current Plan
              </h3>
              <Badge variant="primary" label="Premium" />
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent-glow)] to-[var(--surface)] border border-[var(--accent)]/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">$9.99</p>
                  <p className="text-sm text-[var(--foreground-muted)]">per month</p>
                </div>
                <Crown className="h-8 w-8 text-[var(--accent)]" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--foreground)]">
                  <Check className="h-4 w-4 text-[var(--success)]" />
                  <span>AI-powered workout plans</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--foreground)]">
                  <Check className="h-4 w-4 text-[var(--success)]" />
                  <span>Vision form correction</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--foreground)]">
                  <Check className="h-4 w-4 text-[var(--success)]" />
                  <span>Advanced analytics</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--foreground)]">
                  <Check className="h-4 w-4 text-[var(--success)]" />
                  <span>Priority support</span>
                </div>
              </div>
            </div>
            <Button variant="premium" className="w-full">
              Manage Subscription
            </Button>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-[var(--foreground)]">Billing History</h3>
            <div className="space-y-3">
              {[
                { date: "Jan 15, 2024", amount: "$9.99", status: "Paid" },
                { date: "Dec 15, 2023", amount: "$9.99", status: "Paid" },
                { date: "Nov 15, 2023", amount: "$9.99", status: "Paid" },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)]">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{invoice.date}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">Premium subscription</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--foreground)]">{invoice.amount}</p>
                    <Badge variant="success" label={invoice.status} />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full">
              View All Invoices
            </Button>
          </GlassCard>
        </div>
      )}

      {/* Reset Button */}
      <GlassCard className="border-[var(--danger)]/20 bg-[var(--danger-subtle)] space-y-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-[var(--danger)] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-[var(--danger)] text-sm">Reset Profile Data</h4>
            <p className="text-xs text-[var(--foreground-muted)] mt-1 leading-relaxed">
              Clearing your profile data will purge all progress history, calories logged, active training schedules, and chat history. This action is irreversible.
            </p>
          </div>
        </div>
        <Button
          variant="danger"
          onClick={resetData}
          className="w-full"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" /> Reset Profile & Onboarding
        </Button>
      </GlassCard>
    </div>
  );
}
