"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Trophy,
  CheckCircle,
  Award,
  Sparkles,
  Zap,
  Calendar,
  Flame,
  Star,
  ShoppingBag,
  Target,
  Compass,
  ArrowRight,
  Heart,
  Smile,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MotivationTab = "dashboard" | "challenges" | "badges" | "vision" | "store" | "journey";

export function AchievementsView() {
  const [tab, setTab] = useState<MotivationTab>("dashboard");
  const [xp, setXp] = useState(12480);
  const [level, setLevel] = useState(18);
  const [streak, setStreak] = useState(18);
  
  // Daily Action Challenges
  const [dailyChallenges, setDailyChallenges] = useState([
    { id: "dc1", text: "Audit squat form with AI Camera", xp: 500, done: false },
    { id: "dc2", text: "Log a clean meal with Food Scanner", xp: 300, done: false },
    { id: "dc3", text: "Complete 10,000 steps baseline", xp: 200, done: true },
    { id: "dc4", text: "Stretch hips for 10 minutes", xp: 250, done: false },
  ]);

  // Gamification Store Items
  const [storeItems, setStoreItems] = useState([
    { id: "theme1", name: "Cyber Neon Theme", cost: 3000, type: "Theme", unlocked: false },
    { id: "voice1", name: "Arnold AI Voice Profile", cost: 5000, type: "Coach Voice", unlocked: false },
    { id: "avatar1", name: "Golden Skeletal Frame", cost: 2000, type: "Avatar Frame", unlocked: false },
    { id: "celeb1", name: "Lava Spark Celebration", cost: 1500, type: "Animation", unlocked: false },
  ]);

  // Vision Board State
  const [targetWeight, setTargetWeight] = useState("72.0 kg");
  const [targetSquat, setTargetSquat] = useState("150 kg");
  const [motivationQuote, setMotivationQuote] = useState("Continuous effort - not strength or intelligence - is the key to unlocking our potential.");

  // Badges array
  const badges = [
    { name: "Form Master", desc: "Form Score > 90% in Squats", active: true, icon: "🛡️", tier: "Gold" },
    { name: "Streak King", desc: "18-day active checkin streak", active: true, icon: "👑", tier: "Gold" },
    { name: "Hydration Hero", desc: "Water target hit 7 days straight", active: true, icon: "💧", tier: "Silver" },
    { name: "Overload Ace", desc: "Increased weights 3 weeks straight", active: true, icon: "🏋️‍♂️", tier: "Silver" },
    { name: "Fat Burner Elite", desc: "Shed 5kg cumulative weight", active: false, icon: "🔥", tier: "Diamond" },
    { name: "Sensor Integrator", desc: "Linked WHOOP and Apple Health", active: false, icon: "⚡", tier: "Legendary" },
  ];

  const checkChallenge = (id: string, challengeXp: number) => {
    setDailyChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id && !c.done) {
          setXp((prevXp) => {
            const nextXp = prevXp + challengeXp;
            if (nextXp >= 15000) {
              setLevel((prevLevel) => prevLevel + 1);
              return nextXp - 15000;
            }
            return nextXp;
          });
          return { ...c, done: true };
        }
        return c;
      })
    );
  };

  const buyStoreItem = (id: string, cost: number) => {
    if (xp < cost) {
      alert("Insufficient XP balance! Complete daily challenges and workouts to earn more.");
      return;
    }
    setXp((prev) => prev - cost);
    setStoreItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unlocked: true } : item))
    );
  };

  const triggerStreakReset = () => {
    setStreak(0);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between bg-[rgba(24,23,26,0.35)] border-white/5" glow>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500">
            <Trophy className="h-6 w-6 text-[#131315]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-yellow-400">AI Motivation System</p>
            <h2 className="text-xl font-bold text-white">Gamification &amp; Habit Builder</h2>
            <p className="text-xs text-white/50">Unlock themes, badges, streaks, and progress map journeys.</p>
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Level {level} Title</span>
          <span className="font-extrabold text-white text-md">Elite Athlete</span>
        </div>
      </GlassCard>

      {/* Tabs */}
      <GlassCard className="p-3 bg-[rgba(24,23,26,0.35)] border-white/5 flex gap-2 flex-wrap">
        {[
          { id: "dashboard", label: "Motivation Dashboard" },
          { id: "challenges", label: "Missions & Challenges" },
          { id: "badges", label: "Badges & Milestones" },
          { id: "vision", label: "AI Vision Board" },
          { id: "store", label: "Gamification Store" },
          { id: "journey", label: "Progress Journey Map" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as MotivationTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === item.id
                ? "bg-[#adc6ff] text-[#131315]"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </GlassCard>

      {/* Animate Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          
          {tab === "dashboard" && (
            <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
              {/* Level progress and Daily missions */}
              <div className="space-y-6">
                <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block">XP Progression</span>
                      <span className="text-lg font-bold text-white mt-0.5 block">Athlete Level {level}</span>
                    </div>
                    <span className="text-xs text-white/50">{xp} / 15,000 XP</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${(xp / 15000) * 100}%` }} />
                  </div>
                </GlassCard>

                {/* Positive Streak Responders */}
                <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="h-4.5 w-4.5 text-orange-400 animate-pulse" /> Active Habit Streaks
                    </h4>
                    <button
                      onClick={triggerStreakReset}
                      className="text-[9px] border border-white/10 hover:bg-white/5 text-white/40 px-2 py-0.5 rounded"
                    >
                      Simulate Break
                    </button>
                  </div>

                  {streak > 0 ? (
                    <div className="flex gap-4">
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center shrink-0 w-24">
                        <span className="text-3xl block">🔥</span>
                        <span className="text-xl font-black text-orange-400 mt-1 block">{streak} Days</span>
                        <span className="text-[9px] text-white/40 block mt-0.5">Current Streak</span>
                      </div>
                      <div className="text-xs text-white/70 leading-relaxed flex items-center">
                        💡 **AI Encouragement**: You have successfully hit your calorie and progressive strength check-in targets for {streak} days straight! Maintain this pace to secure your next level-up title (Warrior).
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-2xl flex items-start gap-3 text-xs text-white/70 leading-relaxed">
                      <Smile className="h-5 w-5 text-[#adc6ff] shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <p className="font-bold text-white">Let's reset and rebuild together!</p>
                        <p className="text-white/50 text-[11px] mt-0.5">
                          &quot;It is completely normal to miss a session when schedules get busy. Great progress is built long-term. Let's start a fresh habit streak today with a quick hip stretch or a short walk!&quot;
                        </p>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* Milestones list */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="h-4.5 w-4.5 text-yellow-400" /> Recent Milestones
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">First Squat Form Check</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">Logged with 94% ROM accuracy.</span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black">COMPLETED</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">50 Progressive Workouts</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">Cumulative strength tracker.</span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black">COMPLETED</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "challenges" && (
            <div className="grid gap-6 md:grid-cols-2 text-left text-xs">
              {/* Daily Action Challenges */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-[#adc6ff]" /> Daily Action Missions
                </h4>
                <div className="space-y-2.5">
                  {dailyChallenges.map((c) => (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between rounded-xl border p-3 text-xs transition ${
                        c.done
                          ? "border-emerald-500/20 bg-emerald-500/5 text-white/50"
                          : "border-white/5 bg-white/5 text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {c.done ? (
                          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                        ) : (
                          <button
                            onClick={() => checkChallenge(c.id, c.xp)}
                            className="h-5 w-5 rounded-lg border border-white/20 hover:border-[#adc6ff] transition shrink-0"
                          />
                        )}
                        <span>{c.text}</span>
                      </div>
                      <span className="font-bold text-[#adc6ff]">+{c.xp} XP</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Weekly and Monthly challenges */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-4.5 w-4.5 text-yellow-400" /> Weekly &amp; Monthly Challenges
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">4 Strength Sessions / Wk</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">Progress: 3 / 4 completed</span>
                    </div>
                    <span className="font-black text-yellow-400">75%</span>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">Protein Consistency 5 Days</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">Progress: 5 / 5 met</span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black">UNLOCKED</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "badges" && (
            <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-[#adc6ff]" /> Digital Badges &amp; Milestones
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badges.map((b) => (
                  <div
                    key={b.name}
                    className={`rounded-2xl border p-4 text-center transition flex flex-col items-center justify-center gap-2 ${
                      b.active
                        ? "border-[#adc6ff]/20 bg-[#adc6ff]/5 text-white"
                        : "border-white/5 bg-white/5 text-white/30"
                    }`}
                  >
                    <span className="text-3xl">{b.icon}</span>
                    <div>
                      <p className="text-xs font-bold">{b.name}</p>
                      <p className="text-[9px] text-white/45 mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                    <div className="flex gap-1.5 items-center justify-center mt-1">
                      <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded font-black text-white/50 uppercase">{b.tier}</span>
                      {b.active ? (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">UNLOCKED</span>
                      ) : (
                        <span className="text-[8px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded font-bold uppercase">LOCKED</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {tab === "vision" && (
            <div className="grid gap-6 md:grid-cols-2 text-left text-xs">
              {/* Vision Board Editor */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                  <Target className="h-4.5 w-4.5 text-[#adc6ff]" /> AI Vision Board
                </h4>
                <div className="space-y-4">
                  <label className="block space-y-1.5">
                    <span className="text-white/40 block text-[9.5px] uppercase">Target Weight Goal</span>
                    <input
                      type="text"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-white/40 block text-[9.5px] uppercase">Target Squat 1RM</span>
                    <input
                      type="text"
                      value={targetSquat}
                      onChange={(e) => setTargetSquat(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-white/40 block text-[9.5px] uppercase">Motivational Quote</span>
                    <textarea
                      value={motivationQuote}
                      onChange={(e) => setMotivationQuote(e.target.value)}
                      rows={3}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white leading-relaxed text-[11px]"
                    />
                  </label>
                </div>
              </GlassCard>

              {/* Vision board display */}
              <GlassCard className="p-5 space-y-3 border-white/5 bg-[rgba(24,23,26,0.35)] flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider">Vision Board Manifest</h4>
                  <div className="border border-[#adc6ff]/10 rounded-2xl bg-[#adc6ff]/5 p-4 text-[11.5px] italic text-white/80 leading-relaxed mt-3">
                    &quot;{motivationQuote}&quot;
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Target Weight Progress</span>
                    <span className="font-bold text-[#adc6ff]">{targetWeight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Target Lift Progress</span>
                    <span className="font-bold text-[#adc6ff]">{targetSquat}</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "store" && (
            <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="h-4.5 w-4.5 text-cyan-400" /> Gamification Store
                </h4>
                <span className="font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">{xp} XP</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {storeItems.map((item) => (
                  <div key={item.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">{item.type}</span>
                    </div>

                    <button
                      onClick={() => buyStoreItem(item.id, item.cost)}
                      disabled={item.unlocked}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition ${
                        item.unlocked
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : "bg-cyan-400 text-[#131315] hover:brightness-110"
                      }`}
                    >
                      {item.unlocked ? "UNLOCKED" : `${item.cost} XP`}
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {tab === "journey" && (
            <GlassCard className="p-5 space-y-5 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="h-4.5 w-4.5 text-yellow-400" /> Progress Journey Map
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {[
                  { title: "First Workout Logged", desc: "Initialized biometric and baseline models.", done: true },
                  { title: "10 Workouts Logged", desc: "First strength consistency badge unlocked.", done: true },
                  { title: "50 Workouts Milestone", desc: "Active level 18 Athlete unlocked.", done: true },
                  { title: "100 Workouts Peak Warrior", desc: "Unlocks Arnold AI Coach Voice profile customization.", done: false },
                ].map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-full border-2 ${
                      item.done
                        ? "bg-emerald-400 border-emerald-500"
                        : "bg-[#131315] border-white/20"
                    }`} />
                    <div className="pl-4">
                      <span className={`font-bold block ${item.done ? "text-white" : "text-white/40"}`}>{item.title}</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
