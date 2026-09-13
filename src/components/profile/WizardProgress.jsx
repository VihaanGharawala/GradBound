import React from "react";
import { Progress } from "@/components/ui/progress";

const STEP_LABELS = ["Personal & Academic", "Standardized Tests", "Experience", "Target Preferences"];

export default function WizardProgress({ step, totalSteps }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        <span className="font-medium text-teal-600 dark:text-teal-400">
          Step {step} of {totalSteps}: {STEP_LABELS[step - 1]}
        </span>
        <span>{Math.round((step / totalSteps) * 100)}%</span>
      </div>
      <Progress value={(step / totalSteps) * 100} className="h-2" />
    </div>
  );
}