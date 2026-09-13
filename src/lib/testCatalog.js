export const STANDARDIZED_TESTS = [
  { id: "GRE", label: "GRE", category: "Aptitude", min: 260, max: 340, step: 1, placeholder: "320", help: "Graduate admissions test" },
  { id: "GMAT", label: "GMAT", category: "Business", min: 205, max: 805, step: 5, placeholder: "675", help: "Business-school admissions" },
  { id: "LSAT", label: "LSAT", category: "Law", min: 120, max: 180, step: 1, placeholder: "165", help: "Law-school admissions" },
  { id: "MCAT", label: "MCAT", category: "Medicine", min: 472, max: 528, step: 1, placeholder: "515", help: "Medical-school admissions" },
  { id: "DAT", label: "DAT", category: "Dentistry", min: 1, max: 30, step: 1, placeholder: "22", help: "Dental-school admissions" },
  { id: "SAT", label: "SAT", category: "General", min: 400, max: 1600, step: 10, placeholder: "1400", help: "Academic aptitude signal" },
  { id: "ACT", label: "ACT", category: "General", min: 1, max: 36, step: 1, placeholder: "30", help: "Academic aptitude signal" },
  { id: "IELTS", label: "IELTS", category: "English", min: 0, max: 9, step: 0.5, placeholder: "7.5", help: "English proficiency" },
  { id: "TOEFL", label: "TOEFL iBT", category: "English", min: 0, max: 120, step: 1, placeholder: "100", help: "English proficiency" },
  { id: "PTE", label: "PTE Academic", category: "English", min: 10, max: 90, step: 1, placeholder: "72", help: "English proficiency" },
  { id: "DUOLINGO", label: "Duolingo English Test", category: "English", min: 10, max: 160, step: 5, placeholder: "125", help: "English proficiency" },
  { id: "CAMBRIDGE", label: "Cambridge English", category: "English", min: 80, max: 230, step: 1, placeholder: "190", help: "C1/C2 English proficiency" },
];

export const TEST_BY_ID = Object.fromEntries(STANDARDIZED_TESTS.map((test) => [test.id, test]));

export function normalizeStandardizedTests(profile = {}) {
  if (Array.isArray(profile.standardized_tests)) {
    return profile.standardized_tests
      .filter((item) => item?.type && TEST_BY_ID[item.type])
      .map((item) => ({ ...item, score: item.score === "" || item.score == null ? "" : clampTestScore(item.type, item.score) }));
  }

  const legacy = [];
  if (profile.test_type === "GRE" && profile.gre_score !== "") legacy.push({ type: "GRE", score: profile.gre_score });
  if (profile.test_type === "GMAT" && profile.gmat_score !== "") legacy.push({ type: "GMAT", score: profile.gmat_score });
  if (profile.english_test_type === "IELTS" && profile.ielts_score !== "") legacy.push({ type: "IELTS", score: profile.ielts_score });
  if (profile.english_test_type === "TOEFL" && profile.toefl_score !== "") legacy.push({ type: "TOEFL", score: profile.toefl_score });
  return legacy;
}

export function clampTestScore(type, value) {
  const meta = TEST_BY_ID[type];
  const score = Number(value);
  if (!meta || !Number.isFinite(score)) return "";
  return String(Math.min(meta.max, Math.max(meta.min, score)));
}

export function testSignal(test) {
  const meta = TEST_BY_ID[test?.type];
  if (!meta) return 0;
  const score = Number(clampTestScore(test.type, test.score));
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(1, (score - meta.min) / Math.max(1, meta.max - meta.min)));
}

export function getTestCategory(type) {
  return TEST_BY_ID[type]?.category || "Other";
}
