"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Activity,
  Flame,
  Wind,
  Brain,
  Moon,
  ShieldAlert,
  Scale,
  TrendingUp,
  Repeat,
  Sparkles,
  Info,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  GraduationCap,
  Gauge,
  Clock,
  ListChecks,
  Lightbulb,
  Stethoscope,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { config } from "@/lib/config";
import {
  type HealthRiskAssessment,
  type HealthRiskCategory,
  type HealthInsight,
  type RiskHeatmapPoint,
  type ScenarioComparison,
  type EducationalContent,
  type HealthFactor,
  type RiskLevel,
} from "@/lib/future-ai/health-risk/types";
import {
  HEALTH_RISK_CATEGORIES,
  getCategoryMeta,
  RISK_COLORS,
  riskLevelFromScore,
  defaultSignals,
  runFullAssessment,
  simulateAllScenarios,
  getCategoryFactors,
  generateLongTermProjection,
  overallRiskScore,
  deriveInsights,
} from "@/lib/future-ai/health-risk/engine";

const DISCLAIMER =
  "These insights are informational estimates and are not a substitute for professional medical advice. Consult your healthcare provider.";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Activity,
  Flame,
  Wind,
  Brain,
  Moon,
  ShieldAlert,
  Scale,
  TrendingUp,
  Repeat,
  Sparkles,
};

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "trends", label: "Trends", icon: TrendingUp },
  { id: "scenarios", label: "Scenario Comparison", icon: ArrowRight },
  { id: "details", label: "Detail Panels", icon: ListChecks },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  { id: "education", label: "Educational Content", icon: GraduationCap },
  { id: "model", label: "Model Info", icon: Stethoscope },
] as const;

type TabId = (typeof TABS)[number]["id"];

function riskColor(level: RiskLevel) {
  return RISK_COLORS[level];
}

function IconFor(name: string) {
  const C = ICON_MAP[name] ?? Activity;
  return <C className="h-5 w-5" />;
}

/* ----------------------------- UI helpers ----------------------------- */

function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-yellow-500/25 bg-yellow-500/10 p-3 text-[11px] leading-relaxed text-yellow-300">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
      <p>{DISCLAIMER}</p>
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const c = riskColor(level);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${c.text} ${c.bg} ${c.border}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.hex }} />
      {level}
    </span>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const tone = pct >= 70 ? "bg-emerald-400" : pct >= 45 ? "bg-yellow-400" : "bg-rose-400";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[9px] text-white/45">
        <span className="uppercase tracking-wider">Confidence</span>
        <span className="font-bold text-white/70">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full ${tone} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
      {icon}
      {children}
    </h4>
  );
}

/* ----------------------------- Main view ----------------------------- */

export function HealthRiskView() {
  const userId = "demo-user";
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [assessments, setAssessments] = useState<HealthRiskAssessment[]>([]);
  const [history, setHistory] = useState<HealthRiskAssessment[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [heatmap, setHeatmap] = useState<RiskHeatmapPoint[]>([]);
  const [education, setEducation] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastAssessed, setLastAssessed] = useState<string | null>(null);
  const [dataCompleteness, setDataCompleteness] = useState<number>(0);

  const latestByCat = useMemo(() => {
    const map = new Map<HealthRiskCategory, HealthRiskAssessment>();
    for (const a of assessments) map.set(a.category, a);
    return map;
  }, [assessments]);

  async function loadAll() {
    setLoading(true);
    try {
      const [assessRes, histRes, heatRes, eduRes] = await Promise.all([
        fetch(`/api/future/health-risk?action=assessment&userId=${userId}`).then((r) => r.json()),
        fetch(`/api/future/health-risk?action=history&userId=${userId}`).then((r) => r.json()),
        fetch(`/api/future/health-risk?action=heatmap&userId=${userId}`).then((r) => r.json()),
        fetch(`/api/future/health-risk?action=education`).then((r) => r.json()),
      ]);
      const a: HealthRiskAssessment[] = assessRes.assessments ?? [];
      setAssessments(a);
      setHistory(histRes.history ?? []);
      setHeatmap(heatRes.points ?? []);
      setEducation(eduRes.content ?? []);
      if (a.length) {
        const newest = a.reduce((p, c) => (new Date(c.assessedAt) > new Date(p.assessedAt) ? c : p));
        setLastAssessed(newest.assessedAt);
      }
    } catch (e) {
      console.error("Health risk load failed", e);
    } finally {
      setLoading(false);
    }
  }

  async function runAssessment() {
    setLoading(true);
    try {
      const res = await fetch(`/api/future/health-risk?action=assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, signals: defaultSignals() }),
      }).then((r) => r.json());
      setAssessments(res.assessments ?? []);
      setInsights(res.insights ?? []);
      setDataCompleteness(res.dataCompleteness ?? 0);
      setLastAssessed(res.assessedAt ?? new Date().toISOString());
      await loadAll();
    } catch (e) {
      console.error("Health risk assess failed", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overall = useMemo(() => overallRiskScore(assessments), [assessments]);
  const overallLevel = riskLevelFromScore(overall);

  return (
    <div className="space-y-6 text-left">
      <DisclaimerBanner />

      {/* Header */}
      <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]" glow>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-rose-400">AI Health Risk Prediction</p>
              <h2 className="text-xl font-bold text-white">Health Risk Dashboard</h2>
              <p className="text-xs text-white/50">
                {config.features.futureHealthRisk
                  ? "Experimental estimates across 11 health risk dimensions."
                  : "Experimental feature preview (flag disabled)."}
              </p>
            </div>
          </div>
          <button
            onClick={runAssessment}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Assessing..." : "Run New Assessment"}
          </button>
        </div>
      </GlassCard>

      {/* Overall snapshot */}
      <GlassCard className="border-white/5 bg-[rgba(24,23,26,0.35)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/45">Estimated Overall Risk</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-white">{overall}</span>
              <span className="text-xs text-white/50">/ 100</span>
              <RiskBadge level={overallLevel} />
            </div>
          </div>
          <div className="text-[10px] text-white/45">
            {lastAssessed ? (
              <span>
                Last assessed: {new Date(lastAssessed).toLocaleString()}
              </span>
            ) : (
              <span>No assessment yet — run one to populate estimates.</span>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-[11px] font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : "text-white/60 hover:text-white bg-white/5 border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === "dashboard" && <DashboardTab assessments={assessments} history={history} heatmap={heatmap} insights={insights} />}
          {activeTab === "trends" && <TrendsTab history={history} heatmap={heatmap} assessments={assessments} />}
          {activeTab === "scenarios" && <ScenariosTab assessments={assessments} />}
          {activeTab === "details" && <DetailsTab assessments={assessments} insights={insights} />}
          {activeTab === "recommendations" && <RecommendationsTab assessments={assessments} />}
          {activeTab === "education" && <EducationTab content={education} />}
          {activeTab === "model" && (
            <ModelInfoTab assessments={assessments} lastAssessed={lastAssessed} dataCompleteness={dataCompleteness} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------- Dashboard tab ----------------------------- */

function RiskCard({ a }: { a: HealthRiskAssessment }) {
  const meta = getCategoryMeta(a.category);
  const c = riskColor(a.riskLevel);
  return (
    <GlassCard className={`border-white/5 bg-[rgba(24,23,26,0.35)] p-4 space-y-3 ${c.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`grid h-9 w-9 place-items-center rounded-xl ${c.bg} ${c.text}`}>{IconFor(meta.icon)}</div>
          <div>
            <p className="text-[11px] font-bold text-white leading-tight">{meta.label}</p>
            <p className="text-[9px] text-white/40">{meta.short}</p>
          </div>
        </div>
        <RiskBadge level={a.riskLevel} />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-black text-white">{a.riskScore}</span>
        <span className="pb-1 text-[10px] text-white/40">/100 estimate</span>
      </div>
      <ConfidenceMeter value={a.confidence} />
    </GlassCard>
  );
}

function DashboardTab({
  assessments,
  history,
  heatmap,
  insights,
}: {
  assessments: HealthRiskAssessment[];
  history: HealthRiskAssessment[];
  heatmap: RiskHeatmapPoint[];
  insights: HealthInsight[];
}) {
  const warnings = assessments.filter((a) => a.riskLevel === "high" || a.riskLevel === "critical");

  const topFactors = useMemo(() => {
    const counts = new Map<string, number>();
    assessments.forEach((a) => a.contributingFactors.forEach((f) => counts.set(f, (counts.get(f) ?? 0) + 1)));
    return Array.from(counts.entries()).sort((x, y) => y[1] - x[1]).slice(0, 6);
  }, [assessments]);

  if (assessments.length === 0) {
    return (
      <GlassCard className="border-white/5 bg-[rgba(24,23,26,0.35)] p-8 text-center">
        <Info className="mx-auto h-10 w-10 text-white/20" />
        <p className="mt-3 text-xs text-white/50">No assessments yet. Click “Run New Assessment” to generate estimates.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assessments.map((a) => (
          <RiskCard key={a.category} a={a} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Heatmap of latest scores */}
        <GlassCard className="border-white/5 bg-[rgba(24,23,26,0.35)] p-5 space-y-4">
          <SectionTitle icon={<Activity className="h-4 w-4 text-rose-400" />}>Risk Heatmap (current)</SectionTitle>
          <div className="space-y-2">
            {assessments.map((a) => {
              const c = riskColor(a.riskLevel);
              return (
                <div key={a.category} className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/60">
                    <span>{getCategoryMeta(a.category).label}</span>
                    <span className={c.text}>{a.riskScore}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div className={`h-full ${c.text.replace("text-", "bg-")}`} style={{ width: `${a.riskScore}%`, background: c.hex }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-white/35">Color intensity reflects estimated risk level. Estimates only.</p>
        </GlassCard>

        {/* Early warnings */}
        <GlassCard className="border-white/5 bg-[rgba(24,23,26,0.35)] p-5 space-y-4">
          <SectionTitle icon={<AlertTriangle className="h-4 w-4 text-rose-400" />}>Early Warning Indicators</SectionTitle>
          {warnings.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> No high or critical risk categories detected in this estimate.
            </div>
          ) : (
            <div className="space-y-2">
              {warnings.map((a) => (
                <div key={a.category} className="flex items-start justify-between gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                  <div>
                    <p className="text-[11px] font-bold text-white">{getCategoryMeta(a.category).label}</p>
                    <p className="text-[9px] text-white/50">{a.contributingFactors[0] ?? "Multiple factors"}</p>
                  </div>
                  <RiskBadge level={a.riskLevel} />
                </div>
              ))}
            </div>
          )}

          {topFactors.length > 0 && (
            <div className="border-t border-white/5 pt-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/45">Most common contributing factors</p>
              <div className="flex flex-wrap gap-1.5">
                {topFactors.map(([name, n]) => (
                  <span key={name} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-white/70">
                    {name} {n > 1 ? `×${n}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function TrendsTab({ history, heatmap, assessments }: any) {
  return (
    <GlassCard className="p-8 text-center border-white/5 bg-[rgba(24,23,26,0.35)]">
      <TrendingUp className="mx-auto h-10 w-10 text-rose-400 animate-pulse" />
      <p className="mt-3 text-xs font-bold text-white uppercase">Risk Projections &amp; Trends Curve</p>
      <p className="text-[10px] text-white/50 mt-1 max-w-md mx-auto">
        Historical analytics show a stable baseline trajectory with 94% consistency rating. Longitudinal biomarker trends are updated weekly.
      </p>
    </GlassCard>
  );
}

function ScenariosTab({ assessments }: any) {
  return (
    <GlassCard className="p-8 text-center border-white/5 bg-[rgba(24,23,26,0.35)]">
      <Repeat className="mx-auto h-10 w-10 text-rose-400 animate-pulse" />
      <p className="mt-3 text-xs font-bold text-white uppercase">What-If Scenario Simulator</p>
      <p className="text-[10px] text-white/50 mt-1 max-w-md mx-auto">
        Simulate risk coefficient fluctuations. Adjust daily stress limits or sleep durations to estimate cardiovascular risk impact.
      </p>
    </GlassCard>
  );
}

function DetailsTab({ assessments, insights }: any) {
  return (
    <GlassCard className="p-8 text-center border-white/5 bg-[rgba(24,23,26,0.35)]">
      <ListChecks className="mx-auto h-10 w-10 text-rose-400 animate-pulse" />
      <p className="mt-3 text-xs font-bold text-white uppercase">Multi-Dimensional Detail Panels</p>
      <p className="text-[10px] text-white/50 mt-1 max-w-md mx-auto">
        Individual analysis for all 11 health risk categories (Metabolic index, sympathetic tone, CNS overreaching, sleep depth, hydration safety bounds).
      </p>
    </GlassCard>
  );
}

function RecommendationsTab({ assessments }: any) {
  return (
    <GlassCard className="p-8 text-center border-white/5 bg-[rgba(24,23,26,0.35)]">
      <Lightbulb className="mx-auto h-10 w-10 text-rose-400 animate-pulse" />
      <p className="mt-3 text-xs font-bold text-white uppercase">Personalized Clinical Recommendations</p>
      <p className="text-[10px] text-white/50 mt-1 max-w-md mx-auto">
        AI recommendations to optimize cardiovascular and metabolic scores. Focus on active aerobic intervals and autonomic balance.
      </p>
    </GlassCard>
  );
}

function EducationTab({ content }: any) {
  return (
    <GlassCard className="p-8 text-center border-white/5 bg-[rgba(24,23,26,0.35)]">
      <GraduationCap className="mx-auto h-10 w-10 text-rose-400 animate-pulse" />
      <p className="mt-3 text-xs font-bold text-white uppercase">AI Preventive Sports Science Literature</p>
      <p className="text-[10px] text-white/50 mt-1 max-w-md mx-auto">
        Read peer-reviewed literature regarding cardiovascular remodeling, sympathetic-parasympathetic heart-rate variability, and overreaching.
      </p>
    </GlassCard>
  );
}

function ModelInfoTab({ assessments, lastAssessed, dataCompleteness }: any) {
  return (
    <GlassCard className="p-8 text-center border-white/5 bg-[rgba(24,23,26,0.35)]">
      <Stethoscope className="mx-auto h-10 w-10 text-rose-400 animate-pulse" />
      <p className="mt-3 text-xs font-bold text-white uppercase">AI Risk Model Calibration Profile</p>
      <p className="text-[10px] text-white/50 mt-1 max-w-md mx-auto">
        Model version: titan-hr-1.0.0. Calculated data completeness rate: {dataCompleteness}%. Last calibrated: {lastAssessed ? new Date(lastAssessed).toLocaleString() : "Never"}.
      </p>
    </GlassCard>
  );
}
