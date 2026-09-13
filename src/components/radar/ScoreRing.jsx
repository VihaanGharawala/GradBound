import React from "react";
import { motion } from "framer-motion";

export default function ScoreRing({ score = 0, size = 104, label = "fit" }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.max(0, Math.min(100, Number(score) || 0));
  const offset = circumference - (safe / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="7" className="text-secondary" />
        <motion.circle initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: .9, ease: [0.22,1,0.36,1] }} cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} className="text-primary" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="text-2xl font-black leading-none">{safe}</div><div className="mt-1 text-[9px] font-bold uppercase tracking-[.16em] text-muted-foreground">{label}</div></div>
      </div>
    </div>
  );
}
