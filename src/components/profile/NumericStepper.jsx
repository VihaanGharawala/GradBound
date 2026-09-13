import React from "react";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function NumericStepper({ value, onChange, min = 0, max = 100, step = 1, placeholder, className = "", inputMode = "decimal", ariaLabel }) {
  const numeric = Number(value);
  const canDecrease = value !== "" && Number.isFinite(numeric) && numeric > min;
  const canIncrease = value === "" || !Number.isFinite(numeric) || numeric < max;
  const precision = String(step).includes(".") ? String(step).split(".")[1].length : 0;

  const adjust = (direction) => {
    const current = value === "" || !Number.isFinite(numeric) ? min : numeric;
    const next = Math.min(max, Math.max(min, current + direction * step));
    onChange(precision ? next.toFixed(precision) : String(next));
  };

  return (
    <div className={`numeric-stepper ${className}`}>
      <Input
        type="number"
        inputMode={inputMode}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        value={value ?? ""}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        className="numeric-stepper-input h-11 pr-20 text-base font-bold"
      />
      <div className="numeric-stepper-controls">
        <button type="button" tabIndex={-1} disabled={!canDecrease} onClick={() => adjust(-1)} className="numeric-stepper-button" aria-label="Decrease value"><Minus className="h-3.5 w-3.5" /></button>
        <button type="button" tabIndex={-1} disabled={!canIncrease} onClick={() => adjust(1)} className="numeric-stepper-button" aria-label="Increase value"><Plus className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}
