"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sparkles,
  Info,
  Calendar,
  Zap,
  Activity,
  Plus,
  RefreshCw,
  GitCommit,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
  Play,
  History,
} from "lucide-react";

export function AutomationView() {
  const [workflows, setWorkflows] = useState([
    { id: "w1", name: "CNS Overreaching Deload", trigger: "Sleep < 70%", action: "Reduce Workout Intensity 20%", active: true },
    { id: "w2", name: "Ankle Mobility Stretching", trigger: "Form Score < 80%", action: "Send mobility flossing reminder", active: false },
    { id: "w3", name: "Calorie surplus loading", trigger: "Recovery Score > 85%", action: "Increase calories 200 kcal", active: true },
  ]);

  const [triggerSelect, setTriggerSelect] = useState("Sleep < 70%");
  const [actionSelect, setActionSelect] = useState("Reduce Workout Intensity 20%");
  const [newWorkflowName, setNewWorkflowName] = useState("");

  const addWorkflow = () => {
    if (!newWorkflowName.trim()) return;
    const newWf = {
      id: `w_${Date.now()}`,
      name: newWorkflowName,
      trigger: triggerSelect,
      action: actionSelect,
      active: true,
    };
    setWorkflows([...workflows, newWf]);
    setNewWorkflowName("");
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="space-y-6 text-left text-xs">
      
      {/* Header */}
      <GlassCard className="p-5 bg-[rgba(24,23,26,0.35)] border-white/5" glow>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff]">
            <Zap className="h-6 w-6 text-[#131315]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#adc6ff]">AI Automation Builder</p>
            <h2 className="text-xl font-bold text-white">Fitness Automations</h2>
            <p className="text-xs text-white/50">Build custom Trigger-Condition-Action workflows similar to Zapier.</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        
        {/* Left Column: Visual Builder & Workflows */}
        <div className="space-y-6">
          
          {/* Visual Node Builder */}
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-[#adc6ff]" /> Create Custom Workflow
            </h3>

            <div className="space-y-4">
              <label className="block space-y-1">
                <span className="text-[10px] text-white/40 uppercase font-semibold">Workflow Name</span>
                <input
                  type="text"
                  placeholder="e.g., Hydration Push on High Heat index"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </label>

              {/* Visual flow chart triggers */}
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] items-center">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2 text-center">
                  <span className="text-[9px] text-[#adc6ff] bg-[#adc6ff]/10 px-2 py-0.5 rounded font-black uppercase">Trigger</span>
                  <select
                    value={triggerSelect}
                    onChange={(e) => setTriggerSelect(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-2 text-xs text-white focus:outline-none mt-2"
                  >
                    <option value="Sleep < 70%">Sleep Quality &lt; 70%</option>
                    <option value="HRV drop > 15%">HRV Drop &gt; 15%</option>
                    <option value="Workout Missed">Workout Missed</option>
                    <option value="Calories exceeded">Calories target exceeded</option>
                  </select>
                </div>

                <div className="flex justify-center text-[#adc6ff]">
                  <ArrowRight className="h-5 w-5 rotate-90 sm:rotate-0" />
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2 text-center">
                  <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-black uppercase">Action</span>
                  <select
                    value={actionSelect}
                    onChange={(e) => setActionSelect(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-2 text-xs text-white focus:outline-none mt-2"
                  >
                    <option value="Reduce Workout Intensity 20%">Reduce Intensity 20%</option>
                    <option value="Send mobility flossing reminder">Send stretch reminder</option>
                    <option value="Increase calories 200 kcal">Increase calories 200 kcal</option>
                    <option value="Trigger Rest Day option">Schedule recovery day</option>
                  </select>
                </div>
              </div>

              <button
                onClick={addWorkflow}
                className="w-full bg-[#adc6ff] hover:brightness-110 text-[#131315] font-black text-xs py-2.5 rounded-xl transition"
              >
                Add Workflow Rule
              </button>
            </div>
          </GlassCard>

          {/* Active Workflows list */}
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Active Rule Definitions</h3>
            <div className="space-y-3">
              {workflows.map((w) => (
                <div key={w.id} className="flex justify-between items-center p-3.5 bg-white/5 border border-white/5 rounded-2xl">
                  <div>
                    <span className="font-bold text-white block text-sm">{w.name}</span>
                    <span className="text-[10px] text-white/40 block mt-0.5">
                      If **{w.trigger}** &rarr; Then **{w.action}**
                    </span>
                  </div>

                  <div className="flex gap-2.5 items-center">
                    <button onClick={() => toggleWorkflow(w.id)} className="text-white">
                      {w.active ? <ToggleRight className="h-7 w-7 text-emerald-400" /> : <ToggleLeft className="h-7 w-7 text-white/30" />}
                    </button>
                    <button
                      onClick={() => deleteWorkflow(w.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/25 transition font-black text-[10px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: execution logs & templates */}
        <div className="space-y-6">
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4 text-left">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-[#adc6ff]" /> Rule Execution History
            </h4>
            <div className="space-y-3.5">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-white">CNS Overreaching Deload</span>
                  <span className="text-white/40">Today, 07:12 AM</span>
                </div>
                <p className="text-[10.5px] text-emerald-400">Trigger met: Sleep was 65%. Workout split deload applied.</p>
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-white">Calorie surplus loading</span>
                  <span className="text-white/40">Yesterday, 06:30 PM</span>
                </div>
                <p className="text-[10.5px] text-white/50">Trigger met: Recovery score 89%. Consumed target modified.</p>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
