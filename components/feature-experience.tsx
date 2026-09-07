"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { TopNav, Sidebar, BottomNav, GlobalAIButton } from "@/components/navigation";
import { WorkoutView } from "@/components/fitness/workout-view";
import { FoodView } from "@/components/fitness/food-view";
import { RecoveryView } from "@/components/fitness/recovery-view";
import { FormCoachView } from "@/components/fitness/form-coach-view";
import { BiomechanicsView } from "@/components/fitness/biomechanics-view";
import { MotionLabView } from "@/components/fitness/motion-lab-view";
import { MusicView } from "@/components/fitness/music-view";
import { ProgressView } from "@/components/fitness/progress-view";
import { TwinView } from "@/components/fitness/twin-view";
import { CommunityView } from "@/components/fitness/community-view";
import { ProfileView } from "@/components/fitness/profile-view";
import { SettingsView } from "@/components/fitness/settings-view";
import { NotificationsView } from "@/components/fitness/premium/notifications-view";
import { CoachChat } from "@/components/fitness/coach-chat";
import { AiNutritionCoach } from "@/components/fitness/ai-nutrition-coach";
import { AiRecoveryCoach } from "@/components/fitness/ai-recovery-coach";
import { userState } from "@/lib/userState";

type RouteDefinition = {
  title: string;
  domain: string;
  availability: "Implemented" | "Experimental";
  component: React.ReactNode;
};

const routeDefinitions: Record<string, RouteDefinition> = {
  "train": { title: "Train", domain: "Training", availability: "Implemented", component: <WorkoutView /> },
  "train/today": { title: "Today’s workout", domain: "Training", availability: "Implemented", component: <><PlanChangeReasoning /><WorkoutView initialTab="dashboard" /></> },
  "train/plan": { title: "Workout planner", domain: "Training", availability: "Implemented", component: <WorkoutView initialTab="generator" /> },
  "train/exercises": { title: "Exercise library", domain: "Training", availability: "Implemented", component: <WorkoutView initialTab="library" /> },
  "train/history": { title: "Training history", domain: "Training", availability: "Implemented", component: <WorkoutView initialTab="history" /> },
  "train/music": { title: "Training music", domain: "Training", availability: "Implemented", component: <MusicView /> },
  "train/mobility": { title: "Mobility", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="mobility" /> },
  "train/stretching": { title: "Stretching", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="stretching" /> },
  "train/rest-day": { title: "Rest-day planner", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="rest-day" /> },
  "movement": { title: "Movement intelligence", domain: "Movement", availability: "Implemented", component: <BiomechanicsView /> },
  "movement/form-coach": { title: "Form Coach", domain: "Movement", availability: "Implemented", component: <FormCoachView /> },
  "movement/biomechanics": { title: "Biomechanics", domain: "Movement", availability: "Implemented", component: <BiomechanicsView /> },
  "movement/motion-lab": { title: "Motion Lab", domain: "Movement", availability: "Implemented", component: <MotionLabView /> },
  "movement/exercises": { title: "Movement exercises", domain: "Movement", availability: "Implemented", component: <FormCoachView initialTab="exercises" /> },
  "movement/session-history": { title: "Form session history", domain: "Movement", availability: "Implemented", component: <FormCoachView initialTab="history" /> },
  "movement/workout-replay": { title: "Workout replay", domain: "Movement", availability: "Implemented", component: <FormCoachView initialTab="replay" /> },
  "movement/tutorials": { title: "Movement tutorials", domain: "Movement", availability: "Implemented", component: <FormCoachView initialTab="tutorials" /> },
  "movement/analytics": { title: "Movement analytics", domain: "Movement", availability: "Implemented", component: <FormCoachView initialTab="progress" /> },
  "nutrition": { title: "Nutrition", domain: "Nutrition", availability: "Implemented", component: <FoodView /> },
  "nutrition/scan": { title: "Food log & scan", domain: "Nutrition", availability: "Implemented", component: <FoodView initialTab="scanner" /> },
  "nutrition/log": { title: "Food log", domain: "Nutrition", availability: "Implemented", component: <FoodView initialTab="scanner" /> },
  "nutrition/meal-plan": { title: "Meal planner", domain: "Nutrition", availability: "Implemented", component: <FoodView initialTab="planner" /> },
  "nutrition/analytics": { title: "Nutrition analytics", domain: "Nutrition", availability: "Implemented", component: <FoodView initialTab="analytics" /> },
  "nutrition/recipes": { title: "Recipe maker", domain: "Nutrition", availability: "Implemented", component: <FoodView initialTab="recipes" /> },
  "nutrition/grocery": { title: "Grocery assistant", domain: "Nutrition", availability: "Implemented", component: <FoodView initialTab="grocery" /> },
  "nutrition/budget": { title: "Budget coach", domain: "Nutrition", availability: "Implemented", component: <FoodView initialTab="budget" /> },
  "nutrition/recovery": { title: "Nutrition recovery", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="nutrition" /> },
  "nutrition/dining": { title: "Restaurant dining", domain: "Nutrition", availability: "Implemented", component: <FoodView initialTab="restaurant" /> },
  "nutrition/notifications": { title: "Nutrition alerts", domain: "Nutrition", availability: "Implemented", component: <FoodView initialTab="notifications" /> },
  "recovery/dashboard": { title: "Recovery dashboard", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="dashboard" /> },
  "recovery/sleep": { title: "Sleep", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="sleep" /> },
  "recovery/fatigue": { title: "Fatigue", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="fatigue" /> },
  "recovery/doms": { title: "DOMS", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="doms" /> },
  "recovery/hydration": { title: "Hydration", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="hydration" /> },
  "recovery/calendar": { title: "Recovery calendar", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="calendar" /> },
  "recovery/timeline": { title: "Recovery timeline", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="timeline" /> },
  "recovery/history": { title: "Recovery history", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="history" /> },
  "recovery/analytics": { title: "Recovery analytics", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="analytics" /> },
  "recovery/decision": { title: "Recovery decision", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="decision" /> },
  "recovery/notifications": { title: "Recovery alerts", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="notifications" /> },
  "recovery/weekly-review": { title: "Weekly recovery review", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="review" /> },
  "recovery/rest-day": { title: "Rest-day planner", domain: "Recovery", availability: "Implemented", component: <RecoveryView initialTab="rest-day" /> },
  "coach": { title: "AI Coach", domain: "AI Coach", availability: "Implemented", component: <CoachChat initialTab="home" /> },
  "coach/chat": { title: "Coach chat", domain: "AI Coach", availability: "Implemented", component: <CoachChat initialTab="chat" /> },
  "coach/plans": { title: "Coach plans", domain: "AI Coach", availability: "Implemented", component: <CoachChat initialTab="plans" /> },
  "coach/insights": { title: "Coach insights", domain: "AI Coach", availability: "Implemented", component: <CoachChat initialTab="insights" /> },
  "coach/memory": { title: "Coach memory", domain: "AI Coach", availability: "Implemented", component: <CoachChat initialTab="memory" /> },
  "coach/voice": { title: "Coach voice", domain: "AI Coach", availability: "Experimental", component: <CoachChat initialTab="voice" /> },
  "coach/nutrition": { title: "Nutrition Coach", domain: "AI Coach", availability: "Implemented", component: <AiNutritionCoach /> },
  "coach/recovery": { title: "Recovery Coach", domain: "AI Coach", availability: "Implemented", component: <AiRecoveryCoach /> },
  "progress/overview": { title: "Progress overview", domain: "Progress", availability: "Implemented", component: <ProgressView /> },
  "progress/history": { title: "Progress history", domain: "Progress", availability: "Implemented", component: <ProgressView /> },
  "progress/analytics": { title: "Progress analytics", domain: "Progress", availability: "Implemented", component: <ProgressView /> },
  "progress/adherence": { title: "Progress adherence", domain: "Progress", availability: "Implemented", component: <ProgressView /> },
  "progress/achievements": { title: "Achievements", domain: "Progress", availability: "Implemented", component: <ProgressView /> },
  "twin/overview": { title: "Digital Twin", domain: "Digital Twin", availability: "Implemented", component: <TwinView /> },
  "community": { title: "Community", domain: "Community", availability: "Implemented", component: <CommunityView /> },
  "profile": { title: "Profile", domain: "Account", availability: "Implemented", component: <ProfileView /> },
  "settings": { title: "Settings", domain: "Account", availability: "Implemented", component: <SettingsView /> },
  "notifications": { title: "Notifications", domain: "Account", availability: "Experimental", component: <NotificationsView /> },
};

export const featureRoutePaths = Object.keys(routeDefinitions);

const directoryGroups = [
  { name: "Training", paths: ["train/today", "train/plan", "train/exercises", "train/mobility", "train/stretching", "train/rest-day", "train/history", "train/music"] },
  { name: "Movement Intelligence", paths: ["movement/form-coach", "movement/biomechanics", "movement/motion-lab", "movement/exercises", "movement/workout-replay", "movement/tutorials", "movement/analytics"] },
  { name: "Nutrition", paths: ["nutrition/scan", "nutrition/meal-plan", "nutrition/analytics", "nutrition/recipes", "nutrition/grocery", "nutrition/budget", "nutrition/dining", "nutrition/notifications"] },
  { name: "Recovery", paths: ["recovery/dashboard", "recovery/sleep", "recovery/fatigue", "recovery/doms", "recovery/hydration", "recovery/calendar", "recovery/timeline", "recovery/analytics", "recovery/decision", "recovery/weekly-review"] },
  { name: "AI Coach", paths: ["coach/chat", "coach/plans", "coach/insights", "coach/memory", "coach/voice"] },
  { name: "Progress", paths: ["progress/overview", "progress/history", "progress/analytics", "progress/adherence", "progress/achievements"] },
  { name: "Digital Twin", paths: ["twin/overview"] },
  { name: "Community", paths: ["community"] },
  { name: "Account", paths: ["profile", "notifications", "settings"] },
];

export function FeatureDirectory() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <FeatureLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <div className="mb-8 max-w-3xl space-y-3">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">OJAS feature directory</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Explore what OJAS can do today</h1>
        <p className="text-sm leading-6 text-[var(--foreground-muted)]">Every link opens an existing OJAS view. Availability labels distinguish production-ready surfaces from experimental integrations.</p>
      </div>
      <div className="space-y-10">
        {directoryGroups.map((group) => (
          <section key={group.name}>
            <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">{group.name}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.paths.map((path) => {
                const route = routeDefinitions[path];
                return <FeatureCard key={path} path={path} route={route} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </FeatureLayout>
  );
}

function FeatureCard({ path, route }: { path: string; route: RouteDefinition }) {
  return (
    <GlassCard className="flex min-h-40 flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">{route.title}</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">Existing {route.domain.toLowerCase()} capability, using the current OJAS state and services.</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${route.availability === "Implemented" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>{route.availability}</span>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 text-xs text-[var(--foreground-muted)]"><span>{route.domain}</span><Link href={`/${path}`} className="rounded-lg bg-[var(--accent)] px-3 py-2 font-bold text-[var(--background)]">Open</Link></div>
    </GlassCard>
  );
}

function PlanChangeReasoning() {
  const { availableTime } = userState.context;
  const { recovery } = userState.digitalTwin;
  return (
    <GlassCard className="mb-6 space-y-4 border-[var(--accent)]/20 p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">Why OJAS changed your plan</p>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Based on your current state, OJAS uses these existing readiness inputs for today&apos;s recommendation.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <ReasonMetric label="Available time" value={`${availableTime} min`} />
        <ReasonMetric label="Sleep readiness" value={`${recovery.sleepScore}/100`} />
        <ReasonMetric label="Recovery" value={`${recovery.score}/100`} />
      </div>
      <p className="text-xs leading-5 text-[var(--foreground-muted)]">OJAS adjusted today&apos;s recommendation around your available time, recovery, sleep readiness, fatigue, and current goal. This is training guidance, not a medical diagnosis.</p>
    </GlassCard>
  );
}

function ReasonMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><p className="text-[11px] text-[var(--foreground-muted)]">{label}</p><p className="mt-1 text-lg font-bold text-[var(--foreground)]">{value}</p></div>;
}

export function FeatureExperience({ path }: { path: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const route = routeDefinitions[path];

  if (!route) {
    return (
      <FeatureLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <GlassCard className="space-y-4 p-6 text-center">
          <p className="text-sm text-[var(--foreground-muted)]">This path is not an exposed OJAS feature.</p>
          <Link href="/features" className="text-sm font-bold text-[var(--accent)]">Browse implemented features</Link>
        </GlassCard>
      </FeatureLayout>
    );
  }

  return (
    <FeatureLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/features" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
            <ArrowLeft className="h-3.5 w-3.5" /> Feature directory
          </Link>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">{route.domain} · {route.availability}</p>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{route.title}</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-glow)] px-3 py-1.5 text-[11px] font-bold text-[var(--accent)]"><Sparkles className="h-3.5 w-3.5" /> {route.availability}</span>
      </div>
      {route.component}
    </FeatureLayout>
  );
}

function FeatureLayout({ children, sidebarOpen, setSidebarOpen }: { children: React.ReactNode; sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  return (
    <div className="min-h-screen bg-[var(--gradient-hero)] text-[var(--foreground)]">
      <TopNav onMenuClick={() => setSidebarOpen(true)} userName="Maya Chen" notificationCount={3} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userName="Maya Chen" />
      <main className="pt-20 pb-24 lg:pb-8 lg:pl-80"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div></main>
      <BottomNav />
      <GlobalAIButton />
    </div>
  );
}
