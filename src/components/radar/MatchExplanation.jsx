import React from "react";
import { CheckCircle2, Lightbulb, AlertTriangle } from "lucide-react";
import { explainMatch } from "@/lib/decisionEngine";

export default function MatchExplanation({ profile, uni, result }) {
  const data = explainMatch(profile, uni, result);
  const reasons = data.reasons || [];
  const gaps = data.gaps || [];
  return (
    <div className="mt-3 grid gap-2 rounded-2xl border border-primary/15 bg-primary/5 p-3 text-xs">
      <div className="flex items-center gap-2 font-black text-primary"><Lightbulb className="h-3.5 w-3.5" /> Why GradBound recommends this</div>
      {reasons.slice(0, 2).map((x, i) => <div key={`r-${i}`} className="flex items-start gap-2 text-muted-foreground"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />{x}</div>)}
      {gaps.slice(0, 2).map((x, i) => <div key={`g-${i}`} className="flex items-start gap-2 text-muted-foreground"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />{x}</div>)}
      {!reasons.length && !gaps.length && <p className="text-muted-foreground">Your current profile has been matched against the program, outcomes and decision priorities.</p>}
    </div>
  );
}
