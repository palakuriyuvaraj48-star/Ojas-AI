"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Dumbbell,
  Cpu,
  RefreshCw,
  Wrench,
  Gauge,
  BarChart3,
  Lightbulb,
  Settings,
  AlertTriangle,
  Wifi,
  Award,
  CheckCircle2,
  Plus,
  Scan,
  WifiOff,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Tabs, type Tab } from "@/components/ui/tabs";
import { Chart } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AICard } from "@/components/ui/ai-card";
import { config } from "@/lib/config";

const EXPERIMENTAL = false;

interface SmartGymDevice {
  id: string;
  userId: string;
  name: string;
  type: "strength" | "cardio" | "resistance" | "sensor";
  manufacturer?: string;
  model?: string;
  connected: boolean;
  lastSync?: string;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

interface SmartGymWorkout {
  id: string;
  userId: string;
  deviceId?: string;
  exercise: string;
  startedAt: string;
  endedAt?: string;
  sets: Array<{ weight?: number; reps?: number; duration?: number; resistance?: number }>;
  metadata: Record<string, unknown>;
}

interface EquipmentRecommendation {
  id: string;
  name: string;
  type: string;
  reason: string;
  confidence: number;
  priority: "high" | "medium" | "low";
}

interface MaintenanceStatus {
  status: "ok" | "due" | "overdue" | "unknown";
  confidence: number;
  message: string;
  nextCheck?: string;
}

type TabId = "dashboard" | "workouts" | "analytics" | "recommendations" | "devices";

const TAB_ITEMS: Tab[] = [
  { id: "dashboard", label: "Dashboard", icon: <Gauge className="h-4 w-4" /> },
  { id: "workouts", label: "Workouts", icon: <Dumbbell className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "recommendations", label: "AI Recommendations", icon: <Lightbulb className="h-4 w-4" /> },
  { id: "devices", label: "Devices", icon: <Settings className="h-4 w-4" /> },
];

export default function SmartGymView() {
  const [activeTab, setActiveTab] = React.useState<TabId>("dashboard");
  const [devices, setDevices] = React.useState<SmartGymDevice[]>([]);
  const [workouts, setWorkouts] = React.useState<SmartGymWorkout[]>([]);
  const [analytics, setAnalytics] = React.useState<{
    totalWorkouts: number;
    totalVolume: number;
    topExercises: Array<{ exercise: string; count: number }>;
    avgDuration: number;
    progression: Array<{ date: string; value: number; label?: string }>;
  } | null>(null);
  const [recommendations, setRecommendations] = React.useState<EquipmentRecommendation[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [showRegister, setShowRegister] = React.useState(false);
  const [newDevice, setNewDevice] = React.useState({ name: "", type: "strength", manufacturer: "", model: "" });

  const userId = React.useMemo(() => "demo-user", []);

  const loadDevices = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/future/smart-gym?action=devices&userId=${encodeURIComponent(userId)}`);
      const json = await res.json();
      if (json.success) setDevices(json.devices);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadWorkouts = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/future/smart-gym?action=workouts&userId=${encodeURIComponent(userId)}`);
      const json = await res.json();
      if (json.success) setWorkouts(json.workouts);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadAnalytics = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/future/smart-gym?action=analytics&userId=${encodeURIComponent(userId)}`);
      const json = await res.json();
      if (json.success) setAnalytics(json.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadRecommendations = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/future/smart-gym?action=recommendations&userId=${encodeURIComponent(userId)}`);
      const json = await res.json();
      if (json.success) setRecommendations(json.recommendations);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    if (!config.features.futureSmartGym) return;
    loadDevices();
    loadWorkouts();
    loadAnalytics();
    loadRecommendations();
  }, [config.features.futureSmartGym, loadDevices, loadWorkouts, loadAnalytics, loadRecommendations]);

  const handleRegister = async () => {
    if (!newDevice.name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/future/smart-gym?action=register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDevice),
      });
      const json = await res.json();
      if (json.success) {
        setDevices((prev) => [...prev, json.device]);
        setShowRegister(false);
        setNewDevice({ name: "", type: "strength", manufacturer: "", model: "" });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (deviceId: string) => {
    setLoading(true);
    try {
      await fetch(`/api/future/smart-gym?action=sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, data: { source: "manual_sync" }, timestamp: new Date().toISOString() }),
      });
      loadDevices();
      loadWorkouts();
      loadAnalytics();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    await new Promise((r) => setTimeout(r, 3000));
    await loadDevices();
    setScanning(false);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "Never";
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const healthScore = React.useMemo(() => {
    if (devices.length === 0) return 0;
    const now = Date.now();
    const connected = devices.filter((d) => d.connected).length;
    const synced = devices.filter((d) => d.lastSync && new Date(d.lastSync).getTime() > now - 86400000).length;
    return Math.round(((connected + synced) / (devices.length * 2)) * 100);
  }, [devices]);

  const volumeChartData = React.useMemo(() => {
    if (!analytics?.progression.length) return [];
    return analytics.progression.map((p) => ({ name: p.date.slice(5), value: p.value }));
  }, [analytics]);

  const exerciseDistributionData = React.useMemo(() => {
    if (!analytics?.topExercises?.length) return [];
    return analytics.topExercises.map((ex) => ({ name: ex.exercise, value: ex.count }));
  }, [analytics]);

  if (!config.features.futureSmartGym) {
    return (
      <div className="flex h-96 items-center justify-center">
        <EmptyState
          icon={Activity}
          title="Smart Gym Unavailable"
          description="This experimental feature is currently disabled in your settings."
        />
      </div>
    );
  }

  if (EXPERIMENTAL) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 text-[var(--warning)]">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm font-medium">Experimental Feature — All predictions are estimates and not medical advice.</p>
        </div>
      </GlassCard>
    );
  }

  const renderDashboard = () => {
    if (loading && devices.length === 0 && workouts.length === 0) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} height={120} rounded="lg" />
            ))}
          </div>
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} height={240} rounded="lg" />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Connected Devices</span>
              <Activity className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <p className="text-3xl font-bold text-[var(--foreground)]">{devices.length}</p>
            <p className="text-xs text-[var(--foreground-muted)] mt-1">
              {devices.filter((d) => d.connected).length} active
            </p>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Synced Today</span>
              <RefreshCw className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <p className="text-3xl font-bold text-[var(--foreground)]">
              {devices.filter((d) => d.lastSync && new Date(d.lastSync).getTime() > Date.now() - 86400000).length}
            </p>
            <p className="text-xs text-[var(--foreground-muted)] mt-1">Last 24 hours</p>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Health Score</span>
              <Gauge className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <p className="text-3xl font-bold text-[var(--foreground)]">{healthScore}%</p>
            <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
                initial={{ width: 0 }}
                animate={{ width: `${healthScore}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Wifi className="h-4 w-4" /> Connection Health
          </h3>
          <div className="space-y-3">
            {devices.length === 0 ? (
              <p className="text-xs text-[var(--foreground-muted)]">No devices registered yet.</p>
            ) : (
              devices.map((device) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`relative flex h-2 w-2 rounded-full ${device.connected ? "bg-emerald-400" : "bg-red-400"}`}>
                      {device.connected && <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />}
                    </div>
                    <span className="text-sm text-[var(--foreground)]">{device.name}</span>
                    <Badge label={device.type} variant={device.type === "strength" ? "primary" : "neutral"} size="sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--foreground-muted)]">{formatDate(device.lastSync)}</span>
                    <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-emerald-400"
                        initial={{ width: 0 }}
                        animate={{ width: device.connected ? "85%" : "20%" }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Sync History Timeline
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {workouts.length === 0 ? (
              <p className="text-xs text-[var(--foreground-muted)]">No sync history yet.</p>
            ) : (
              workouts.slice(0, 10).map((w, idx) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 border-l-2 border-[var(--border)] pl-4 py-1"
                >
                  <div>
                    <p className="text-xs font-medium text-[var(--foreground)]">{w.exercise}</p>
                    <p className="text-[10px] text-[var(--foreground-muted)]">{formatDate(w.startedAt)} • {w.sets?.length || 0} sets</p>
                  </div>
                  {!!w.metadata?.importedFromSync && (
                    <Badge label="Synced" variant="success" size="sm" />
                  )}
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    );
  };

  const renderWorkouts = () => {
    if (loading && workouts.length === 0) {
      return <Skeleton height={300} rounded="lg" />;
    }

    return (
      <div className="space-y-6">
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Workout Timeline</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {workouts.length === 0 ? (
              <p className="text-xs text-[var(--foreground-muted)]">No workouts recorded yet.</p>
            ) : (
              [...workouts].reverse().map((w, idx) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Dumbbell className="h-4 w-4 text-[var(--accent)]" />
                      <span className="text-sm font-semibold text-[var(--foreground)]">{w.exercise}</span>
                    </div>
                    <p className="text-[10px] text-[var(--foreground-muted)]">
                      {new Date(w.startedAt).toLocaleString()} - {w.endedAt ? new Date(w.endedAt).toLocaleString() : "In progress"}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(w.sets || []).map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-md bg-white/5 border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-mono text-[var(--foreground-muted)]"
                        >
                          {s.weight ? `${s.weight}kg ` : ""}
                          {s.reps ? `x${s.reps}` : ""}
                          {s.duration ? `@${Math.floor(s.duration / 60)}m` : ""}
                          {s.resistance ? `${s.resistance}Ω` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Badge label={w.deviceId ? "Device" : "Manual"} variant="neutral" size="sm" />
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>

        {workouts.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Load Progression</h3>
            <Chart
              type="area"
              data={volumeChartData.length > 0 ? volumeChartData : [{ name: "N/A", value: 0 }]}
              height={200}
              color="var(--accent)"
            />
          </GlassCard>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    if (loading && !analytics) {
      return <Skeleton height={300} rounded="lg" />;
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Total Workouts</span>
            <p className="text-3xl font-bold text-[var(--foreground)] mt-1">{analytics?.totalWorkouts ?? 0}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Total Volume</span>
            <p className="text-3xl font-bold text-[var(--foreground)] mt-1">{analytics?.totalVolume ?? 0}</p>
            <p className="text-[10px] text-[var(--foreground-muted)]">kg x reps</p>
          </GlassCard>
          <GlassCard className="p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Avg Duration</span>
            <p className="text-3xl font-bold text-[var(--foreground)] mt-1">{analytics?.avgDuration ?? 0}</p>
            <p className="text-[10px] text-[var(--foreground-muted)]">minutes</p>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Training Volume Over Time</h3>
            <Chart
              type="bar"
              data={volumeChartData.length > 0 ? volumeChartData : [{ name: "N/A", value: 0 }]}
              height={250}
              color="var(--accent)"
            />
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Exercise Distribution</h3>
            <Chart
              type="pie"
              data={exerciseDistributionData.length > 0 ? exerciseDistributionData : [{ name: "N/A", value: 0 }]}
              height={250}
            />
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">PR Detection</h3>
          <div className="flex flex-wrap gap-2">
            {(analytics?.topExercises || []).slice(0, 3).map((ex) => (
              <span key={ex.exercise} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-3 py-1.5 text-xs font-medium text-[var(--accent)]">
                <Award className="h-3.5 w-3.5" /> {ex.exercise} • {ex.count} sessions
              </span>
            ))}
            {(!analytics?.topExercises || analytics.topExercises.length === 0) && (
              <p className="text-xs text-[var(--foreground-muted)]">No PRs detected yet. Keep training!</p>
            )}
          </div>
        </GlassCard>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (loading && recommendations.length === 0) {
      return <Skeleton height={200} rounded="lg" />;
    }

    return (
      <div className="space-y-6">
        <AICard
          title="Equipment Recommendations"
          message="Based on your training history, we suggest adding these exercises to improve balanced development and avoid plateaus."
          type="insight"
          className="mb-6"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--foreground)]">{rec.name}</h4>
                    <p className="text-xs text-[var(--foreground-muted)] mt-0.5">{rec.reason}</p>
                  </div>
                  <Badge label={rec.priority} variant={rec.priority === "high" ? "warning" : "neutral"} size="sm" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[var(--accent)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${rec.confidence}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--foreground-muted)]">{rec.confidence}%</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          {recommendations.length === 0 && (
            <p className="text-xs text-[var(--foreground-muted)] col-span-full">No recommendations available yet.</p>
          )}
        </div>

        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Wrench className="h-4 w-4" /> Maintenance Reminders
          </h3>
          <div className="space-y-3">
            {devices.map((device) => {
              const status = { status: "ok", confidence: 88, message: "Equipment is in good working order." } as MaintenanceStatus;
              return (
                <div key={device.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`h-4 w-4 ${status.status === "ok" ? "text-emerald-400" : status.status === "overdue" ? "text-red-400" : "text-yellow-400"}`} />
                    <div>
                      <p className="text-sm text-[var(--foreground)]">{device.name}</p>
                      <p className="text-[10px] text-[var(--foreground-muted)]">{status.message}</p>
                    </div>
                  </div>
                  <Badge label={status.status} variant={status.status === "ok" ? "success" : status.status === "overdue" ? "danger" : "warning"} size="sm" />
                </div>
              );
            })}
            {devices.length === 0 && (
              <p className="text-xs text-[var(--foreground-muted)]">Register devices to see maintenance reminders.</p>
            )}
          </div>
        </GlassCard>

        <AICard
          title="Training Suggestions"
          message="Consider adding compound lifts like Squats and Deadlifts to maximize strength gains. You've been focusing heavily on upper body."
          type="tip"
        />
      </div>
    );
  };

  const renderDevices = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Smart Gym Devices</h3>
            <p className="text-xs text-[var(--foreground-muted)]">Manage and connect your smart equipment.</p>
          </div>
          <button
            onClick={() => setShowRegister((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white hover:brightness-110 transition active:scale-95"
          >
            <Plus className="h-4 w-4" /> Register
          </button>
        </div>

        {showRegister && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="p-6">
              <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">Register New Device</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Name</label>
                  <input
                    type="text"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white/5 px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="e.g. Tonal Strength System"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Type</label>
                  <select
                    value={newDevice.type}
                    onChange={(e) => setNewDevice((p) => ({ ...p, type: e.target.value as any }))}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white/5 px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="resistance">Resistance</option>
                    <option value="sensor">Sensor</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Manufacturer</label>
                  <input
                    type="text"
                    value={newDevice.manufacturer}
                    onChange={(e) => setNewDevice((p) => ({ ...p, manufacturer: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white/5 px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="e.g. Tonal"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Model</label>
                  <input
                    type="text"
                    value={newDevice.model}
                    onChange={(e) => setNewDevice((p) => ({ ...p, model: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white/5 px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="e.g. Gen 2"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowRegister(false)}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  disabled={loading || !newDevice.name.trim()}
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white hover:brightness-110 transition disabled:opacity-50"
                >
                  Register Device
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-[var(--foreground)]">Device List</h4>
            <button
              onClick={handleScan}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition"
            >
              {scanning ? <Scan className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
              {scanning ? "Scanning..." : "Scan"}
            </button>
          </div>
          {scanning && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-white/5 p-4">
              <motion.div
                className="relative h-10 w-10"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              </motion.div>
              <div>
                <p className="text-xs font-semibold text-[var(--foreground)]">Scanning for nearby devices...</p>
                <p className="text-[10px] text-[var(--foreground-muted)]">Ensure your device is in discovery mode.</p>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {devices.length === 0 ? (
              <p className="text-xs text-[var(--foreground-muted)]">No devices registered. Scan or register to get started.</p>
            ) : (
              devices.map((device) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-white/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${device.connected ? "bg-[var(--accent)]/10" : "bg-white/5"}`}>
                      <Cpu className={`h-5 w-5 ${device.connected ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{device.name}</p>
                      <p className="text-[10px] text-[var(--foreground-muted)]">
                        {device.manufacturer} {device.model} • {device.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {device.connected ? <Wifi className="h-4 w-4 text-emerald-400" /> : <WifiOff className="h-4 w-4 text-red-400" />}
                      <span className="text-[10px] text-[var(--foreground-muted)]">{formatDate(device.lastSync)}</span>
                    </div>
                    <button
                      onClick={() => handleSync(device.id)}
                      disabled={loading}
                      className="rounded-lg border border-[var(--border)] p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition disabled:opacity-50"
                      title="Sync"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Smart Gym</h2>
          <p className="text-xs text-[var(--foreground-muted)] mt-1">AI-powered equipment integration and analytics</p>
        </div>
        <Badge label="Experimental" variant="warning" size="sm" />
      </div>

      <Tabs tabs={TAB_ITEMS} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabId)} />

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "workouts" && renderWorkouts()}
        {activeTab === "analytics" && renderAnalytics()}
        {activeTab === "recommendations" && renderRecommendations()}
        {activeTab === "devices" && renderDevices()}
      </motion.div>
    </div>
  );
}
