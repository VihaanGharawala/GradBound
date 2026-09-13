import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Briefcase } from "lucide-react";
import { calculateTotalWorkMonths } from "@/lib/matchScore";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const YEARS = Array.from({ length: 2032 - 1990 + 1 }, (_, i) => 1990 + i).reverse();

function MonthYearSelect({ value, onChange, label }) {
  const parts = value ? value.split("-") : ["", ""];
  const year = parts[0] || "";
  const month = parts[1] ? String(parts[1]).padStart(2, "0") : "";

  const handleChange = (newYear, newMonth) => {
    const y = newYear || year;
    const m = newMonth ? String(newMonth).padStart(2, "0") : month;
    if (y && m) {
      onChange(`${y}-${String(m).padStart(2, "0")}`);
    } else if (y) {
      onChange(`${y}-`);
    } else if (m) {
      onChange(`-${String(m).padStart(2, "0")}`);
    } else {
      onChange("");
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-500 dark:text-slate-400">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Select value={month || undefined} onValueChange={(v) => handleChange("", v)}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="z-[100] max-h-64 overflow-y-auto">
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={year || undefined} onValueChange={(v) => handleChange(v, "")}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="z-[100] max-h-64 overflow-y-auto">
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function WorkExperienceBuilder({ value, onChange }) {
  const experiences = Array.isArray(value) ? value : [];
  const totalMonths = calculateTotalWorkMonths(experiences);

  const addEntry = () => {
    onChange([...experiences, { company: "", role: "", start_date: "", end_date: "" }]);
  };

  const updateEntry = (index, field, val) => {
    const next = [...experiences];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  const removeEntry = (index) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  const isEndBeforeStart = (exp) => {
    if (!exp.start_date || !exp.end_date) return false;
    return exp.end_date < exp.start_date;
  };

  return (
    <div id="work-experience" className="space-y-4">
      {experiences.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No work experience entries yet. Add your internships or jobs below.
        </p>
      )}

      {experiences.map((exp, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-slate-50/50 dark:bg-stone-900/30 overflow-visible"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Experience #{index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              onClick={() => removeEntry(index)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400">Company Name</Label>
              <Input
                className="mt-1 text-sm"
                placeholder="e.g. Microsoft"
                value={exp.company || ""}
                onChange={(e) => updateEntry(index, "company", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400">Role / Title</Label>
              <Input
                className="mt-1 text-sm"
                placeholder="e.g. Software Engineer Intern"
                value={exp.role || ""}
                onChange={(e) => updateEntry(index, "role", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MonthYearSelect
              value={exp.start_date || ""}
              onChange={(v) => updateEntry(index, "start_date", v)}
              label="Start Date"
            />
            <MonthYearSelect
              value={exp.end_date || ""}
              onChange={(v) => updateEntry(index, "end_date", v)}
              label="End Date"
            />
          </div>
          {isEndBeforeStart(exp) && (
            <p className="text-xs text-rose-600 dark:text-rose-400" role="alert">
              End date must be the same as or later than the start date.
            </p>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addEntry}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="w-4 h-4" /> Add Work Experience
      </Button>

      {experiences.length > 0 && (
        <div className="flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 rounded-lg px-3 py-2">
          <Briefcase className="w-4 h-4" />
          Total Work Experience: {totalMonths} month{totalMonths !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}