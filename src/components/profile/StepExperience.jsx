import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import WorkExperienceBuilder from "@/components/profile/WorkExperienceBuilder";

export default function StepExperience({ data, onChange, focusField }) {
  useEffect(() => {
    if (!focusField) return;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(focusField);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
        el.select?.();
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [focusField]);
  const handleCertChange = (e) => {
    let val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      const num = parseInt(val);
      if (!isNaN(num) && num < 0) val = "0";
      onChange("certifications_count", val);
    }
  };

  const handleResearchChange = (e) => {
    let val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      const num = parseInt(val);
      if (!isNaN(num) && num < 0) val = "0";
      onChange("research_papers_count", val);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-1.5 block">Industry Certifications</Label>
        <Input
          id="certifications_count"
          type="text"
          inputMode="numeric"
          min="0"
          placeholder="Number of certifications"
          value={data.certifications_count ?? ""}
          onFocus={(e) => { if (String(e.target.value) === "0") { onChange("certifications_count", ""); } }}
          onChange={handleCertChange}
        />
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Relevant certifications now contribute to your admission signal, up to 9 points.</p>
      </div>

      <div>
        <Label className="mb-2 block">Work Experience</Label>
        <WorkExperienceBuilder
          value={data.work_experiences}
          onChange={(v) => onChange("work_experiences", v)}
        />
      </div>

      <div>
        <Label className="mb-1.5 block">
          Number of Published Research Papers or Technical Projects
        </Label>
        <Input
          id="research_papers_count"
          type="text"
          inputMode="numeric"
          min="0"
          placeholder="e.g. 2"
          value={data.research_papers_count ?? ""}
          onFocus={(e) => { if (String(e.target.value) === "0") { onChange("research_papers_count", ""); } }}
          onChange={handleResearchChange}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Each paper or project adds a +5% boost to your match score (capped at 20%).
        </p>
      </div>
    </div>
  );
}