import React from "react";
import { motion } from "framer-motion";
import UniversityCard from "@/components/radar/UniversityCard";
import { TIER_COLORS } from "@/lib/constants";

const TIER_META = {
  Safety: { title: "Safety", subtitle: "High Probability — strong chance of admission" },
  Target: { title: "Target", subtitle: "Moderate — a realistic, well-matched fit" },
  Reach: { title: "Reach", subtitle: "Ambitious — competitive, worth aiming high" },
  Unlikely: { title: "Unlikely", subtitle: "Low Probability — below typical admission benchmarks" },
};

export default function RiskTierSection({ tier, items, profile }) {
  if (!items.length) return null;
  const meta = TIER_META[tier];
  const colors = TIER_COLORS[tier];

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <h2 className={`text-xl font-bold ${colors.text}`}>{meta.title}</h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">{meta.subtitle}</span>
        <span className="text-sm text-slate-400 dark:text-slate-500 ml-auto">
          {items.length} match{items.length !== 1 ? "es" : ""}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(({ uni, result }, index) => (
          <motion.div
            key={uni.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
          >
            <UniversityCard uni={uni} result={result} profile={profile} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}