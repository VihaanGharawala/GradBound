import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { saveProfile, DEFAULT_PROFILE } from "@/lib/profileStorage";
import StepAcademic from "@/components/profile/StepAcademic";
import StepTests from "@/components/profile/StepTests";
import StepExperience from "@/components/profile/StepExperience";
import StepPreferences from "@/components/profile/StepPreferences";

export default function EditProfileDrawer({ open, onOpenChange, profile, onSave }) {
  const [data, setData] = useState(DEFAULT_PROFILE);

  useEffect(() => {
    if (open && profile) {
      setData({ ...DEFAULT_PROFILE, ...profile });
    }
  }, [open, profile]);

  const onChange = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    saveProfile(data);
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <SheetTitle className="text-lg">Edit Profile</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
          <div className="space-y-8 py-6">
            <div>
              <h3 className="text-sm font-semibold text-teal-600 dark:text-teal-400 mb-3">
                Academic Profile
              </h3>
              <StepAcademic data={data} onChange={onChange} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-teal-600 dark:text-teal-400 mb-3">
                Standardized Tests
              </h3>
              <StepTests data={data} onChange={onChange} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-teal-600 dark:text-teal-400 mb-3">
                Experience
              </h3>
              <StepExperience data={data} onChange={onChange} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-teal-600 dark:text-teal-400 mb-3">
                Target Preferences
              </h3>
              <StepPreferences data={data} onChange={onChange} />
            </div>
          </div>
        </div>
        <SheetFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <Button onClick={handleSave} className="w-full gap-2 bg-teal-600 hover:bg-teal-700">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}