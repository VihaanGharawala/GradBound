const PROFILE_KEY = "gradbound_profile";

export function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    // Ignore storage failures; the UI can still navigate to the diagnostic.
  }
}

/** A saved profile is usable across the app only after the diagnostic has been completed. */
export function isProfileComplete(profile) {
  if (!profile || typeof profile !== "object") return false;
  const hasName = Boolean(String(profile.full_name || "").trim());
  const hasCgpa = profile.cgpa_value !== "" && Number.isFinite(Number(profile.cgpa_value));
  const hasMajor = Boolean(
    String(profile.major || "").trim() &&
    (profile.major !== "Other / Custom Major" || String(profile.major_custom || "").trim())
  );
  const hasUniversity = Boolean(
    String(profile.undergrad_university || "").trim() &&
    (profile.undergrad_university !== "Other / International University" ||
      String(profile.undergrad_university_custom || "").trim())
  );
  const hasTargetMajor = Boolean(String(profile.target_major || "").trim());
  return hasName && hasCgpa && hasMajor && hasUniversity && hasTargetMajor;
}

export const DEFAULT_PROFILE = {
  full_name: "",
  major: "",
  major_custom: "",
  cgpa_value: "",
  cgpa_scale: "4",
  undergrad_university: "",
  undergrad_university_custom: "",
  graduation_year: "",
  test_type: "none",
  gre_score: "",
  gmat_score: "",
  english_test_type: "none",
  ielts_score: "",
  toefl_score: "",
  standardized_tests: [],
  certifications_count: 0,
  work_experiences: [],
  research_papers_count: 0,
  target_major: "",
  target_university: "",
  target_countries: [],
  budget_range: "",
  priorities: { admissions: 0, cost: 0, career: 0, visa: 0, lifestyle: 0 },
};
