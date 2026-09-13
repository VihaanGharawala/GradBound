import React from "react";
import { Check, FlaskConical, Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import NumericStepper from "@/components/profile/NumericStepper";
import { STANDARDIZED_TESTS, TEST_BY_ID } from "@/lib/testCatalog";

export default function StepTests({ data, onChange }) {
  const selected = Array.isArray(data.standardized_tests) ? data.standardized_tests : [];
  const selectedIds = new Set(selected.map((test) => test.type));

  const toggleTest = (type) => {
    const exists = selectedIds.has(type);
    if (exists) {
      onChange("standardized_tests", selected.filter((test) => test.type !== type));
      return;
    }
    onChange("standardized_tests", [...selected, { type, score: "" }]);
  };

  const updateScore = (type, value) => {
    const meta = TEST_BY_ID[type];
    if (!meta) return;
    if (value === "") {
      onChange("standardized_tests", selected.map((test) => test.type === type ? { ...test, score: "" } : test));
      return;
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return;
    const clamped = Math.min(meta.max, Math.max(meta.min, numeric));
    onChange("standardized_tests", selected.map((test) => test.type === type ? { ...test, score: String(clamped) } : test));
  };

  const handleScoreChange = (type, value) => {
    const meta = TEST_BY_ID[type];
    if (!meta) return;
    if (value === "") {
      onChange("standardized_tests", selected.map((test) => test.type === type ? { ...test, score: "" } : test));
      return;
    }
    // Let users type naturally (e.g. 3 → 32 → 320) without clamping each keystroke.
    // The value is enforced against the test range on blur and before it is used in scoring.
    if (/^\d*(?:\.\d*)?$/.test(value)) {
      onChange("standardized_tests", selected.map((test) => test.type === type ? { ...test, score: value } : test));
    }
  };

  const removeTest = (type) => onChange("standardized_tests", selected.filter((test) => test.type !== type));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Label className="text-base font-black">Standardized tests</Label>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Select every test you have taken. Multiple strong scores can strengthen your admissions signal instead of forcing you to choose just one.</p>
          </div>
          <div className="hidden shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary sm:inline-flex">{selected.length} selected</div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {STANDARDIZED_TESTS.map((test) => {
            const active = selectedIds.has(test.id);
            return (
              <button
                key={test.id}
                type="button"
                onClick={() => toggleTest(test.id)}
                className={`group flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 ${active ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50"}`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {active ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black">{test.label}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{test.category} · {test.help}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selected.length > 0 ? (
        <div className="rounded-3xl border border-border bg-secondary/30 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-black"><FlaskConical className="h-4 w-4 text-primary" /> Your test stack</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {selected.map((test) => {
              const meta = TEST_BY_ID[test.type];
              return (
                <div key={test.type} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-sm font-black">{meta.label}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{meta.min}–{meta.max}</p></div>
                    <button type="button" onClick={() => removeTest(test.type)} className="rounded-lg p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive" aria-label={`Remove ${meta.label}`}><X className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Label className="block text-xs text-muted-foreground">Your score</Label>
                    <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-muted-foreground">Valid range: {meta.min}–{meta.max}</span>
                  </div>
                  <div className="mt-1.5" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) updateScore(test.type, test.score ?? ""); }}>
                    <NumericStepper
                      min={meta.min}
                      max={meta.max}
                      step={meta.step}
                      placeholder={meta.placeholder}
                      value={test.score ?? ""}
                      ariaLabel={`${meta.label} score, ${meta.min} to ${meta.max}`}
                      onChange={(value) => handleScoreChange(test.type, value)}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">Anything below or above this scale is automatically kept inside the valid range.</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
            GradBound scores each selected test against its normal range and combines the strongest signals with diminishing returns, so taking multiple relevant tests can help without letting a long test list overpower your academics.
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">No standardized tests selected yet. You can still continue and add them later.</div>
      )}
    </div>
  );
}
