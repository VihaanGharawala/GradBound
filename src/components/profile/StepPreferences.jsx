import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, BUDGET_RANGES } from "@/lib/constants";
import MasterSpecializationCombobox from "@/components/profile/MasterSpecializationCombobox";
import PrioritySliders from "@/components/profile/PrioritySliders";

export default function StepPreferences({ data, onChange }) {
  const selectedCountries = data.target_countries || [];
  const allCountriesSelected = COUNTRIES.length > 0 && selectedCountries.length === COUNTRIES.length;
  const toggleCountry = (country) => {
    const current = data.target_countries || [];
    onChange("target_countries", current.includes(country) ? current.filter((c) => c !== country) : [...current, country]);
  };
  const toggleAllCountries = (checked) => onChange("target_countries", checked ? [...COUNTRIES] : []);

  return <div className="space-y-7">
    <section className="space-y-5">
      <div><Label className="mb-1.5 block">Preferred Master's Specialization</Label><MasterSpecializationCombobox value={data.target_major} onChange={(v) => onChange("target_major", v)} /><p className="mt-1.5 text-xs text-muted-foreground">GradBound will only place universities on your radar if they offer this exact program.</p></div>
      <div><Label className="mb-1.5 block">Target Master's University (optional)</Label><Input placeholder="e.g. Massachusetts Institute of Technology" value={data.target_university || ""} onChange={(e) => onChange("target_university", e.target.value)} /></div>
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <Label>Target Countries</Label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Checkbox checked={allCountriesSelected} onCheckedChange={toggleAllCountries} aria-label="Select all countries" />
            Select all
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((country) => {
            const selected = selectedCountries.includes(country);
            return <button type="button" key={country} onClick={() => toggleCountry(country)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${selected ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border text-foreground hover:-translate-y-0.5 hover:bg-secondary"}`}>{country}</button>;
          })}
        </div>
      </div>
      <div><Label className="mb-1.5 block">Maximum Annual Tuition</Label><Select value={data.budget_range} onValueChange={(v) => onChange("budget_range", v)}><SelectTrigger className="h-11"><SelectValue placeholder="Choose your maximum tuition" /></SelectTrigger><SelectContent>{BUDGET_RANGES.map((range) => <SelectItem key={range} value={range}>{range}</SelectItem>)}</SelectContent></Select></div>
    </section>
    <PrioritySliders value={data.priorities} onChange={(v) => onChange("priorities", v)} />
  </div>;
}
