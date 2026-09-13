import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import WizardProgress from "@/components/profile/WizardProgress";
import StepAcademic from "@/components/profile/StepAcademic";
import StepTests from "@/components/profile/StepTests";
import StepExperience from "@/components/profile/StepExperience";
import StepPreferences from "@/components/profile/StepPreferences";
import { DEFAULT_PROFILE, loadProfile, saveProfile } from "@/lib/profileStorage";
import { normalizeStandardizedTests } from "@/lib/testCatalog";

const TOTAL_STEPS = 4;

export default function ProfileDiagnostic() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedStep = Math.min(TOTAL_STEPS, Math.max(1, Number(searchParams.get("step") || 1)));
  const focusField = searchParams.get("focus") || "";
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [requestedStep]);

  const [step, setStep] = useState(requestedStep);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState(DEFAULT_PROFILE);
  const [error, setError] = useState("");

  useEffect(() => {
    setStep(requestedStep);
  }, [requestedStep]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [step]);

  useEffect(() => {
    const existing = loadProfile();
    if (existing) {
      setData({ ...DEFAULT_PROFILE, ...existing, standardized_tests: normalizeStandardizedTests(existing) });
    }
  }, []);

  const onChange = (field, value) => setData((prev) => {
    const next = { ...prev, [field]: value };
    // Keep diagnostics persistent as the user enters them, so Radar always
    // sees the latest completed fields even if they leave the wizard early.
    saveProfile(next);
    return next;
  });

  const validateStep = () => {
    if (step === 1) {
      if (!String(data.full_name || "").trim()) return "Please enter your full name.";
      if (!String(data.major || "").trim()) return "Please select your undergraduate major.";
      if (data.major === "Other / Custom Major" && !String(data.major_custom || "").trim()) {
        return "Please enter your custom major.";
      }
      if (data.cgpa_value === "" || !Number.isFinite(Number(data.cgpa_value))) {
        return "Please enter your GPA / CGPA.";
      }
      if (!String(data.undergrad_university || "").trim()) return "Please select your undergraduate university.";
      if (
        data.undergrad_university === "Other / International University" &&
        !String(data.undergrad_university_custom || "").trim()
      ) {
        return "Please enter your university name.";
      }
    }
    if (step === 4 && !String(data.target_major || "").trim()) {
      return "Please select your preferred Master's specialization.";
    }
    return "";
  };

  const handleNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    const saved = saveProfile(data);
    if (!saved) {
      setError("We couldn't save your profile. Please check your browser storage settings and try again.");
      return;
    }
    setError("");
    navigate("/profile");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Diagnostic</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Tell us about your academic background so we can find the right-fit universities for
          you.
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-6 space-y-6">
          <WizardProgress step={step} totalSteps={TOTAL_STEPS} />

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
            >
              {error}
            </div>
          )}

          <div className="overflow-visible">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {step === 1 && <StepAcademic data={data} onChange={onChange} />}
                {step === 2 && <StepTests data={data} onChange={onChange} />}
                {step === 3 && <StepExperience data={data} onChange={onChange} focusField={focusField} />}
                {step === 4 && <StepPreferences data={data} onChange={onChange} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button onClick={handleNext} className="gap-1 bg-teal-600 hover:bg-teal-700">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} className="gap-1 bg-teal-600 hover:bg-teal-700">
                <Sparkles className="w-4 h-4" /> Save & View Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}