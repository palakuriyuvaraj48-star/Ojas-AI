"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  BellRing,
  Camera,
  ChevronRight,
  Crown,
  Dumbbell,
  Menu,
  MoonStar,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCircle2,
  UtensilsCrossed,
  UserCheck,
  Users,
  LogOut,
  ClockIcon,
  AlertTriangle,
  Crosshair,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useFitness } from "@/components/providers/fitness-provider";
import { DashboardView } from "@/components/fitness/dashboard-view";
import { WorkoutView } from "@/components/fitness/workout-view";
import { FoodView } from "@/components/fitness/food-view";
import { ProgressView } from "@/components/fitness/progress-view";
import { CoachChat } from "@/components/fitness/coach-chat";
import { ProfileView } from "@/components/fitness/profile-view";
import { TwinView } from "@/components/fitness/twin-view";
import { RecoveryView } from "@/components/fitness/recovery-view";
import { CommunityView } from "@/components/fitness/community-view";
import { HistoryView } from "@/components/fitness/history-view";
import { MusicView } from "@/components/fitness/music-view";
import { SettingsView } from "@/components/fitness/settings-view";
import { PremiumView } from "@/components/fitness/premium-view";
import { AdminView } from "@/components/fitness/admin-view";
import { AchievementsView } from "@/components/fitness/achievements-view";
import { AuthModal } from "@/components/fitness/auth-modal";
import { VisionView } from "@/components/fitness/vision-view";
import { FormCoachView } from "@/components/fitness/form-coach-view";
import { BiomechanicsView } from "@/components/fitness/biomechanics-view";
import { MotionLabView } from "@/components/fitness/motion-lab-view";
import { FutureSimulator } from "@/components/fitness/premium/future-simulator";
import { DigitalTwin } from "@/components/fitness/premium/digital-twin";
import { DigitalTwinView } from "@/components/fitness/future-ai/digital-twin-view";
import { InjuryRisk } from "@/components/fitness/premium/injury-risk";
import { AnalyticsDashboard } from "@/components/fitness/premium/analytics-dashboard";
import { WearablesView } from "@/components/fitness/premium/wearables-view";
import { MealAiView } from "@/components/fitness/premium/meal-ai-view";
import { WeeklyPlannerView } from "@/components/fitness/premium/weekly-planner-view";
import { NotificationsView } from "@/components/fitness/premium/notifications-view";
import { AutomationView } from "@/components/fitness/premium/automation-view";
import { Onboarding } from "@/components/fitness/onboarding";
import { AdaptivePlanningDemo } from "@/components/fitness/adaptive-planning-demo";
import { Sidebar, TopNav, BottomNav, GlobalAIButton } from "@/components/navigation";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/adaptive-demo", label: "SIH Demo", icon: Sparkles },
  { href: "/twin", label: "AI Digital Twin", icon: Sparkles },
  { href: "/workout", label: "Workout Plan", icon: Dumbbell },
  { href: "/form-coach", label: "Smart Form Coach", icon: Crosshair },
  { href: "/camera", label: "AI Vision Lens", icon: Camera },
  { href: "/food", label: "Food Scanner", icon: UtensilsCrossed },
  { href: "/progress", label: "Progress Logs", icon: BarChart3 },
  { href: "/recovery", label: "Recovery Coach", icon: MoonStar },
  { href: "/history", label: "History Logs", icon: ClockIcon },
  { href: "/music", label: "Music Mode", icon: Music2 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/community", label: "Community Hub", icon: Users },
  { href: "/coach", label: "AI Chat Coach", icon: UserCheck },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/premium", label: "Premium Features", icon: Crown },
  { href: "/admin", label: "Admin diagnostics", icon: ShieldCheck },
];

function Music2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function ExperienceShell({ slug }: { slug: string }) {
  const pathname = usePathname();
  const { profile, resetData } = useFitness();
  const current = slug || "dashboard";

  // Authentication State Simulator
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // AI Exercise Coach Simulator States
  const [repCount, setRepCount] = useState(10);
  const [formScore, setFormScore] = useState(93);
  const [repActive, setRepActive] = useState(false);
  const [kneeAngle, setKneeAngle] = useState(170);
  const [hipAngle, setHipAngle] = useState(165);
  const [feedLogs, setFeedLogs] = useState<string[]>([
    "Ready for exercise audit. Stand in frame.",
    "Target exercise detected: Bodyweight Squat."
  ]);

  // AI Camera mode: 'coach' | 'scan'
  const [cameraMode, setCameraMode] = useState<string>("coach");

  // Body Scanner Simulator States
  const [scanningBody, setScanningBody] = useState(false);
  const [scannedBodyResult, setScannedBodyResult] = useState<any | null>(null);

  // Animate a rep in the AI Exercise Coach simulator
  const simulateRep = () => {
    if (repActive) return;
    setRepActive(true);
    setFeedLogs(prev => [...prev, "Squat initiated. Keeping spine stable..."]);
    
    let stepCount = 0;
    const interval = setInterval(() => {
      stepCount++;
      
      // Descending phase
      if (stepCount <= 10) {
        setKneeAngle(prev => Math.max(78, prev - 9));
        setHipAngle(prev => Math.max(72, prev - 9.3));
      }
      // Ascending phase
      else if (stepCount <= 20) {
        setKneeAngle(prev => Math.min(170, prev + 9));
        setHipAngle(prev => Math.min(165, prev + 9.3));
      }

      // Biomechanical posture warnings matching Project Titan specs
      if (stepCount === 3) {
        setFeedLogs(prev => [...prev, "❌ Raise your elbows slightly."]);
      }
      if (stepCount === 8) {
        setFeedLogs(prev => [...prev, "⚠ Keep your back neutral."]);
      }
      if (stepCount === 12) {
        setFeedLogs(prev => [...prev, "✅ Perfect squat depth."]);
      }
      if (stepCount === 18) {
        setFeedLogs(prev => [...prev, "✅ Great control."]);
      }

      if (stepCount >= 20) {
        clearInterval(interval);
        setRepActive(false);
        setRepCount(prev => prev + 1);
        setFormScore(91);
        setFeedLogs(prev => [...prev, "✅ Rep completed. Form Score: 91%. Confidence: 98%."]);
      }
    }, 100);
  };

  // Run the body fat and posture scanner
  const runBodyScan = () => {
    setScanningBody(true);
    setScannedBodyResult(null);
    setTimeout(() => {
      setScanningBody(false);
      setScannedBodyResult({
        bodyFat: 18.2,
        muscleMass: "58.4 kg",
        whr: 0.84,
        shoulderWidth: "46.5 cm",
        symmetry: 94,
        posture: "Slight Anterior Pelvic Tilt",
        weakMuscle: "Posterior Chain (Glutes/Hamstrings) under-activated. Recommend Romanian Deadlifts."
      });
    }, 2500);
  };

  const handleSignOut = () => {
    resetData();
    setAuthModalOpen(true);
  };

  if (!profile) {
    return <Onboarding />;
  }

  const renderActiveRoute = () => {
    switch (current) {
      case "dashboard":
        return <DashboardView />;
      case "adaptive-demo":
      case "sih-demo":
      case "adaptive-planning":
        return <AdaptivePlanningDemo />;
      case "twin":
      case "digital-twin":
      case "ai-digital-twin":
        return <TwinView />;
      case "future-digital-twin":
      case "digital-twin-2":
        return <DigitalTwinView />;
      case "workout":
      case "workouts":
      case "workout-plan":
        return <WorkoutView />;
      case "food":
      case "food-scanner":
      case "nutrition":
        return <FoodView />;
      case "progress":
      case "progress-logs":
      case "analytics":
      case "insights":
      case "predictions":
      case "goals":
        return <ProgressView />;
      case "recovery":
      case "recovery-coach":
        return <RecoveryView />;
      case "coach":
      case "ai-coach":
        return <CoachChat initialTab="home" />;
      case "coach-chat":
      case "ai-chat-coach":
        return <CoachChat initialTab="chat" />;
      case "voice":
      case "voice-assistant":
        return <CoachChat initialTab="voice" />;
      case "plans":
      case "ai-plans":
        return <CoachChat initialTab="plans" />;
      case "insights":
      case "ai-insights":
        return <CoachChat initialTab="insights" />;
      case "memory":
      case "memory-vault":
        return <CoachChat initialTab="memory" />;
      case "community":
      case "feed":
      case "community-feed":
      case "groups":
      case "partner-workouts":
      case "events":
        return <CommunityView />;

      case "form-coach":
      case "formcoach":
      case "smart-form-coach":
        return <FormCoachView />;
      case "history":
      case "history-logs":
        return <HistoryView />;
      case "music":
      case "music-mode":
        return <MusicView />;
      case "settings":
        return <SettingsView />;
      case "premium":
        return <PremiumView />;
      case "premium/future-simulator":
        return <FutureSimulator />;
      case "premium/digital-twin":
        return <DigitalTwin />;
      case "premium/injury-risk":
        return <InjuryRisk />;
      case "premium/analytics":
        return <AnalyticsDashboard />;
      case "premium/wearables":
        return <WearablesView />;
      case "premium/meal-ai":
        return <MealAiView />;
      case "premium/weekly-planner":
        return <WeeklyPlannerView />;
      case "premium/notifications":
        return <NotificationsView />;
      case "premium/automation":
        return <AutomationView />;
      case "admin":
        return <AdminView />;
      case "achievements":
      case "motivation":
      case "challenges":
      case "vision-board":
      case "rewards":
      case "progress-journey":
        return <AchievementsView />;
      case "profile":
        return <ProfileView />;

      case "biomechanics":
      case "movement-lab":
      case "mobility":
        return <BiomechanicsView />;

      case "motion-lab":
      case "replay-studio":
      case "movement-reports":
      case "technique-timeline":
        return <MotionLabView />;

      case "camera":
      case "vision":
      case "ai-vision-lens":
      case "workout-camera":
      case "camera-workout":
        // Retain the previous simulated diagnostic surface for future A/B work,
        // while the production route uses the permissioned camera experience.
        if (!["legacy"].includes(cameraMode)) return <VisionView />;
        return (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            {/* Live Camera Feed Simulator */}
            <GlassCard className="space-y-4" glow>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5 text-[#adc6ff]" /> AI Vision Coach & Scanner
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">Toggle modes to audit lifting pose or run body fat scans.</p>
                </div>
                
                {/* Mode Selectors */}
                <div className="flex bg-black/30 rounded-xl p-1 border border-white/5 self-start shrink-0">
                  <button
                    onClick={() => setCameraMode("coach")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      cameraMode === "coach" ? "bg-[#adc6ff]/15 text-[#adc6ff]" : "text-white/50 hover:text-white"
                    }`}
                  >
                    Lifting Coach
                  </button>
                  <button
                    onClick={() => setCameraMode("scan")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      cameraMode === "scan" ? "bg-[#adc6ff]/15 text-[#adc6ff]" : "text-white/50 hover:text-white"
                    }`}
                  >
                    Body Scanner
                  </button>
                </div>
              </div>

              {cameraMode === "coach" ? (
                /* Lifting Mode Graphic */
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-[24px] border border-white/10 bg-[url('https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" />

                    <svg className="absolute inset-0 w-full h-full text-cyan-400 stroke-[3] drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                      <line x1="50%" y1="20%" x2="50%" y2="55%" />
                      <line x1="38%" y1="28%" x2="62%" y2="28%" />
                      <line x1="38%" y1="28%" x2="28%" y2="40%" />
                      <line x1="28%" y1="40%" x2="30%" y2="52%" />
                      <line x1="62%" y1="28%" x2="72%" y2="40%" />
                      <line x1="72%" y1="40%" x2="70%" y2="52%" />
                      <line x1="42%" y1="55%" x2="58%" y2="55%" />
                      
                      {(() => {
                        const squattedRatio = (170 - kneeAngle) / (170 - 78);
                        const hipY = 55;
                        const kneeXLeft = 42 - (6 * squattedRatio);
                        const kneeYLeft = 70 + (4 * squattedRatio);
                        const footXLeft = 42 + (0 * squattedRatio);
                        const footYLeft = 90;

                        const kneeXRight = 58 + (6 * squattedRatio);
                        const kneeYRight = 70 + (4 * squattedRatio);
                        const footXRight = 58 - (0 * squattedRatio);
                        const footYRight = 90;

                        return (
                          <>
                            <line x1="42%" y1={`${hipY}%`} x2={`${kneeXLeft}%`} y2={`${kneeYLeft}%`} />
                            <line x1={`${kneeXLeft}%`} y1={`${kneeYLeft}%`} x2={`${footXLeft}%`} y2={`${footYLeft}%`} />
                            <line x1="58%" y1={`${hipY}%`} x2={`${kneeXRight}%`} y2={`${kneeYRight}%`} />
                            <line x1={`${kneeXRight}%`} y1={`${kneeYRight}%`} x2={`${footXRight}%`} y2={`${footYRight}%`} />

                            <circle cx={`${kneeXLeft}%`} cy={`${kneeYLeft}%`} r="5" fill="#22d3ee" />
                            <circle cx={`${kneeXRight}%`} cy={`${kneeYRight}%`} r="5" fill="#22d3ee" />
                            <circle cx={`${footXLeft}%`} cy={`${footYLeft}%`} r="5" fill="#22d3ee" />
                            <circle cx={`${footXRight}%`} cy={`${footYRight}%`} r="5" fill="#22d3ee" />
                          </>
                        );
                      })()}

                      <circle cx="50%" cy="20%" r="6" fill="#38bdf8" />
                      <circle cx="38%" cy="28%" r="5" fill="#22d3ee" />
                      <circle cx="62%" cy="28%" r="5" fill="#22d3ee" />
                      <circle cx="28%" cy="40%" r="5" fill="#22d3ee" />
                      <circle cx="72%" cy="40%" r="5" fill="#22d3ee" />
                      <circle cx="42%" cy="55%" r="5" fill="#22d3ee" />
                      <circle cx="58%" cy="55%" r="5" fill="#22d3ee" />
                    </svg>

                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-mono text-cyan-300">
                        Hip Flexion: {Math.round(hipAngle)}°
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-mono text-cyan-300">
                        Knee Angle: {Math.round(kneeAngle)}°
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-emerald-500/90 rounded-full px-3.5 py-1 text-[10px] font-bold text-[#131315]">
                      ✅ HEELS FLAT
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={simulateRep}
                      disabled={repActive}
                      className="rounded-full bg-[#adc6ff] px-6 py-3 text-xs font-bold text-[#131315] hover:brightness-110 disabled:opacity-50 transition shadow-lg shadow-cyan-500/10"
                    >
                      {repActive ? "Analyzing Rep..." : "Simulate Squat Rep"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Body Scan Mode Graphic */
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-[24px] border border-white/10 bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" />

                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none">
                      {[...Array(24)].map((_, i) => (
                        <div key={i} className="border-[0.5px] border-white/15" />
                      ))}
                    </div>

                    {scanningBody ? (
                      <div className="z-10 text-center space-y-3">
                        <span className="text-4xl animate-spin inline-block">🔄</span>
                        <p className="text-xs font-bold text-cyan-300 animate-pulse">Running Body Fat & Posture Telemetry Audit...</p>
                      </div>
                    ) : scannedBodyResult ? (
                      <div className="absolute bottom-4 left-4 bg-emerald-500/90 rounded-full px-4 py-1.5 text-[10px] font-bold text-[#131315]">
                        ✅ POSTURE REPORT LOADED
                      </div>
                    ) : (
                      <div className="z-10 text-center space-y-2">
                        <p className="text-xs text-white/50">Align body in front grid frame silhouette.</p>
                      </div>
                    )}

                    {scanningBody && (
                      <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-cyan-400 to-transparent animate-[scan_2s_infinite]" />
                    )}
                    <style jsx>{`
                      @keyframes scan {
                        0% { left: 0%; opacity: 0; }
                        20% { opacity: 1; }
                        80% { opacity: 1; }
                        100% { left: 100%; opacity: 0; }
                      }
                    `}</style>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={runBodyScan}
                      disabled={scanningBody}
                      className="rounded-full bg-[#adc6ff] px-6 py-3 text-xs font-bold text-[#131315] hover:brightness-110 disabled:opacity-50 transition"
                    >
                      {scanningBody ? "Scanning..." : "Begin Body Scan"}
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Diagnostics Stats Panel */}
            <div className="space-y-6">
              {cameraMode === "coach" ? (
                <>
                  <GlassCard className="space-y-4">
                    <h4 className="font-bold text-white text-sm">Real-time Form Auditing</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
                        <p className="text-[10px] text-white/40 uppercase font-semibold">Rep Count</p>
                        <p className="mt-1 text-2xl font-black text-white">{repCount}</p>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
                        <p className="text-[10px] text-white/40 uppercase font-semibold">Squat Form Score</p>
                        <p className="mt-1 text-2xl font-bold text-white">{formScore}%</p>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="space-y-3">
                    <h4 className="font-bold text-white text-sm">Postural Feed Logs</h4>
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4 h-40 overflow-y-auto space-y-2 text-xs font-mono">
                      {feedLogs.map((log, idx) => {
                        const isError = log.startsWith("❌");
                        const isWarn = log.startsWith("⚠");
                        const isSuccess = log.startsWith("✅");
                        return (
                          <p
                            key={idx}
                            className={
                              isError
                                ? "text-rose-400 font-bold"
                                : isWarn
                                ? "text-yellow-400 font-semibold"
                                : isSuccess
                                ? "text-emerald-400 font-semibold"
                                : "text-white/60"
                            }
                          >
                            {log}
                          </p>
                        );
                      })}
                    </div>
                  </GlassCard>
                </>
              ) : (
                /* Body Scan Results Output */
                <GlassCard className="space-y-4">
                  <h4 className="font-bold text-white text-sm">Body Scan Diagnostic Report</h4>
                  {scannedBodyResult ? (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 border border-white/5 p-3 rounded-2xl text-center">
                          <span className="text-[9px] text-white/40 uppercase font-semibold">Body Fat %</span>
                          <span className="font-bold text-white block mt-1">{scannedBodyResult.bodyFat}%</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-3 rounded-2xl text-center">
                          <span className="text-[9px] text-white/40 uppercase font-semibold">Muscle Mass</span>
                          <span className="font-bold text-white block mt-1">{scannedBodyResult.muscleMass}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
                          <span className="text-[9px] text-white/40 block">WHR</span>
                          <span className="font-bold text-white mt-0.5 block">{scannedBodyResult.whr}</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Shoulder Width</span>
                          <span className="font-bold text-white mt-0.5 block">{scannedBodyResult.shoulderWidth}</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
                          <span className="text-[9px] text-white/40 block">Symmetry Index</span>
                          <span className="font-bold text-emerald-400 mt-0.5 block">{scannedBodyResult.symmetry}%</span>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/5 p-3 rounded-2xl text-left flex items-start gap-2">
                        <UserCheck className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white">Posture Classification</p>
                          <p className="text-[10px] text-white/50 mt-0.5">{scannedBodyResult.posture}</p>
                        </div>
                      </div>

                      <div className="bg-rose-500/5 border border-rose-500/20 p-3 rounded-2xl text-left flex items-start gap-2">
                        <AlertTriangle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-rose-200">Weak Muscle Focus Recommendation</p>
                          <p className="text-[10px] text-rose-300/60 mt-0.5 leading-relaxed">{scannedBodyResult.weakMuscle}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/40 text-xs leading-relaxed">
                      No scan data loaded. Align in posture grids and click &quot;Begin Body Scan&quot; to compute biometric profiles.
                    </div>
                  )}
                </GlassCard>
              )}
            </div>
          </div>
        );

      default:
        return (
          <GlassCard className="space-y-4">
            <p className="text-sm text-white/50">Route ready</p>
            <p className="text-2xl font-semibold text-white">{slug}</p>
            <p className="text-white/70">Use the navigation to explore the premium fitness experience.</p>
          </GlassCard>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)] text-[var(--foreground)]">
      {/* Top Navigation */}
      <TopNav 
        onMenuClick={() => setSidebarOpen(true)}
        userName="Maya Chen"
        notificationCount={3}
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName="Maya Chen"
      />

      {/* Main Content */}
      <main className="pt-20 pb-24 lg:pb-8 lg:pl-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-sm text-[var(--foreground-muted)]">{current === "dashboard" ? "Performance console" : "Project Titan OS console"}</p>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] capitalize">
              {current === "premium"
                ? "Titan Subscription Hub"
                : current === "achievements"
                ? "Achievements & Levels"
                : current === "history"
                ? "Biometric logs history"
                : current}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {renderActiveRoute()}
          </motion.div>
        </div>
      </main>

      {/* Bottom Navigation (mobile) */}
      <BottomNav />

      {/* Global AI Button */}
      <GlobalAIButton />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={() => setAuthModalOpen(false)} 
      />
    </div>
  );
}
