import { convertCgpaTo4, calculateTotalWorkMonths } from "@/lib/matchScore";
import { getUniversityTier } from "@/lib/constants";
import { normalizeStandardizedTests, testSignal, TEST_BY_ID } from "@/lib/testCatalog";

function finite(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function inferMajorCategory(majorName) {
  if (!majorName) return "STEM";
  const m = String(majorName).toLowerCase();
  const businessKeywords = ["finance", "accounting", "business", "management", "marketing", "supply chain", "economics", "mba", "commerce", "human resource", "tourism", "hospitality", "insurance", "real estate", "entrepreneurship", "advertising", "event"];
  const humanitiesKeywords = ["psychology", "international relations", "law", "policy", "sociology", "political", "anthropology", "history", "philosophy", "literature", "arabic", "islamic", "social work", "education", "architecture", "design", "media", "art", "journalism", "film", "theater", "music", "fashion"];
  if (businessKeywords.some((k) => m.includes(k))) return "Business";
  if (humanitiesKeywords.some((k) => m.includes(k))) return "Humanities";
  return "STEM";
}

export function offersTargetMajor(uni, targetMajor) {
  if (!targetMajor || !uni || !Array.isArray(uni.offered_majors)) return false;
  const normalized = String(targetMajor).toLowerCase().trim();
  return (Array.isArray(uni.offered_majors) ? uni.offered_majors : []).some((m) => String(m).toLowerCase().trim() === normalized);
}


export function meetsMinimumRequirements(profile = {}, uni = {}) {
  try {
  if (!profile || typeof profile !== "object" || !uni || typeof uni !== "object") return false;

  const cgpa4 = Math.max(0, finite(convertCgpaTo4(profile.cgpa_value, profile.cgpa_scale)));
  const requiredCgpa = finite(uni.min_cgpa_4, 0);
  if (requiredCgpa > 0 && cgpa4 < requiredCgpa) return false;

  const tests = normalizeStandardizedTests(profile).filter((test) => test.score !== "" && Number.isFinite(Number(test.score)));
  const hasAtLeast = (type, minimum) => tests.some((test) => test.type === type && Number(test.score) >= finite(minimum));

  // Aptitude requirements are treated as alternatives when a program lists GRE and/or GMAT.
  const aptitudeRequirements = [];
  if (finite(uni.min_gre) > 0) aptitudeRequirements.push(hasAtLeast("GRE", uni.min_gre));
  if (finite(uni.min_gmat) > 0) aptitudeRequirements.push(hasAtLeast("GMAT", uni.min_gmat));
  if (aptitudeRequirements.length && !aptitudeRequirements.some(Boolean)) return false;

  // English requirements are alternatives: meeting either listed English benchmark is enough.
  const englishRequirements = [];
  if (finite(uni.min_ielts) > 0) englishRequirements.push(hasAtLeast("IELTS", uni.min_ielts));
  if (finite(uni.min_toefl) > 0) englishRequirements.push(hasAtLeast("TOEFL", uni.min_toefl));
  if (finite(uni.min_pte) > 0) englishRequirements.push(hasAtLeast("PTE", uni.min_pte));
  if (finite(uni.min_duolingo) > 0) englishRequirements.push(hasAtLeast("DUOLINGO", uni.min_duolingo));
  if (finite(uni.min_cambridge) > 0) englishRequirements.push(hasAtLeast("CAMBRIDGE", uni.min_cambridge));
  if (englishRequirements.length && !englishRequirements.some(Boolean)) return false;

  const totalMonths = calculateTotalWorkMonths(profile.work_experiences) || finite(profile.internship_months);
  if (finite(uni.min_work_months) > 0 && totalMonths < finite(uni.min_work_months)) return false;

  return true;
  } catch {
    return false;
  }
}

export function getTierFromScore(score) {
  if (score >= 78) return "Safety";
  if (score >= 55) return "Target";
  if (score >= 35) return "Reach";
  return "Unlikely";
}

export function computeCompositeScore(profile = {}, uni = {}) {
  const cgpa4 = Math.max(0, finite(convertCgpaTo4(profile.cgpa_value, profile.cgpa_scale)));
  const minCgpa = Math.max(0, finite(uni.min_cgpa_4, 0));
  const absoluteAcademic = Math.min(1, cgpa4 / 4);
  const relativeAcademic = minCgpa > 0 ? Math.min(1.18, cgpa4 / minCgpa) : absoluteAcademic;
  const academicSignal = Math.min(1, absoluteAcademic * 0.58 + Math.min(1, relativeAcademic) * 0.42);
  const uniTier = getUniversityTier(profile.undergrad_university);
  const tierMultiplier = uniTier === 1 ? 1.03 : uniTier === 3 ? 0.97 : 1;
  const cgpaComponent = Math.round(Math.min(25, academicSignal * 25 * tierMultiplier));

  const majorName = profile.major === "Other / Custom Major" ? profile.major_custom : profile.major;
  const majorExact = offersTargetMajor(uni, profile.target_major || "");
  const majorComponent = majorExact ? 20 : (inferMajorCategory(majorName) === uni.major_category ? 12 : 5);

  const totalMonths = calculateTotalWorkMonths(profile.work_experiences) || finite(profile.internship_months);
  const workComponent = Math.round(Math.min(15, (Math.max(0, totalMonths) / 36) * 15));

  const certificationCount = Math.max(0, finite(profile.certifications_count));
  const certificationComponent = Math.round(Math.min(10, (certificationCount / 5) * 10));

  const researchCount = Math.max(0, finite(profile.research_papers_count));
  const researchComponent = Math.round(Math.min(10, (researchCount / 4) * 10));

  const selectedTests = normalizeStandardizedTests(profile).filter((test) => test.score !== "" && Number.isFinite(Number(test.score)));
  const aptitudeTests = selectedTests.filter((test) => !["IELTS", "TOEFL", "PTE", "DUOLINGO", "CAMBRIDGE"].includes(test.type));
  const englishTests = selectedTests.filter((test) => ["IELTS", "TOEFL", "PTE", "DUOLINGO", "CAMBRIDGE"].includes(test.type));
  const aptitudeSignal = aptitudeTests.length ? Math.max(...aptitudeTests.map(testSignal)) : 0;
  const englishSignal = englishTests.length ? Math.max(...englishTests.map(testSignal)) : 0;
  const allSignals = selectedTests.map(testSignal).sort((a, b) => b - a);
  const stackedBonus = allSignals.slice(1, 4).reduce((sum, value, index) => sum + value * (0.08 / (index + 1)), 0);
  const testStackSignal = selectedTests.length
    ? Math.min(1, (aptitudeSignal * 0.55 + englishSignal * 0.35 + stackedBonus + (selectedTests.length > 1 ? 0.05 : 0)))
    : 0;
  const testComponent = Math.round(testStackSignal * 10);

  const score = Math.round(Math.max(0, Math.min(100,
    cgpaComponent + majorComponent + workComponent + certificationComponent + researchComponent + testComponent + 10
  )));
  return {
    score,
    tier: getTierFromScore(score),
    breakdown: {
      cgpaComponent, majorComponent, workComponent, certificationComponent, researchComponent, testComponent,
      selectedTests: selectedTests.map((test) => ({ ...test, label: TEST_BY_ID[test.type]?.label }))
    }
  };
}
export function getVerdictGaps(profile = {}, uni = {}) {
  const gaps = [];
  const selectedTests = normalizeStandardizedTests(profile);
  const cgpa4 = Math.max(0, finite(convertCgpaTo4(profile.cgpa_value, profile.cgpa_scale)));
  const minCgpa = Math.max(0.1, finite(uni.min_cgpa_4, 3));
  if (cgpa4 < minCgpa) gaps.push(`CGPA below benchmark: needs ${minCgpa.toFixed(1)}/4.0 (yours: ${cgpa4.toFixed(2)})`);
  const hasTest = (type) => selectedTests.some((test) => test.type === type && Number.isFinite(Number(test.score)));
  const scoreFor = (type) => Number(selectedTests.find((test) => test.type === type)?.score);
  const aptitudeNeeds = [];
  if (uni.min_gre) aptitudeNeeds.push(["GRE", finite(uni.min_gre)]);
  if (uni.min_gmat) aptitudeNeeds.push(["GMAT", finite(uni.min_gmat)]);
  if (aptitudeNeeds.length && !aptitudeNeeds.some(([type, minimum]) => hasTest(type) && scoreFor(type) >= minimum)) {
    gaps.push(`Aptitude test below benchmark: ${aptitudeNeeds.map(([type, minimum]) => `${type} ${minimum}+`).join(" or ")}`);
  }
  const englishNeeds = [];
  if (uni.min_ielts) englishNeeds.push(["IELTS", finite(uni.min_ielts)]);
  if (uni.min_toefl) englishNeeds.push(["TOEFL", finite(uni.min_toefl)]);
  if (uni.min_pte) englishNeeds.push(["PTE", finite(uni.min_pte)]);
  if (uni.min_duolingo) englishNeeds.push(["DUOLINGO", finite(uni.min_duolingo)]);
  if (uni.min_cambridge) englishNeeds.push(["CAMBRIDGE", finite(uni.min_cambridge)]);
  if (englishNeeds.length && !englishNeeds.some(([type, minimum]) => hasTest(type) && scoreFor(type) >= minimum)) {
    gaps.push(`English test below benchmark: ${englishNeeds.map(([type, minimum]) => `${type} ${minimum}+`).join(" or ")}`);
  }
  const totalMonths = calculateTotalWorkMonths(profile.work_experiences) || finite(profile.internship_months);
  if (uni.min_work_months && totalMonths < uni.min_work_months) gaps.push(`Work experience below minimum (needs ${uni.min_work_months} months, yours: ${totalMonths})`);
  if (finite(profile.certifications_count) < 1) gaps.push("No industry certifications are currently contributing to your practical-profile signal.");
  return gaps;
}
