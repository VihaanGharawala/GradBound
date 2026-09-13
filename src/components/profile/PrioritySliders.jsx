import React from "react";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { DEFAULT_PRIORITIES, normalizePriorities, getPriorityLabel } from "@/lib/decisionEngine";

const ITEMS = [
  { key: "admissions", label: "Getting admitted", helper: "How much admission realism matters to you." },
  { key: "cost", label: "Keeping costs low", helper: "How much tuition and living costs matter to you." },
  { key: "career", label: "Career outcomes", helper: "How much salary and career signals matter to you." },
  { key: "visa", label: "Visa confidence", helper: "How much post-study visa runway matters to you." },
  { key: "lifestyle", label: "Destination fit", helper: "How much the country and lifestyle fit matters to you." },
];

export default function PrioritySliders({ value, onChange }) {
  const priorities = normalizePriorities(value || DEFAULT_PRIORITIES);

  const update = (key, next) => {
    onChange({ ...priorities, [key]: Math.max(0, Math.min(100, Number(next) || 0)) });
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <SlidersHorizontal className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Step 1 · Tell us what matters</p>
          <h2 className="mt-1 text-xl font-black">Tune your decision priorities</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Set each option independently. A higher score means it matters more to you — and every priority can be high at the same time.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-secondary/60 p-4">
        <p className="text-sm font-black">Your decision priorities</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Use the 0–100 scale to show how important each factor is. They do not need to add up to 100.</p>
      </div>

      <div className="mt-6 space-y-5">
        {ITEMS.map(({ key, label, helper }) => (
          <div key={key} className="bubble-hover rounded-2xl p-1">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold">{label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{helper}</p>
              </div>
              <span className="min-w-12 text-right text-lg font-black text-primary">{priorities[key]}</span>
            </div>
            <input aria-label={getPriorityLabel(key)} type="range" min="0" max="100" value={priorities[key]} onChange={(e) => update(key, e.target.value)} className="priority-range mt-3 w-full" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span><strong className="text-foreground">No trade-offs are forced.</strong> If everything matters a lot, you can prioritize everything.</span>
      </div>
    </section>
  );
}
