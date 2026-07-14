"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartCard } from "@/components/ui/chart-card";
import { AICard } from "@/components/ui/ai-card";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Brain,
  Cpu,
  FlaskConical,
  TrendingUp,
  BarChart3,
  Lightbulb,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Zap,
  Target,
  HeartPulse,
  Dumbbell,
  Scale,
  BrainCircuit,
  Info,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";

import { config } from "@/lib/config";
import {
  type DigitalTwinProfile,
  type DigitalTwinPrediction,
  type DigitalTwinSimulation,
  type DigitalTwinDashboardResponse,
  type DigitalTwinSimulationRequest,
  type PredictionHorizon,
  type PredictionType,
  PredictionDrift,
  ConfidenceLevel,
} from "@/lib/future-ai/types";

const HORIZONS: PredictionHorizon[] = ["daily", "weekly", "monthly", "yearly", "longterm"];

const PREDICTION_META: Record<PredictionType, { label: string; icon: React.ElementType; color: string }> = {
  recovery: { label: "Recovery Forecast", icon: HeartPulse, color: "#34d399" },
  performance: { label: "Performance Forecast", icon: TrendingUp, color: "#38bdf8" },
  plateau: { label: "Plateau Prediction", icon: ShieldAlert, color: "#fbbf24" },
  motivation: { label: "Motivation Prediction", icon: BrainCircuit, color: "#a78bfa" },
  habit: { label: "Habit Prediction", icon: Activity, color: "#22d3ee" },
  goal_completion: { label: "Goal Completion", icon: Target, color: "#f472b6" },
  training_readiness: { label: "Training Readiness", icon: Dumbbell, color: "#f87171" },
  body_transformation: { label: "Body Transformation", icon: Scale, color: "#34d399" },
  adaptation_speed: { label: "Adaptation Speed", icon: Zap, color: "#fbbf24" },
  training_response: { label: "Training Response", icon: Cpu, color: "#38bdf8" },
};

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function ScoreCard({
  title,
  value,
  color,
  icon: Icon,
  children,
}: {
  title: string;
  value: number;
  color: string;
  icon: React.ElementType;
  children?: React.ReactNode;
}) {
  return (
    <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{title}</p>
          <p className="text-2xl font-black text-white">{value}<span className="text-xs font-medium text-white/40 ml-1">/100</span></p>
        </div>
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {children}
    </GlassCard>
  );
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.min(100, Math.max(0, confidence));
  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "#fbbf24" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-bold text-white/60 tabular-nums">{pct}%</span>
    </div>
  );
}

function FactorRow({ factor }: { factor: { name: string; impact: string; weight: number } }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor:
              factor.impact === "positive" ? "#34d399" : factor.impact === "negative" ? "#f87171" : "#fbbf24",
          }}
        />
        <span className="text-xs text-white/80">{factor.name}</span>
      </div>
      <span className="text-[10px] font-bold text-white/40 tabular-nums">
        {(factor.weight * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function PredictionCard({ prediction, horizon, onHorizonChange }: {
  prediction: DigitalTwinPrediction;
  horizon: PredictionHorizon;
  onHorizonChange: (h: PredictionHorizon) => void;
}) {
  const meta = PREDICTION_META[prediction.type];
  const driftColor = prediction.predictionDrift === "improving" ? "#34d399"
    : prediction.predictionDrift === "degrading" ? "#f87171"
    : prediction.predictionDrift === "volatile" ? "#fbbf24"
    : "#38bdf8";

  return (
    <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
            <meta.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{meta.label}</p>
            <p className="text-[10px] text-white/40 capitalize">{prediction.predictionDrift.replace("_", " ")}</p>
          </div>
        </div>
        <Badge
          label={`${prediction.confidenceLevel.toUpperCase()}`}
          variant={prediction.confidence >= 80 ? "success" : prediction.confidence >= 60 ? "warning" : "danger"}
          size="sm"
        />
      </div>

      <div className="flex items-end gap-3">
        <div className="text-3xl font-black text-white">{prediction.value}<span className="text-sm font-medium text-white/40">%</span></div>
        <div className="flex-1 pb-1">
          <ConfidenceBar confidence={prediction.confidence} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {HORIZONS.map((h) => (
            <button
              key={h}
              onClick={() => onHorizonChange(h)}
              className={`px-2 py-1 text-[9px] font-bold rounded-md transition ${
                horizon === h ? "bg-[#adc6ff] text-[#131315]" : "bg-white/5 text-white/50 hover:text-white"
              }`}
            >
              {h[0].toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-medium" style={{ color: driftColor }}>
          {prediction.predictionDrift === "improving" ? "↑ Improving" : prediction.predictionDrift === "degrading" ? "↓ Degrading" : prediction.predictionDrift === "volatile" ? "~ Volatile" : "→ Stable"}
        </div>
      </div>

      <p className="text-[10px] text-white/40 leading-relaxed border-t border-white/5 pt-2">{prediction.explanation}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/20 rounded-xl p-3">
          <p className="text-[9px] text-white/40 uppercase font-bold mb-1.5">Primary factors</p>
          <div className="space-y-1">
            {prediction.primaryFactors.slice(0, 2).map((f) => (
              <FactorRow key={f.id} factor={f} />
            ))}
          </div>
        </div>
        <div className="bg-black/20 rounded-xl p-3">
          <p className="text-[9px] text-white/40 uppercase font-bold mb-1.5">Secondary factors</p>
          <div className="space-y-1">
            {prediction.secondaryFactors.slice(0, 2).map((f) => (
              <FactorRow key={f.id} factor={f} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-2 flex items-start gap-1.5">
        <Info className="h-3 w-3 text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-[9px] text-yellow-300/80 leading-relaxed">Experimental estimate — not medical advice.</p>
      </div>
    </GlassCard>
  );
}

function SimulationForm({ onSimulate, loading }: {
  onSimulate: (inputs: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [sleepDelta, setSleepDelta] = useState(0);
  const [calorieDelta, setCalorieDelta] = useState(0);
  const [trainingFreqDelta, setTrainingFreqDelta] = useState(0);
  const [stressDelta, setStressDelta] = useState(0);
  const [simName, setSimName] = useState("");

  const handleSubmit = () => {
    onSimulate({
      simulationName: simName || "What-if",
      sleepDelta,
      calorieDelta,
      trainingFrequencyDelta: trainingFreqDelta,
      stressDelta,
    });
  };

  return (
    <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4">
      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-[#adc6ff]" /> Simulation Inputs
      </h4>

      <Input
        label="Simulation name"
        placeholder="e.g., more sleep week"
        value={simName}
        onChange={(e) => setSimName(e.target.value)}
      />

      <RangeSlider label="Sleep change (hrs)" value={sleepDelta} min={-3} max={+3} step={0.5} onChange={setSleepDelta} />
      <RangeSlider label="Calorie change (kcal)" value={calorieDelta} min={-1000} max={+1000} step={50} onChange={setCalorieDelta} />
      <RangeSlider label="Training frequency/sessions" value={trainingFreqDelta} min={-3} max={+3} step={1} onChange={setTrainingFreqDelta} />
      <RangeSlider label="Stress change" value={stressDelta} min={-5} max={+5} step={0.5} onChange={setStressDelta} />

      <Button
        onClick={handleSubmit}
        loading={loading}
        icon={<FlaskConical className="h-3.5 w-3.5" />}
        className="w-full"
      >
        Run Simulation
      </Button>
    </GlassCard>
  );
}

function RangeSlider({
  label, value, min, max, step, onChange,
}: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{label}</label>
        <span className="text-[10px] font-bold text-white/60 tabular-nums">{value > 0 ? "+" : ""}{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-[#adc6ff]"
      />
      <div className="flex justify-between text-[9px] text-white/30">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "predictions", label: "Predictions", icon: Brain },
  { id: "simulations", label: "Simulations", icon: FlaskConical },
  { id: "history", label: "History", icon: TrendingUp },
  { id: "explain", label: "Explainable AI", icon: Lightbulb },
];

export function DigitalTwinView() {
  const [tab, setTab] = useState<string>("dashboard");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DigitalTwinDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState<PredictionHorizon>("weekly");
  const [simLoading, setSimLoading] = useState(false);
  const [simHistory, setSimHistory] = useState<DigitalTwinSimulation[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/future/digital-twin?userId=demo-user&action=dashboard&horizon=${horizon}`);
      if (!res.ok) throw new Error("Failed to load digital twin data");
      const d = (await res.json()) as DigitalTwinDashboardResponse;
      setData(d);
      setSimHistory(d.simulations ?? []);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horizon]);

  const runSimulation = async (inputs: Record<string, unknown>) => {
    setSimLoading(true);
    try {
      const res = await fetch("/api/future/digital-twin?action=simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user", ...inputs }),
      });
      if (!res.ok) throw new Error("Simulation failed");
      const { simulation } = (await res.json()) as { simulation: DigitalTwinSimulation };
      setSimHistory((prev) => [simulation, ...prev]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  const predictions = useMemo(() => data?.predictions ?? [], [data]);
  const profile = data?.profile;

  if (!config.features.futureDigitalTwin20) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-sm text-white/50">Future Digital Twin 2.0 is not enabled.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs tabs={TABS as any} activeTab={tab} onChange={setTab} />
        <Button
          variant="glass"
          size="sm"
          onClick={fetchData}
          icon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}
        >
          Refresh
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {loading || !profile ? (
              <DashboardSkeleton />
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <ScoreCard title="Physiology" value={profile.physiology.score ?? profile.overallScore} color="#38bdf8" icon={HeartPulse} />
                  <ScoreCard title="Recovery" value={profile.physiology.recovery} color="#34d399" icon={Activity} />
                  <ScoreCard title="Performance" value={profile.adaptation.progression} color="#a78bfa" icon={TrendingUp} />
                  <ScoreCard title="Adaptation" value={profile.adaptation.progression} color="#fbbf24" icon={Zap} />
                  <ScoreCard title="Habit Formation" value={profile.habitFormation.adherence} color="#22d3ee" icon={Target} />
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                  <GlassCard className="lg:col-span-2 p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Overall Trajectory</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.trendData ?? []}>
                          <defs>
                            <linearGradient id="dt-warm" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                          <XAxis dataKey="date" stroke="rgba(255,255,255,0.25)" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.25)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }}
                            labelStyle={{ color: "var(--foreground-muted)" }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} fill="url(#dt-warm)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>

                  <div className="space-y-4">
                    <ProgressRing progress={profile.confidence} size={140} color="#38bdf8" strokeWidth={8} showLabel />
                    <div className="text-center space-y-1">
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Model Confidence</p>
                      <p className="text-xs text-white/60">{profile.confidence}% based on data completeness and quality.</p>
                    </div>
                    <AICard
                      title="AI Diagnostics"
                      message={`Your digital twin shows a ${profile.overallScore >= 75 ? "strong" : profile.overallScore >= 55 ? "moderate" : "emerging"} trajectory. The primary drivers are recovery quality, training adherence, and habit consistency.`}
                      type="insight"
                      className="border-white/5"
                    />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {tab === "predictions" && (
          <motion.div
            key="predictions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {horizon[0].toUpperCase() + horizon.slice(1)} predictions
              </h3>
              <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
                {HORIZONS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition ${
                      horizon === h ? "bg-[#adc6ff] text-[#131315]" : "text-white/50 hover:text-white"
                    }`}
                  >
                    {h[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <PredictionsSkeleton />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {predictions.map((p) => (
                  <PredictionCard key={p.id} prediction={p} horizon={horizon} onHorizonChange={setHorizon} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "simulations" && (
          <motion.div
            key="simulations"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid gap-6 lg:grid-cols-[1fr_1.2fr]"
          >
            <SimulationForm onSimulate={runSimulation} loading={simLoading} />

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Recent Simulations</h3>
              {simHistory.length === 0 ? (
                <GlassCard className="p-6 border-white/5 bg-[rgba(24,23,26,0.35)] text-center">
                  <p className="text-xs text-white/40">No simulations yet. Run your first scenario.</p>
                </GlassCard>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {simHistory.map((s) => (
                    <GlassCard key={s.id} className="p-4 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white">{s.name}</p>
                        <span className="text-[9px] text-white/30">{new Date(s.createdAt).toLocaleString()}</span>
                      </div>
                      <ConfidenceBar confidence={s.confidence} />
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(s.outputs).slice(0, 4).map(([k, v]) => (
                          <div key={k} className="bg-black/20 rounded-lg p-2.5">
                            <p className="text-[9px] text-white/40 uppercase font-bold">{k}</p>
                            <p className="text-xs font-bold text-white mt-0.5">{typeof v === "number" ? Math.round(v) : String(v)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-2 flex items-start gap-1.5">
                        <Info className="h-3 w-3 text-yellow-400 mt-0.5 shrink-0" />
                        <p className="text-[9px] text-yellow-300/80 leading-relaxed">Experimental estimate — not medical advice.</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {loading ? (
              <HistorySkeleton />
            ) : (
              <>
                <div className="grid gap-5 lg:grid-cols-2">
                  <ChartCard title="Prediction History" data={data?.trendData ?? []} type="area" color="#a78bfa" height={260} className="border-white/5" />
                  <ChartCard title="Drift Analysis" data={data?.trendData ?? []} type="bar" color="#38bdf8" height={260} className="border-white/5" />
                </div>

                <GlassCard className="space-y-4 p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Model Evolution Tracking</h4>
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      { label: "Model Version", value: "dtwin-2.0.1", status: "current" },
                      { label: "Last Calibration", value: new Date().toLocaleDateString(), status: "fresh" },
                      { label: "Data Points", value: "1,247", status: "healthy" },
                    ].map((m) => (
                      <div key={m.label} className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <p className="text-[9px] text-white/40 uppercase font-bold">{m.label}</p>
                        <p className="text-sm font-bold text-white mt-1">{m.value}</p>
                        <Badge label={m.status} variant={m.status === "current" || m.status === "fresh" ? "success" : "neutral"} size="sm" />
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {data?.history && data.history.length > 0 && (
                  <GlassCard className="space-y-4 p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Prediction Log Summary</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      {data.history.slice(0, 6).map((h) => (
                        <div key={h.predictionType} className="bg-black/20 rounded-xl p-3 border border-white/5">
                          <p className="text-[10px] font-bold text-white capitalize">{h.predictionType.replace("_", " ")}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">Trend: <span className="capitalize text-white/70">{h.drift}</span></p>
                          <div className="flex gap-0.5 mt-2">
                            {h.values.map((v, i) => (
                              <div
                                key={i}
                                className="flex-1 h-6 rounded bg-[#adc6ff]"
                                style={{ opacity: 0.3 + (v.value / 100) * 0.7 }}
                                title={`${v.label}: ${v.value}`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </>
            )}
          </motion.div>
        )}

        {tab === "explain" && (
          <motion.div
            key="explain"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <GlassCard className="space-y-4 p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-[#adc6ff]" /> Primary Factors
              </h4>
              {loading || !profile ? (
                <p className="text-xs text-white/40">Loading factors...</p>
              ) : (
                <div className="space-y-3">
                  {predictions.flatMap((p) => p.primaryFactors).slice(0, 6).map((f) => (
                    <div key={f.id} className="p-3 bg-black/20 rounded-xl border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{f.name}</span>
                        <span className="text-[10px] font-bold" style={{ color: f.impact === "positive" ? "#34d399" : f.impact === "negative" ? "#f87171" : "#fbbf24" }}>
                          {f.impact}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${f.weight * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: f.impact === "positive" ? "#34d399" : f.impact === "negative" ? "#f87171" : "#fbbf24" }}
                        />
                      </div>
                      <p className="text-[10px] text-white/50 leading-relaxed">{f.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            <div className="space-y-5">
              <GlassCard className="space-y-4 p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Brain className="h-4 w-4 text-[#adc6ff]" /> AI Reasoning
                </h4>
                <div className="space-y-3">
                  {predictions.map((p) => (
                    <div key={p.id} className="p-3 bg-black/20 rounded-xl border border-white/5 text-left">
                      <p className="text-[10px] font-bold text-white capitalize mb-1">{p.type.replace("_", " ")}</p>
                      <p className="text-[10px] text-white/60 leading-relaxed">{p.explanation}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="space-y-4 p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Model Weights</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="10%"
                      outerRadius="90%"
                      data={[
                        { name: "Physiology", value: profile?.physiology.score ?? 70, fill: "#38bdf8" },
                        { name: "Behavior", value: profile?.behavior.adherence ?? 70, fill: "#a78bfa" },
                        { name: "Adaptation", value: profile?.adaptation.progression ?? 70, fill: "#fbbf24" },
                        { name: "Habit", value: profile?.habitFormation.adherence ?? 70, fill: "#22d3ee" },
                      ]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar dataKey="value" cornerRadius={4} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Skeleton loaders                                                         */
/* -------------------------------------------------------------------------- */

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-5 space-y-3">
            <Skeleton width="40%" height={10} />
            <Skeleton width="60%" height={24} />
            <Skeleton width="100%" height={6} rounded="sm" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/5 p-5">
          <Skeleton width="30%" height={14} className="mb-4" />
          <Skeleton width="100%" height={240} />
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-5 space-y-3">
          <Skeleton width="40%" height={14} />
          <Skeleton width="80" height={80} rounded="full" className="mx-auto" />
          <Skeleton width="80%" height={12} className="mx-auto" />
          <Skeleton width="100%" height={80} />
        </div>
      </div>
    </div>
  );
}

function PredictionsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton width="50%" height={12} />
            <Skeleton width={60} height={20} rounded="sm" />
          </div>
          <Skeleton width="30%" height={28} />
          <Skeleton width="100%" height={6} />
          <Skeleton width="100%" height={60} />
          <Skeleton width="100%" height={40} />
        </div>
      ))}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
        <Skeleton width="30%" height={14} className="mb-4" />
        <Skeleton width="100%" height={240} />
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
        <Skeleton width="30%" height={14} className="mb-4" />
        <Skeleton width="100%" height={240} />
      </div>
    </div>
  );
}
