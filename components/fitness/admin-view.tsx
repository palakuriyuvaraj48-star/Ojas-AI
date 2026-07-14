"use client";

import React, { useState } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { ShieldCheck, UserCheck, BarChart2, Zap } from "lucide-react";

export function AdminView() {
  const { profile } = useFitness();
  const [activePortal, setActivePortal] = useState<"coach" | "admin">("coach");

  // Coach Portal States
  const [calorieAdjustment, setCalorieAdjustment] = useState("-150");
  const [volumeStrategy, setVolumeStrategy] = useState("maintenance");

  // Admin Feature Flags
  const [flags, setFlags] = useState({
    voiceCoach: true,
    poseModelBeta: false,
    indianMealOptimizer: true,
  });

  if (!profile) return null;

  const handleAdjustClient = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Client adjustments synced: Calories adjusted by ${calorieAdjustment} kcal, Volume: ${volumeStrategy}`);
  };

  const toggleFlag = (flagName: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [flagName]: !prev[flagName] }));
  };

  return (
    <div className="space-y-6">
      {/* Switch Portal tab */}
      <GlassCard className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#adc6ff]" /> Enterprise Control Center
          </h3>
          <p className="text-xs text-white/50">Admin diagnostics console & sports nutrition coach portals.</p>
        </div>

        <div className="flex bg-black/30 rounded-xl p-1 border border-white/5 shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActivePortal("coach")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activePortal === "coach" ? "bg-[#adc6ff]/15 text-[#adc6ff]" : "text-white/50 hover:text-white"
            }`}
          >
            Coach Portal
          </button>
          <button
            onClick={() => setActivePortal("admin")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activePortal === "admin" ? "bg-[#adc6ff]/15 text-[#adc6ff]" : "text-white/50 hover:text-white"
            }`}
          >
            Admin telemetry
          </button>
        </div>
      </GlassCard>

      {activePortal === "coach" ? (
        /* Coach Portal view */
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassCard className="space-y-4" glow>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-[#adc6ff]" /> Client Compliance Sheet
              </h4>
              <span className="text-[10px] rounded-full bg-[#adc6ff]/10 px-2 py-0.5 text-[#adc6ff] font-bold uppercase">Active Client: Maya Chen</span>
            </div>

            <div className="space-y-4 text-xs text-left">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                  <span className="text-[9px] text-white/40 block uppercase">compliance index</span>
                  <span className="font-bold text-emerald-400 block mt-1 text-lg">92.5%</span>
                </div>
                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                  <span className="text-[9px] text-white/40 block uppercase">Training Streak</span>
                  <span className="font-bold text-white block mt-1 text-lg">18 days</span>
                </div>
                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                  <span className="text-[9px] text-white/40 block uppercase">Weekly Delta</span>
                  <span className="font-bold text-white block mt-1 text-lg">-0.6 kg</span>
                </div>
              </div>

              {/* Adjust client macros form */}
              <form onSubmit={handleAdjustClient} className="space-y-4 pt-3 border-t border-white/5">
                <p className="font-bold text-white uppercase text-[10px] tracking-wider text-white/40">Adjust Biometrics Calibrations</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-white/60 block">Calorie Override delta</label>
                    <select
                      value={calorieAdjustment}
                      onChange={(e) => setCalorieAdjustment(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#16161a] p-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="-250">-250 kcal (Aggressive cut)</option>
                      <option value="-150">-150 kcal (Standard cut)</option>
                      <option value="0">0 kcal (Maintain split)</option>
                      <option value="+150">+150 kcal (Clean surplus)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-white/60 block">Lifting volume Strategy</label>
                    <select
                      value={volumeStrategy}
                      onChange={(e) => setVolumeStrategy(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#16161a] p-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="maintenance">Maintained volume</option>
                      <option value="overload">Progressive Overload overload</option>
                      <option value="deload">Deload volume strategy</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#adc6ff] py-2.5 text-xs font-bold text-[#131315] hover:brightness-110 transition"
                >
                  Apply Calibrations & Sync Client Dashboard
                </button>
              </form>
            </div>
          </GlassCard>

          {/* Right side checkin log audit summary */}
          <GlassCard className="space-y-4">
            <h4 className="font-bold text-white text-sm">Coach Communication History</h4>
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4 h-40 overflow-y-auto space-y-2 text-xs">
              <div className="text-left">
                <span className="font-bold text-[#adc6ff]">Client Maya Chen</span>
                <p className="text-[10px] text-white/60 mt-0.5 leading-relaxed">
                  &quot;Hi Coach, my shoulder feels a little tight during bench press. Can we swap it out?&quot;
                </p>
              </div>
              <div className="text-left border-t border-white/5 pt-2">
                <span className="font-bold text-white">Coach Vikram</span>
                <p className="text-[10px] text-white/60 mt-0.5 leading-relaxed">
                  &quot;Absolutely. I&apos;ve enabled the Dumbbell Chest Press swap in your active workout dashboard to relieve rotator cuff strain.&quot;
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      ) : (
        /* Admin Diagnostics view */
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassCard className="space-y-4" glow>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <BarChart2 className="h-4.5 w-4.5 text-[#adc6ff]" /> Core Database Telemetry
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/60">Gemini LLM model endpoint</span>
                <span className="font-bold text-emerald-400">ONLINE (142ms delay)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/60">Supabase DB connection</span>
                <span className="font-bold text-emerald-400">ONLINE (18ms)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/60">Prisma database sync status</span>
                <span className="font-bold text-emerald-400">SYNCED (0 mutations pending)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Vercel Edge latency</span>
                <span className="font-bold text-cyan-400">8ms</span>
              </div>
            </div>
          </GlassCard>

          {/* Admin Feature Flags Toggles */}
          <GlassCard className="space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Zap className="h-4.5 w-4.5 text-yellow-400 animate-pulse" /> Feature Flag Toggles
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-white/70">Biomechanical Voice Coach audio</span>
                <button
                  onClick={() => toggleFlag("voiceCoach")}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${flags.voiceCoach ? "bg-emerald-500" : "bg-white/10"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#131315] transition-transform ${flags.voiceCoach ? "translate-x-5" : ""}`} />
                </button>
              </div>

              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-white/70">MediaPipe pose model (Beta)</span>
                <button
                  onClick={() => toggleFlag("poseModelBeta")}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${flags.poseModelBeta ? "bg-emerald-500" : "bg-white/10"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#131315] transition-transform ${flags.poseModelBeta ? "translate-x-5" : ""}`} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/70">Indian meal scanning optimizer</span>
                <button
                  onClick={() => toggleFlag("indianMealOptimizer")}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${flags.indianMealOptimizer ? "bg-emerald-500" : "bg-white/10"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#131315] transition-transform ${flags.indianMealOptimizer ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
