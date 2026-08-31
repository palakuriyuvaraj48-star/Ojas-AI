"use client";

import React from "react";
import { AlertCircle, TrendingDown, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { AdaptedPlan, AdaptationRecommendation } from "@/lib/adaptive-engine";
import { motion, AnimatePresence } from "framer-motion";

interface PlanAdaptationExplainerProps {
  adaptedPlan: AdaptedPlan;
  previousPlanDuration?: number;
  previousTrainingDays?: number;
  previousCalories?: number;
  compact?: boolean;
}

/**
 * Component that explains why a fitness plan changed.
 * Shows:
 * - What changed (before/after)
 * - Why it changed (reasoning)
 * - Confidence levels
 */
export function PlanAdaptationExplainer({
  adaptedPlan,
  previousPlanDuration = 45,
  previousTrainingDays = 5,
  previousCalories = 2300,
  compact = false,
}: PlanAdaptationExplainerProps) {
  const [isExpanded, setIsExpanded] = React.useState(!compact);

  if (!adaptedPlan.adaptations || adaptedPlan.adaptations.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4 hover:bg-blue-600/30 transition"
      >
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-blue-400" />
          <div className="text-left">
            <h3 className="font-bold text-white text-sm">Why Your Plan Changed</h3>
            <p className="text-xs text-slate-300">
              {adaptedPlan.adaptations.length} adaptation{adaptedPlan.adaptations.length !== 1 ? "s" : ""} based on your
              changing circumstances
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-slate-400" />
        ) : (
          <ChevronDown size={20} className="text-slate-400" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-800/50 border border-slate-700 border-t-0 rounded-b-lg p-4 space-y-4">
              {/* Before/After Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {adaptedPlan.beforeAfterComparison.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/50 rounded p-3 border border-slate-700"
                  >
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                      {item.category}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-500 line-through">{item.before}</div>
                        <div className="text-lg font-bold text-green-400">{item.after}</div>
                      </div>
                      <TrendingDown size={18} className="text-orange-400" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Adaptations */}
              <div className="space-y-3 border-t border-slate-700 pt-4">
                <h4 className="text-sm font-semibold text-slate-300">Adaptation Details</h4>
                {adaptedPlan.adaptations.map((adaptation, idx) => (
                  <AdaptationCard key={idx} adaptation={adaptation} />
                ))}
              </div>

              {/* Overall Reasoning */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3 mt-4">
                <p className="text-sm text-slate-200 whitespace-pre-line">
                  {adaptedPlan.changeReasoning}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual adaptation card showing one specific plan change.
 */
function AdaptationCard({ adaptation }: { adaptation: AdaptationRecommendation }) {
  return (
    <div className="bg-slate-900/30 rounded border border-slate-700 p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full mt-1" />
          <div className="font-semibold text-sm text-white capitalize">
            {(adaptation.type || "").replace(/-/g, " ")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
            {adaptation.confidence}% confident
          </span>
          {adaptation.impact === "high" && (
            <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
              High impact
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-300 mb-2">{adaptation.reasoning}</p>

      {/* Current vs Recommended */}
      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
        <div className="bg-slate-800/50 rounded p-2">
          <div className="text-slate-400 mb-1">Was</div>
          <div className="font-semibold text-slate-200">{adaptation.currentValue}</div>
        </div>
        <div className="bg-green-900/20 rounded p-2">
          <div className="text-green-400 mb-1">Now</div>
          <div className="font-semibold text-green-300">{adaptation.recommendedValue}</div>
        </div>
      </div>

      {/* Related Factors */}
      {adaptation.relatedFactors && adaptation.relatedFactors.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {adaptation.relatedFactors.map((factor, idx) => (
            <span
              key={idx}
              className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded"
            >
              {(factor || "").replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact adaptation summary card for dashboard.
 */
export function AdaptationSummaryCard({ adaptedPlan }: { adaptedPlan: AdaptedPlan }) {
  const changes = adaptedPlan.beforeAfterComparison.slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <AlertCircle size={16} className="text-blue-400" />
        Plan Updated
      </h3>

      <div className="space-y-2">
        {changes.map((change, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{change.category}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 line-through text-xs">{change.before}</span>
              <span className="text-green-400 font-semibold">{change.after}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-3">
        {adaptedPlan.adaptations.length} change{adaptedPlan.adaptations.length !== 1 ? "s" : ""} made based on your
        current circumstances.
      </p>
    </div>
  );
}
