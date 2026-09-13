import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import NumericStepper from "@/components/profile/NumericStepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OTHER_MAJOR, OTHER_UNIVERSITY } from "@/lib/constants";
import MajorCombobox from "@/components/profile/MajorCombobox";
import UniversityCombobox from "@/components/profile/UniversityCombobox";

export default function StepAcademic({ data, onChange }) {
  const cgpaMax = data.cgpa_scale === "10" ? 10 : 4;

  const handleCgpaChange = (e) => {
    let val = e.target.value;
    // Allow only decimals up to 2 decimal places
    if (val === "" || /^\d{0,2}(\.\d{0,2})?$/.test(val)) {
      const num = parseFloat(val);
      if (val !== "" && !isNaN(num) && num > cgpaMax) {
        val = String(cgpaMax);
      }
      if (val !== "" && !isNaN(num) && num < 0) {
        val = "0";
      }
      onChange("cgpa_value", val);
    }
  };

  const handleGradYearChange = (e) => {
    let val = e.target.value;
    // 4-digit numeric only, range 1990-2032
    if (val === "" || /^\d{0,4}$/.test(val)) {
      const num = parseInt(val);
      if (val.length === 4 && !isNaN(num)) {
        if (num < 1990) val = "1990";
        else if (num > 2032) val = "2032";
      }
      onChange("graduation_year", val);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-1.5 block">
          Full Name <span className="text-rose-500">*</span>
        </Label>
        <Input
          placeholder="Enter your full name"
          value={data.full_name || ""}
          onChange={(e) => onChange("full_name", e.target.value)}
        />
      </div>

      <div>
        <Label className="mb-1.5 block">Undergraduate Major</Label>
        <MajorCombobox value={data.major} onChange={(v) => onChange("major", v)} />
        {data.major === OTHER_MAJOR && (
          <Input
            className="mt-3"
            placeholder="Enter your exact degree title"
            value={data.major_custom || ""}
            onChange={(e) => onChange("major_custom", e.target.value)}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">CGPA / GPA</Label>
          <NumericStepper
            min={0}
            max={cgpaMax}
            step={0.01}
            placeholder={`e.g. ${cgpaMax === 4 ? "3.50" : "8.20"}`}
            value={data.cgpa_value}
            onChange={(value) => handleCgpaChange({ target: { value } })}
            ariaLabel="CGPA or GPA"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Scale</Label>
          <Select
            value={data.cgpa_scale}
            onValueChange={(v) => {
              onChange("cgpa_scale", v);
              // Clamp existing CGPA to new max
              const num = parseFloat(data.cgpa_value);
              const newMax = v === "10" ? 10 : 4;
              if (!isNaN(num) && num > newMax) {
                onChange("cgpa_value", String(newMax));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4.0 Scale</SelectItem>
              <SelectItem value="10">10.0 Scale</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block">Undergraduate University</Label>
        <UniversityCombobox
          value={data.undergrad_university}
          onChange={(v) => onChange("undergrad_university", v)}
        />
        {data.undergrad_university === OTHER_UNIVERSITY && (
          <Input
            className="mt-3"
            placeholder="Enter your university name"
            value={data.undergrad_university_custom || ""}
            onChange={(e) => onChange("undergrad_university_custom", e.target.value)}
          />
        )}
      </div>

      <div>
        <Label className="mb-1.5 block">Graduation Year</Label>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="e.g. 2026"
          value={data.graduation_year}
          onChange={handleGradYearChange}
          maxLength={4}
        />
      </div>
    </div>
  );
}