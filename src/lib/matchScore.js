import { getMajorCategory, getUniversityTier } from "@/lib/constants";

export function convertCgpaTo4(value, scale) {
  const v = parseFloat(value) || 0;
  if (scale === "10") return (v / 10) * 4;
  return v;
}

/** Calculate total months from a work_experiences array (each has start_date, end_date in "YYYY-MM" format) */
export function calculateTotalWorkMonths(workExperiences) {
  if (!Array.isArray(workExperiences) || workExperiences.length === 0) return 0;
  let total = 0;
  for (const exp of workExperiences) {
    if (!exp.start_date || !exp.end_date) continue;
    const [sy, sm] = exp.start_date.split("-").map(Number);
    const [ey, em] = exp.end_date.split("-").map(Number);
    if (!sy || !sm || !ey || !em) continue;
    const months = (ey - sy) * 12 + (em - sm) + 1; // inclusive of both start and end month
    if (months > 0) total += months;
  }
  return total;
}

/** Work experience score: 0=0%, 1-6=+5%, 7-18=+10%, 19+=+15% (out of 15 max) */
export function getWorkExperienceScore(totalMonths) {
  if (totalMonths <= 0) return 0;
  if (totalMonths <= 6) return 5;
  if (totalMonths <= 18) return 10;
  return 15;
}

/** Research/projects boost: +5% per paper/project, capped at 20% */
export function getResearchBoost(researchPapersCount) {
  const count = parseInt(researchPapersCount) || 0;
  return Math.min(count * 5, 20);
}

export function computeMatch(profile, uni) {
  const cgpa4 = convertCgpaTo4(profile.cgpa_value, profile.cgpa_scale);
  const minCgpa = uni.min_cgpa_4 || 3.0;
  const cgpaRatio = minCgpa ? cgpa4 / minCgpa : 1;
  const uniTier = getUniversityTier(profile.undergrad_university);
  const tierMultiplier = uniTier === 1 ? 1.1 : uniTier === 3 ? 0.95 : 1.0;
  const cgpaComponent = Math.min(40, Math.max(0, Math.min(1, cgpaRatio)) * 40 * tierMultiplier);

  const sameMajor = profile.target_major && uni.specific_major === profile.target_major;
  const sameCategory =
    profile.target_major && getMajorCategory(profile.target_major) === uni.major_category;
  let majorComponent;
  if (sameMajor) majorComponent = 30;
  else if (sameCategory) majorComponent = 16;
  else majorComponent = 6;

  // Work experience: dynamic scoring based on total accumulated months
  // Falls back to legacy internship_months field for older profiles
  const workExpMonths = calculateTotalWorkMonths(profile.work_experiences);
  const totalWorkMonths = workExpMonths > 0
    ? workExpMonths
    : (parseInt(profile.internship_months) || 0);
  const workScore = getWorkExperienceScore(totalWorkMonths);

  // Certifications still contribute a smaller portion
  const certScore = Math.min((profile.certifications_count || 0) / 3, 1) * 0.5;
  let expComponent = workScore + certScore * 5;
  if (uni.prefers_research && (profile.research_papers_count || 0) > 0) {
    expComponent = Math.min(20, expComponent + 2);
  }
  expComponent = Math.min(20, expComponent);

  let greGmatRatio = 1;
  if (uni.min_gre) {
    greGmatRatio =
      profile.test_type === "GRE" && profile.gre_score
        ? Math.min(profile.gre_score / uni.min_gre, 1)
        : 0.55;
  } else if (uni.min_gmat) {
    greGmatRatio =
      profile.test_type === "GMAT" && profile.gmat_score
        ? Math.min(profile.gmat_score / uni.min_gmat, 1)
        : 0.55;
  }

  let englishRatio = 1;
  if (uni.min_ielts) {
    englishRatio = profile.ielts_score
      ? Math.min(profile.ielts_score / uni.min_ielts, 1)
      : 0.6;
  } else if (uni.min_toefl) {
    englishRatio = profile.toefl_score
      ? Math.min(profile.toefl_score / uni.min_toefl, 1)
      : 0.6;
  }

  const testComponent = ((greGmatRatio + englishRatio) / 2) * 15;

  // Research & projects boost: +5% per paper/project, capped at 20%
  const researchBoost = getResearchBoost(profile.research_papers_count);

  const rawScore = cgpaComponent + majorComponent + expComponent + testComponent + researchBoost;
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  let tier;
  if (score >= 78) tier = "Safety";
  else if (score >= 55) tier = "Target";
  else if (score >= 35) tier = "Reach";
  else tier = "Unlikely";

  const gaps = [];
  if (cgpa4 < minCgpa) {
    gaps.push(`CGPA below benchmark: needs ${minCgpa.toFixed(2)}/4.0 (yours: ${cgpa4.toFixed(2)})`);
  }
  if (uni.min_gre && !(profile.test_type === "GRE" && profile.gre_score >= uni.min_gre)) {
    gaps.push(`Requires GRE score of ${uni.min_gre}+`);
  }
  if (uni.min_gmat && !(profile.test_type === "GMAT" && profile.gmat_score >= uni.min_gmat)) {
    gaps.push(`Requires GMAT score of ${uni.min_gmat}+`);
  }
  if (uni.min_ielts && !(profile.ielts_score >= uni.min_ielts)) {
    gaps.push(`Requires IELTS score of ${uni.min_ielts}+`);
  }
  if (uni.min_work_months && totalWorkMonths < uni.min_work_months) {
    gaps.push(`Requires at least ${uni.min_work_months} months of work/internship experience`);
  }
  if (!sameMajor) {
    gaps.push(
      sameCategory
        ? `Related field, not an exact match for ${profile.target_major || "your target major"}`
        : `Missing major prerequisite match for ${profile.target_major || "your target major"}`
    );
  }

  return {
    score,
    tier,
    gaps,
    breakdown: { cgpaComponent, majorComponent, expComponent, testComponent, researchBoost },
  };
}