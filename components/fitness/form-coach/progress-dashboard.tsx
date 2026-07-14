"use client";

import { TrendingUp, Target, Award, Repeat, CalendarDays } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Chart } from "@/components/ui/chart";
import { ProgressRing } from "@/components/ui/progress-ring";
import type { AnalyticsSummary } from "@/lib/vision";

export function ProgressDashboard({ analytics }: { analytics: AnalyticsSummary | null }) {
  if (!analytics) {
    return <GlassCard className="grid place-items-center py-12 text-sm text-white/50">Loading analytics…</GlassCard>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<CalendarDays className="h-4 w-4 text-[#adc6ff]" />} label="Sessions" value={analytics.totalSessions} sub={`${analytics.sessionsThisWeek} this week`} />
        <Kpi icon={<Repeat className="h-4 w-4 text-cyan-300" />} label="Total reps" value={analytics.totalReps} sub="analyzed" />
        <Kpi icon={<Target className="h-4 w-4 text-emerald-300" />} label="Avg form" value={`${analytics.avgFormScore}`} sub="/ 100" />
        <Kpi icon={<Award className="h-4 w-4 text-amber-300" />} label="Best form" value={`${analytics.bestFormScore}`} sub="/ 100" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <ChartTitle icon={<TrendingUp className="h-4 w-4 text-[#adc6ff]" />} title="Form score trend" />
          <Chart type="line" data={analytics.formScoreTrend} color="#adc6ff" height={220} />
        </GlassCard>
        <GlassCard>
          <ChartTitle icon={<Repeat className="h-4 w-4 text-cyan-300" />} title="Rep quality (form)" />
          <Chart type="area" data={analytics.repQualityTrend} color="#38bdf8" height={220} />
        </GlassCard>
        <GlassCard>
          <ChartTitle icon={<Target className="h-4 w-4 text-emerald-300" />} title="Consistency" />
          <Chart type="line" data={analytics.consistencyTrend} color="#34d399" height={220} />
        </GlassCard>
        <GlassCard>
          <ChartTitle icon={<CalendarDays className="h-4 w-4 text-amber-300" />} title="Session frequency (reps/day)" />
          <Chart type="bar" data={analytics.frequencyTrend} color="#fbbf24" height={220} />
        </GlassCard>
      </div>

      <GlassCard className="space-y-3">
        <ChartTitle title="Top exercises" />
        <div className="space-y-2">
          {analytics.topExercises.length === 0 && <p className="text-xs text-white/40">No exercise data yet.</p>}
          {analytics.topExercises.map((e) => (
            <div key={e.name} className="flex items-center gap-3">
              <span className="w-28 truncate text-xs text-white/70">{e.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-[#adc6ff] to-[#4d8eff]" style={{ width: `${Math.min(100, (e.reps / (analytics.topExercises[0]?.reps || 1)) * 100)}%` }} />
              </div>
              <span className="w-16 text-right text-xs text-white/50">{e.reps} reps</span>
              <span className="w-10 text-right text-xs text-emerald-300">{e.score}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function Kpi({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub: string }) {
  return (
    <GlassCard className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-black/30">{icon}</div>
      <div>
        <p className="text-[10px] uppercase text-white/40">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
        <p className="text-[9px] text-white/40">{sub}</p>
      </div>
    </GlassCard>
  );
}

function ChartTitle({ icon, title }: { icon?: React.ReactNode; title: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      {icon}
      <h4 className="text-sm font-bold text-white">{title}</h4>
    </div>
  );
}
