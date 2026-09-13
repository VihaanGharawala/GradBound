import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, CircleAlert, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getDecisionBrief } from "@/lib/decisionEngine";

const COMPONENTS = [
  ["Academic", "cgpaComponent", 30],
  ["Program fit", "majorComponent", 22],
  ["Experience", "workComponent", 14],
  ["Certifications", "certificationComponent", 9],
  ["Research / projects", "researchComponent", 15],
  ["Tests", "testComponent", 10],
];

export default function DecisionAdvisor({ profile, uni, result }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const brief = useMemo(() => getDecisionBrief(profile, uni, result), [profile, uni, result]);
  const breakdown = result?.breakdown || {};

  return (
    <>
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Sparkles className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">GradBound Adviser · AI-style explanation</p>
            <h3 className="mt-1 text-xl font-black">Why this program is here</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">A plain-English explanation of how your profile, priorities and this university's signals combine.</p>
          </div>
          <div className="rounded-2xl bg-primary px-3 py-2 text-center text-primary-foreground"><div className="text-2xl font-black leading-none">{result.score}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-wider">/ 100</div></div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-card/80 p-4 border border-border"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Verdict</p><p className="mt-1 font-black">{result.tier}</p><p className="mt-1 text-xs text-muted-foreground">Based on your current profile.</p></div>
          <div className="rounded-2xl bg-card/80 p-4 border border-border"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your strongest lens</p><p className="mt-1 font-black">{brief.priority}</p><p className="mt-1 text-xs text-muted-foreground">This changes the ranking, not your application facts.</p></div>
          <div className="rounded-2xl bg-card/80 p-4 border border-border"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Program fit</p><p className="mt-1 font-black">{result.admissions >= 75 ? "Strong" : result.admissions >= 55 ? "Mixed" : "Needs work"}</p><p className="mt-1 text-xs text-muted-foreground">Admission signals are separate from cost and visa.</p></div>
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <div><p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Why it fits</p><div className="mt-2 space-y-2">{brief.reasons.map((item, i) => <div key={i} className="flex gap-2 text-sm leading-5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</div>)}</div></div>
          <div><p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">What to watch</p><div className="mt-2 space-y-2">{(brief.gaps.length ? brief.gaps : ["No major warning is showing from the current profile."]).map((item, i) => <div key={i} className="flex gap-2 text-sm leading-5"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />{item}</div>)}</div></div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => setOpen(true)} className="gap-2">Open full decision brief <ArrowRight className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={() => navigate(`/university/${uni.id}`)} className="gap-2">University details</Button>
        </div>
      </motion.section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black pr-8">Your GradBound decision brief</DialogTitle>
            <DialogDescription>{uni.name} · {uni.program_title || "Graduate program"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="rounded-2xl bg-primary/10 p-4"><p className="font-black">{brief.headline}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{brief.summary}</p></div>
            <div className="grid sm:grid-cols-4 gap-3">
              <Metric label="Decision score" value={`${result.score}/100`} />
              <Metric label="Annual tuition" value={`$${result.outcome.tuition.toLocaleString()}`} />
              <Metric label="Living / year" value={`$${result.outcome.living.toLocaleString()}`} />
              <Metric label="Visa runway" value={`${result.outcome.visa} yrs`} />
            </div>
            <div><p className="font-black">How your admission signal is built</p><div className="mt-3 space-y-3">{COMPONENTS.map(([label, key, max]) => { const value = Math.max(0, Math.min(max, Number(breakdown[key]) || 0)); return <div key={key}><div className="flex justify-between text-xs font-semibold"><span>{label}</span><span>{value}/{max}</span></div><div className="mt-1.5 h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(value / max) * 100}%` }} /></div></div>; })}</div></div>
            <div className="grid md:grid-cols-2 gap-4"><BriefList title="Why it fits" items={brief.reasons} good /><BriefList title="Watch-outs" items={brief.gaps.length ? brief.gaps : ["No major warning surfaced from the current profile."]} /></div>
            <div className="rounded-2xl border border-border p-4 text-xs leading-5 text-muted-foreground">GradBound's score is a directional decision aid based on the dataset and the profile you entered. It is not a guarantee of admission, employment, visa approval or future earnings.</div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Close</Button><Button onClick={() => { setOpen(false); navigate(`/university/${uni.id}`); }}>Open university page</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Metric({ label, value }) { return <div className="rounded-2xl border border-border bg-secondary/50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-black">{value}</p></div>; }
function BriefList({ title, items, good }) { return <div className="rounded-2xl border border-border p-4"><p className="font-black">{title}</p><div className="mt-3 space-y-2">{items.map((item, i) => <div key={i} className="flex gap-2 text-sm leading-5">{good ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />}{item}</div>)}</div></div>; }
