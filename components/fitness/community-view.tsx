"use client";

import React, { useState } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Users,
  Award,
  ShieldCheck,
  Sparkles,
  Send,
  MessageSquare,
  Calendar,
  ThumbsUp,
  Heart,
  UserPlus,
  Lock,
  Plus,
  BookOpen,
  MessageCircle,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CommunityTab = "feed" | "circles" | "challenges" | "coaches" | "events" | "recovery";

export function CommunityView() {
  const { profile } = useFitness();
  const [tab, setTab] = useState<CommunityTab>("feed");
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [bookedCoach, setBookedCoach] = useState<string | null>(null);
  const [rsvpedEvents, setRsvpedEvents] = useState<string[]>([]);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);

  // Post feed state
  const [feedPosts, setFeedPosts] = useState([
    { id: "p1", user: "Rhonda Patrick", content: "Met protein targets (170g) 5 days straight! Core stability feeling strong.", likes: 14, comments: 3, bookmarked: false },
    { id: "p2", user: "David Goggins", content: "Logged 12km running baseline at 05:00 AM. Pace remains solid.", likes: 45, comments: 12, bookmarked: false },
    { id: "p3", user: "Vikram Malhotra", content: "Hip mobility flossing works wonders. Reached parallel on squat checks today.", likes: 22, comments: 5, bookmarked: false },
  ]);
  const [newPostText, setNewPostText] = useState("");

  if (!profile) return null;

  const groups = [
    { id: "g1", name: "5 AM Club", members: "4.2k active", streak: "12-day avg", desc: "Early morning workouts and daily step audits." },
    { id: "g2", name: "Powerlifters Alliance", members: "1.8k active", streak: "8-day avg", desc: "Squat, bench, and deadlift progressive overload tracking." },
    { id: "g3", name: "Hyrox Hybrid Training", members: "2.1k active", streak: "10-day avg", desc: "Combining engine endurance with metabolic strength circuits." },
  ];

  const coaches = [
    { id: "c1", name: "Dr. Greg Foster", title: "Sports Physiotherapist", rating: "4.9/5 (120 reviews)", price: "$75/session", desc: "Specializes in joint longevity, ACL rehab, and correcting structural posture anomalies." },
    { id: "c2", name: "Sarah Jenkins, RD", title: "Registered Sports Dietitian", rating: "5.0/5 (94 reviews)", price: "$90/session", desc: "Clinical focus on lean mass gains, metabolic adaptations, and vegan macro setups." },
  ];

  const handleGroupJoin = (id: string) => {
    setJoinedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleBookCoach = (name: string) => {
    setBookedCoach(name);
    setTimeout(() => {
      setBookedCoach(null);
    }, 3000);
  };

  const toggleRsvp = (id: string) => {
    setRsvpedEvents((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const addPost = () => {
    if (!newPostText.trim()) return;
    const newPost = {
      id: `p_${Date.now()}`,
      user: profile.name || "Anonymous",
      content: newPostText,
      likes: 0,
      comments: 0,
      bookmarked: false,
    };
    setFeedPosts([newPost, ...feedPosts]);
    setNewPostText("");
  };

  const toggleLike = (id: string) => {
    setFeedPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const muteUser = (user: string) => {
    setMutedUsers([...mutedUsers, user]);
  };

  const filteredPosts = feedPosts.filter((p) => !mutedUsers.includes(p.user));

  return (
    <div className="space-y-6 text-left">
      
      {/* Tabs */}
      <GlassCard className="p-3 bg-[rgba(24,23,26,0.35)] border-white/5 flex gap-2 flex-wrap">
        {[
          { id: "feed", label: "Community Feed" },
          { id: "circles", label: "Accountability Circles" },
          { id: "challenges", label: "Community Challenges" },
          { id: "coaches", label: "Coach Hub" },
          { id: "events", label: "Event Planner" },
          { id: "recovery", label: "Recovery Support Groups" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as CommunityTab)}
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

      {/* Tab Switch Layouts */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          
          {tab === "feed" && (
            <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
              {/* Feed posts */}
              <div className="space-y-4">
                {/* Create post box */}
                <GlassCard className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5 flex gap-3">
                  <input
                    type="text"
                    placeholder="Share a milestone, workout summary, or nutrition success story..."
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none"
                  />
                  <button
                    onClick={addPost}
                    className="px-4 bg-[#adc6ff] hover:brightness-110 rounded-xl text-xs font-black text-[#131315] flex items-center gap-1"
                  >
                    <Send className="h-3.5 w-3.5" /> Post
                  </button>
                </GlassCard>

                {/* Posts list */}
                <div className="space-y-3">
                  {filteredPosts.map((post) => (
                    <GlassCard key={post.id} className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{post.user}</span>
                          <span className="text-[9px] text-[#adc6ff] bg-[#adc6ff]/10 px-1.5 py-0.5 rounded">Member</span>
                        </div>
                        
                        <button
                          onClick={() => muteUser(post.user)}
                          className="text-[9px] text-white/30 hover:text-white flex items-center gap-0.5"
                          title="Mute User"
                        >
                          <EyeOff className="h-3 w-3" /> Mute
                        </button>
                      </div>

                      <p className="text-xs text-white/70 leading-relaxed">{post.content}</p>

                      <div className="flex gap-4 border-t border-white/5 pt-2 text-[10px] text-white/45">
                        <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1 hover:text-white">
                          <ThumbsUp className="h-3.5 w-3.5 text-cyan-400" /> {post.likes} Kudos
                        </button>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" /> {post.comments} Comments
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>

              {/* Sidebar community indicators */}
              <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4 text-xs text-left">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-yellow-400" /> Community Insights
                </h4>
                <div className="p-3.5 bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-2xl leading-relaxed text-white/70">
                  ⚡ **AI Support Note**: The overall Community Health Score is 92%. Cooperative challenge participation has increased by 18% this week. Keep sharing kudos!
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "circles" && (
            <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
              {/* Pod circle and Partner Workouts */}
              <div className="space-y-6">
                <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">Accountability Pod #42</h3>
                    <span className="text-[9px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded font-black">Titan Hybrid Builders</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <div>
                        <span className="font-bold text-white block">David Goggins</span>
                        <span className="text-[9px] text-white/40 block mt-0.5">Completed 12km running baseline</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">Checked In</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <div>
                        <span className="font-bold text-white block">Rhonda Patrick</span>
                        <span className="text-[9px] text-white/40 block mt-0.5">Logged 3.5L hydration target</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">Checked In</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <div>
                        <span className="font-bold text-white/40 block">Vikram Malhotra</span>
                        <span className="text-[9px] text-white/30 block mt-0.5">Rest day recovery active</span>
                      </div>
                      <span className="text-[9px] bg-white/5 text-white/40 px-2 py-0.5 rounded font-bold">Awaiting</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-[9.5px] text-white/40 leading-relaxed">
                    🔒 **Privacy Protection**: Weight metrics are hidden. Logs share progress only in terms of consistency.
                  </div>
                </GlassCard>

                {/* Partner workout scheduling */}
                <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4">
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1">
                    <UserPlus className="h-4.5 w-4.5 text-[#adc6ff]" /> Partner Workouts
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Invite circle partners or friends to cooperative virtual workout slots:
                  </p>
                  <button
                    onClick={() => alert("Workout invitation sent to Pod #42 partners!")}
                    className="w-full bg-[#adc6ff] text-[#131315] hover:brightness-110 font-bold py-2 rounded-xl text-xs"
                  >
                    Schedule Session with Partner
                  </button>
                </GlassCard>
              </div>

              {/* Family Share mode */}
              <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4 text-xs text-left">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="h-4.5 w-4.5 text-cyan-400" /> Family Share Settings
                </h4>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span>Couple Goals Sync</span>
                    <button className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white">Active</button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Hide Weight parameters</span>
                    <button className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-400">Enabled</button>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "challenges" && (
            <div className="grid gap-6 md:grid-cols-2 text-xs text-left">
              {/* Active community challenges */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Active Challenges</h4>
                <div className="space-y-3">
                  {[
                    { title: "Global Hydration Week", category: "Hydration", joined: true, progress: "6/7 days" },
                    { title: "Rotator Cuff Mobility Week", category: "Recovery", joined: true, progress: "3/3 sessions" },
                    { title: "Strength Month Peak Deadlift", category: "Strength", joined: false, progress: "0/15 volume target" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block">{item.title}</span>
                        <span className="text-[10px] text-white/40 block mt-0.5">Category: {item.category} • Progress: {item.progress}</span>
                      </div>

                      <button
                        onClick={() => alert(`Joined ${item.title} challenge successfully!`)}
                        disabled={item.joined}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                          item.joined
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-[#adc6ff] text-[#131315] hover:brightness-110"
                        }`}
                      >
                        {item.joined ? "JOINED" : "JOIN"}
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Team Goals Gym/Office */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Cooperative Team Goals</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">Office 10k Steps Team</span>
                      <span className="font-black text-[#adc6ff]">84%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-[#adc6ff]" style={{ width: "84%" }} />
                    </div>
                    <span className="text-[9px] text-white/40 block">Goal: 45,000 collective steps this week.</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "coaches" && (
            <GlassCard className="p-5 space-y-5 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Verified Coach Marketplace</h4>
              </div>

              {bookedCoach && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center text-[11px] text-emerald-400 font-bold animate-pulse">
                  ✓ Consult booking request sent for {bookedCoach}!
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {coaches.map((c) => (
                  <div key={c.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <div>
                          <span className="font-bold text-white block text-sm">{c.name}</span>
                          <span className="text-[9.5px] text-white/40 block mt-0.5">{c.title} • {c.rating}</span>
                        </div>
                        <span className="font-black text-[#adc6ff]">{c.price}</span>
                      </div>
                      <p className="text-[11px] text-white/60 leading-relaxed mt-2">{c.desc}</p>
                    </div>

                    <button
                      onClick={() => handleBookCoach(c.name)}
                      className="w-full bg-[#adc6ff] hover:brightness-110 text-[#131315] font-black text-xs py-2 rounded-xl mt-3"
                    >
                      Schedule Consult Call
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {tab === "events" && (
            <GlassCard className="p-5 space-y-5 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Upcoming Community Events</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { id: "e1", title: "Saturday Morning Outdoor Walk", type: "Meetup", date: "July 18, 08:00 AM" },
                  { id: "e2", title: "Virtual Group Yoga Session", type: "Virtual Session", date: "July 20, 06:30 PM" },
                ].map((event) => {
                  const going = rsvpedEvents.includes(event.id);
                  return (
                    <div key={event.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block">{event.title}</span>
                        <span className="text-[9.5px] text-white/40 block mt-0.5">{event.type} • {event.date}</span>
                      </div>

                      <button
                        onClick={() => toggleRsvp(event.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black transition ${
                          going
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-[#adc6ff] text-[#131315] hover:brightness-110"
                        }`}
                      >
                        {going ? "GOING" : "RSVP"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {tab === "recovery" && (
            <GlassCard className="p-5 space-y-5 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Recovery &amp; Mobility Support Channels</h4>
              <div className="p-4 bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-2xl space-y-2">
                <p className="font-bold text-[#adc6ff] flex items-center gap-1"><Sparkles className="h-4 w-4" /> AI Recovery Prompts:</p>
                <p className="leading-relaxed text-white/70">
                  &quot;Stretching the hip flexors after high volume loading sets reduces lumbar tension parameters by 30%. Connect in the chat to log your 10-minute mobility routines together!&quot;
                </p>
              </div>
            </GlassCard>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
