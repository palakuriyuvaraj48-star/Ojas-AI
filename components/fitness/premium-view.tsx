"use client";

import React, { useState } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { CheckCircle2, CreditCard, Download } from "lucide-react";

export function PremiumView() {
  const { profile } = useFitness();
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeTier, setActiveTier] = useState<string | null>(null);

  if (!profile) return null;

  const tiers = [
    {
      name: "Free",
      price: 0,
      detail: "Basic calorie tracking & metrics",
      features: [
        "Standard lifting workout routines",
        "Manual food & water trackers",
        "Limited Food Scanning (3 scans/day)",
      ],
    },
    {
      name: "Titan Pro",
      price: 19,
      detail: "Biomechanics & progress engine",
      features: [
        "Unlimited AI Exercise Form audits",
        "Unlimited Food Recognition scanning",
        "12-Week adherence progress projections",
        "Daily AI Coach natural text logs",
        "Plateau and deload recommendations",
      ],
    },
    {
      name: "Titan Elite",
      price: 49,
      detail: "Total human performance integration",
      features: [
        "Biometric Wearables sync (WHOOP, Garmin)",
        "Direct verified Coach marketplace access",
        "Family accounts support (up to 4 profiles)",
        "Priority AI model rendering speeds",
        "Custom biomechanical voice parameters",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic toggle switch */}
      <GlassCard className="flex flex-col items-center justify-between gap-4 text-center max-w-2xl mx-auto p-8" glow>
        <span className="text-xs font-bold text-[#adc6ff] uppercase tracking-widest bg-[#adc6ff]/10 px-3.5 py-1.5 rounded-full border border-[#adc6ff]/20">
          Project Titan Premium Tiers
        </span>
        <h2 className="text-3xl font-black text-white">Scale Your Human Performance</h2>
        <p className="text-xs text-white/50 leading-relaxed max-w-md">
          Unleash advanced computer vision scanners and physiological adapters to accelerate your health progress.
        </p>

        <div className="inline-flex items-center gap-3 bg-black/45 p-1 rounded-2xl border border-white/5 mt-2">
          <button
            onClick={() => setIsAnnual(false)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              !isAnnual ? "bg-[#adc6ff] text-[#131315]" : "text-white/60 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
              isAnnual ? "bg-[#adc6ff] text-[#131315]" : "text-white/60 hover:text-white"
            }`}
          >
            Annually <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-black">-20%</span>
          </button>
        </div>
      </GlassCard>

      {/* Pricing Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((t) => {
          const calculatedPrice = isAnnual ? Math.round(t.price * 0.8) : t.price;
          const isPro = t.name === "Titan Pro";
          const isElite = t.name === "Titan Elite";
          const current = activeTier === t.name;

          return (
            <GlassCard
              key={t.name}
              className={`flex flex-col justify-between p-6 border-white/5 relative ${
                isPro ? "border-cyan-500/20 bg-cyan-500/5" : isElite ? "border-yellow-500/20 bg-yellow-500/5" : "bg-white/5"
              }`}
            >
              {isPro && (
                <span className="absolute top-3 right-3 bg-cyan-400 text-[#131315] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                  RECOMMENDED
                </span>
              )}

              <div className="space-y-4 text-left">
                <div>
                  <h3 className="text-lg font-bold text-white">{t.name}</h3>
                  <p className="text-[10px] text-white/40 mt-0.5">{t.detail}</p>
                </div>
                <p className="text-3xl font-black text-white">
                  ${calculatedPrice} <span className="text-xs font-semibold text-white/40">/ month</span>
                </p>
                {t.price > 0 && (
                  <p className="text-[8px] text-white/40 font-mono">
                    {isAnnual ? `*billed annually at $${calculatedPrice * 12}/yr` : "*billed monthly"}
                  </p>
                )}
                <div className="h-[1px] bg-white/10" />
                <ul className="text-xs text-white/65 space-y-2">
                  {t.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#adc6ff] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                disabled={t.price === 0}
                onClick={() => setActiveTier(t.name)}
                className={`w-full rounded-xl py-3 text-xs font-bold mt-6 transition ${
                  t.price === 0
                    ? "bg-white/5 border border-white/10 text-white/50 cursor-default"
                    : current
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : isElite
                    ? "bg-gradient-to-r from-yellow-500 to-[#adc6ff] text-[#131315] hover:brightness-110"
                    : "bg-[#adc6ff] text-[#131315] hover:brightness-110"
                }`}
              >
                {t.price === 0 ? "Current Base Plan" : current ? "✓ Active Plan" : `Upgrade to ${t.name}`}
              </button>
            </GlassCard>
          );
        })}
      </div>

      {/* Invoices & Billing Details */}
      <div className="grid gap-6 lg:grid-cols-2 pt-6">
        <GlassCard className="space-y-4">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <CreditCard className="h-4.5 w-4.5 text-[#adc6ff]" /> Payment Methods
          </h4>
          <div className="flex items-center justify-between border border-white/5 bg-black/20 p-4 rounded-2xl">
            <div className="flex items-center gap-3 text-xs text-left">
              <span className="text-2xl">💳</span>
              <div>
                <p className="font-bold text-white">Visa ending in 4242</p>
                <p className="text-[9px] text-white/45 mt-0.5">Expires 12 / 2029</p>
              </div>
            </div>
            <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
              Update
            </button>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Download className="h-4.5 w-4.5 text-[#adc6ff]" /> Invoice Ledger
          </h4>
          <div className="space-y-2 text-xs">
            {[
              { date: "July 1, 2026", amt: "$19.00", status: "Paid" },
              { date: "June 1, 2026", amt: "$19.00", status: "Paid" },
            ].map((inv, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-white/60">{inv.date}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{inv.amt}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
