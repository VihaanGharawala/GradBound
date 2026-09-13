import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TIER_COLORS, COUNTRY_FLAGS } from "@/lib/constants";
import MatchExplanation from "@/components/radar/MatchExplanation";

export default function UniversityCard({ uni, result, profile }) {
  const navigate = useNavigate();
  const colors = TIER_COLORS[result.tier] || TIER_COLORS.Reach;
  const [showWhy, setShowWhy] = useState(false);
  const [plan, setPlan] = useState(() => { try { return JSON.parse(localStorage.getItem("gradbound_plan") || "{}")[uni.id] || ""; } catch { return ""; } });
  const choosePlan = (e, value) => {
    e.stopPropagation();
    let stored = {};
    try { const parsed = JSON.parse(localStorage.getItem("gradbound_plan") || "{}"); stored = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; } catch { stored = {}; }
    const next = { ...stored, [uni.id]: value };
    try { localStorage.setItem("gradbound_plan", JSON.stringify(next)); } catch { /* UI remains usable if storage is unavailable */ }
    setPlan(value);
    try { window.dispatchEvent(new Event("gradbound-plan")); } catch { /* ignore */ }
  };
  return (
    <Card onClick={() => navigate(`/university/${uni.id}`)} className={`group overflow-hidden cursor-pointer border ${colors.border} ${colors.bg} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex h-[96px] shrink-0 items-start justify-between gap-3 overflow-hidden border-b border-border bg-secondary/35 p-4">
        <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{uni.country}</p><h3 className={`university-name mt-1 line-clamp-2 whitespace-normal break-normal font-black leading-[1.15] tracking-tight ${String(uni.name||"").length > 34 ? "text-[15px]" : "text-[17px]"}`}>{uni.name}</h3></div>
        <div className="flex w-12 shrink-0 flex-col items-center gap-1">
          <Badge className="shrink-0">{result.score}/100</Badge>
          <span className="country-flag text-base leading-none" aria-label={`${uni.country} flag`}>{COUNTRY_FLAGS[uni.country] || "🌍"}</span>
        </div>
      </div>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-muted-foreground truncate">{uni.program_title || uni.specific_major || "Graduate program"}</span><span className="font-black">{result.tier}</span></div>
        <Progress value={result.score} className="h-1.5" />
        <div className="flex items-center justify-between gap-2 pt-1">
          <button type="button" onClick={(e) => { e.stopPropagation(); setShowWhy(v => !v); }} className="text-[11px] font-black text-primary hover:underline">{showWhy ? "Hide match logic" : "Why this match?"}</button>
          <div className="flex gap-1">{["Dream", "Target", "Safety"].map((value) => <button key={value} type="button" onClick={(e) => choosePlan(e, plan === value ? "" : value)} className={`rounded-full px-2 py-1 text-[9px] font-black transition ${plan === value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{value}</button>)}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-card/70 p-2.5"><p className="text-muted-foreground">Tuition</p><p className="mt-0.5 font-bold">${(Number(uni.tuition_annual_usd)||0).toLocaleString()}/yr</p></div><div className="rounded-xl bg-card/70 p-2.5"><p className="text-muted-foreground">Visa runway</p><p className="mt-0.5 font-bold">{Number(uni.post_study_visa_years)||0} yrs</p></div></div>
      </CardContent>
    </Card>
  );
}
