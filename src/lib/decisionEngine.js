import { computeCompositeScore, meetsMinimumRequirements, offersTargetMajor } from "@/lib/compositeScore";
import { normalizeStandardizedTests } from "@/lib/testCatalog";

export const DEFAULT_PRIORITIES = { admissions: 0, cost: 0, career: 0, visa: 0, lifestyle: 0 };

export function normalizePriorities(input = {}) {
  // Priorities are independent importance levels (0–100), not percentages.
  // They intentionally do not need to add up to 100.
  return Object.fromEntries(
    Object.keys(DEFAULT_PRIORITIES).map((key) => [
      key,
      Math.max(0, Math.min(100, Number(input?.[key]) || 0)),
    ])
  );
}

function getPriorityWeights(input = {}) {
  const raw = normalizePriorities(input);
  const baseline = { admissions: 0.46, cost: 0.16, career: 0.16, visa: 0.12, lifestyle: 0.10 };
  const values = Object.values(raw);
  const allZero = values.every((value) => value === 0);
  if (allZero) return baseline;

  // Each slider is an independent importance dial. Once a student moves a
  // slider, that factor gets a visibly stronger influence without forcing any
  // other slider down. A floor keeps every factor useful even at 0.
  const boosted = Object.fromEntries(Object.entries(baseline).map(([key, base]) => [
    key, base * (0.20 + 1.80 * (raw[key] / 100))
  ]));
  const total = Object.values(boosted).reduce((sum, value) => sum + value, 0) || 1;
  return Object.fromEntries(Object.entries(boosted).map(([key, value]) => [key, value / total]));
}

export function getPriorityLabel(key) {
  return ({ admissions: "Getting admitted", cost: "Keeping costs low", career: "Career outcomes", visa: "Visa confidence", lifestyle: "Destination fit" })[key] || key;
}

function finite(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function getBudgetCeiling(range) {
  if (!range || typeof range !== "string") return Infinity;
  if (/Under \$5,000/.test(range)) return 5000;
  const plus = range.match(/\$(\d[\d,]*)\+/);
  if (plus) return finite(plus[1].replace(/,/g, ""), Infinity);
  const match = range.match(/\$(\d[\d,]*)\s*-\s*\$(\d[\d,]*)/);
  if (match) return finite(match[2].replace(/,/g, ""), Infinity);
  return Infinity;
}

export function getOutcomeMetrics(uni = {}, profile) {
  const tuition = Math.max(0, finite(uni.tuition_annual_usd));
  const living = Math.max(0, finite(uni.avg_annual_living_cost_usd));
  const salary = Math.max(0, finite(uni.median_starting_salary_usd));
  const visa = Math.max(0, finite(uni.post_study_visa_years));
  const total3 = 3 * (tuition + living);
  const earnings3 = 3 * salary;
  const net3 = earnings3 - total3;
  const baseCostScore = Math.max(0, Math.min(100, 100 - ((tuition + living) / 80000) * 100));
  const budgetCeiling = getBudgetCeiling(profile?.budget_range);
  const budgetFit = !Number.isFinite(budgetCeiling) ? 100 : tuition <= budgetCeiling ? 100 : Math.max(0, 100 - ((tuition - budgetCeiling) / Math.max(10000, tuition)) * 100);
  const costScore = Math.round(baseCostScore * 0.6 + budgetFit * 0.4);
  const careerScore = Math.max(0, Math.min(100, (salary / 100000) * 100));
  const visaScore = Math.max(0, Math.min(100, (visa / 5) * 100));
  return { tuition, living, salary, visa, total3, earnings3, net3, costScore, careerScore, visaScore, budgetFit };
}

export function computeDecisionScore(profile = {}, uni = {}, priorities = DEFAULT_PRIORITIES) {
  // Scoring is a public-facing calculation boundary: malformed dataset/profile
  // records should never be allowed to crash an entire page.
  if (!profile || typeof profile !== "object" || !uni || typeof uni !== "object") {
    return { score: 0, tier: "Unlikely", admissions: 0, selectivityRisk: 100, outcome: getOutcomeMetrics({}, profile || {}), destination: 0, priorities: normalizePriorities(priorities) };
  }
  const p = normalizePriorities(priorities);
  const weights = getPriorityWeights(p);
  const base = computeCompositeScore(profile, uni);
  const b = base.breakdown || {};
  const academic = Math.max(0, Math.min(100, (finite(b.cgpaComponent) / 25) * 100));
  const major = Math.max(0, Math.min(100, (finite(b.majorComponent) / 20) * 100));
  const experience = Math.max(0, Math.min(100, (finite(b.workComponent) / 15) * 100));
  const certifications = Math.max(0, Math.min(100, (finite(b.certificationComponent) / 10) * 100));
  const research = Math.max(0, Math.min(100, (finite(b.researchComponent) / 10) * 100));
  const tests = Math.max(0, Math.min(100, (finite(b.testComponent) / 10) * 100));

  const profileEvidence = academic * 0.42 + major * 0.20 + experience * 0.13 + certifications * 0.08 + research * 0.09 + tests * 0.08;
  // Separate fit from selectivity: a strong profile can still score highly at a
  // selective university, while the acceptance rate influences the risk tier.
  const acceptance = finite(uni.acceptance_rate, 50);
  const selectivityRisk = Math.max(0, Math.min(100, 100 - acceptance));
  const admissions = Math.max(0, Math.min(100, profileEvidence));

  const outcome = getOutcomeMetrics(uni, profile);
  const targetCountries = Array.isArray(profile.target_countries) ? profile.target_countries : [];
  const countryFit = targetCountries.length ? (targetCountries.includes(uni.country) ? 100 : 45) : 70;
  const destination = outcome.visaScore * 0.35 + outcome.costScore * 0.20 + Math.min(100, finite(uni.roi_rating) * 20) * 0.20 + countryFit * 0.25;

  const score = weights.admissions * admissions + weights.cost * outcome.costScore + weights.career * outcome.careerScore + weights.visa * outcome.visaScore + weights.lifestyle * destination;
  const safeScore = Math.round(Math.max(0, Math.min(100, finite(score))));
  const tier = safeScore >= 80 && acceptance >= 35 ? "Safety" : safeScore >= 60 && acceptance >= 15 ? "Target" : safeScore >= 40 ? "Reach" : "Unlikely";
  return { ...base, score: safeScore, tier, admissions, selectivityRisk, outcome, destination, priorities: p };
}
export function safeComputeDecisionScore(profile, uni, priorities) {
  try {
    const result = computeDecisionScore(profile, uni, priorities);
    return result && Number.isFinite(Number(result.score)) ? result : null;
  } catch {
    return null;
  }
}

export function computeGradBoundScore(profile, universities) {
  if (!profile || !Array.isArray(universities)) return 0;
  const budgetCeiling = getBudgetCeiling(profile.budget_range);
  const targetCountries = Array.isArray(profile.target_countries) ? profile.target_countries : [];
  const matches = universities
    .filter((u) => !profile.target_major || offersTargetMajor(u, profile.target_major))
    .filter((u) => !targetCountries.length || targetCountries.includes(u.country))
    .filter((u) => !Number.isFinite(budgetCeiling) || Number(u.tuition_annual_usd) <= budgetCeiling)
    .filter((u) => meetsMinimumRequirements(profile, u))
    .map((u) => safeComputeDecisionScore(profile, u, profile.priorities)).filter(Boolean);
  if (!matches.length) return 0;
  const sorted = matches.sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, Math.min(5, sorted.length));
  const average = top.reduce((sum, item) => sum + item.score, 0) / top.length;
  const strongest = sorted[0].score;
  // The headline reflects both your strongest realistic option and consistency
  // across the shortlist, allowing a genuinely strong profile to reach 90–100.
  return Math.round(Math.max(0, Math.min(100, strongest * 0.68 + average * 0.32)));
}
export function explainMatch(profile, uni, result) {
  const reasons = [];
  const gaps = [];
  const b = result.breakdown || {};
  if (result.admissions >= 80) reasons.push("Your academic, program and experience signals are strongly aligned with this pathway.");
  else if (result.admissions >= 60) reasons.push("Your profile is reasonably aligned, with a few competitive factors worth improving.");
  else gaps.push("Your current admission signals are below the stronger end of this program's benchmark profile.");
  if (result.outcome.costScore >= 75) reasons.push("The estimated tuition and living cost fits relatively well with your financial priorities.");
  else gaps.push("This option is toward the more expensive end of your current budget picture.");
  if (result.outcome.careerScore >= 75) reasons.push("The dataset shows a strong starting-salary signal for this destination.");
  if (result.outcome.visaScore >= 70) reasons.push("The destination has a comparatively strong post-study visa runway in the dataset.");
  if (finite(b.certificationComponent) >= 6) reasons.push("Your certifications are contributing meaningfully to the admission signal.");
  const testCount = normalizeStandardizedTests(profile).length;
  if (testCount > 1) reasons.push(`Your ${testCount} selected standardized tests give GradBound multiple academic and language signals to compare.`);
  if (uni.min_work_months && finite(b.workComponent) < 14) gaps.push(`This program lists a ${uni.min_work_months}-month work-experience expectation.`);
  if (finite(b.certificationComponent) < 3) gaps.push("Adding relevant certifications could strengthen your practical-profile signal.");
  return { reasons: reasons.slice(0, 4), gaps: gaps.slice(0, 4) };
}

export function getDecisionBrief(profile, uni, result) {
  const explanation = explainMatch(profile, uni, result);
  const p = result.priorities || normalizePriorities(profile?.priorities);
  const highestPriority = Object.entries(p).sort((a, b) => b[1] - a[1])[0];
  return {
    ...explanation,
    headline: `${uni.name} is a ${result.tier.toLowerCase()}-level option for your current profile.`,
    summary: `GradBound gives this program ${result.score}/100 using your personal decision mix. ${getPriorityLabel(highestPriority?.[0])} currently carries the most weight at ${highestPriority?.[1] || 0}%.`,
    priority: highestPriority ? `${getPriorityLabel(highestPriority[0])} · ${highestPriority[1]}%` : "Not set",
  };
}

export function simulateImprovement(profile, universities, priorities) {
  const eligible = universities.filter((u) => !profile?.target_major || offersTargetMajor(u, profile.target_major));
  const current = eligible.map((u) => safeComputeDecisionScore(profile, u, priorities)).filter(Boolean);
  const currentTop = current.sort((a, b) => b.score - a.score).slice(0, 5);
  const currentAvg = currentTop.length ? Math.round(currentTop.reduce((sum, x) => sum + x.score, 0) / currentTop.length) : 0;
  const currentTests = normalizeStandardizedTests(profile);
  const withTest = { ...profile, standardized_tests: currentTests.length ? currentTests.map((test, index) => { if (index !== 0) return test; const bump = test.type === "GRE" ? 10 : test.type === "GMAT" ? 20 : 5; const max = test.type === "GRE" ? 340 : test.type === "GMAT" ? 805 : 9999; return { ...test, score: String(Math.min(Number(test.score || 0) + bump, max)) }; }) : profile.standardized_tests };
  const withBudget = { ...profile, budget_range: nextBudget(profile.budget_range) };
  const withExperience = { ...profile, work_experiences: [...(profile.work_experiences || []), { start_date: "2025-01", end_date: "2025-12" }] };
  const withCertification = { ...profile, certifications_count: Math.min(10, finite(profile.certifications_count) + 1) };
  const scenarios = [
    { key: "test", title: currentTests.length > 1 ? "Raise your strongest test" : currentTests[0]?.type === "GMAT" ? "+20 GMAT points" : currentTests[0]?.type === "GRE" ? "+10 GRE points" : "Add a stronger test signal", detail: "A stronger score can improve the academic evidence GradBound uses for your shortlist.", action: currentTests.length ? "Raise your strongest score" : "Add a standardized test", profile: withTest },
    { key: "budget", title: "Widen your budget", detail: "A slightly wider budget can unlock more matches while keeping cheaper options available.", action: "Review my budget", profile: withBudget },
    { key: "experience", title: "Add practical experience", detail: "More relevant experience can strengthen programs that care about work readiness.", action: "Add experience", profile: withExperience },
    { key: "certification", title: "Add one relevant certification", detail: "A relevant credential can give your practical profile another piece of evidence.", action: "Add a certification", profile: withCertification },
  ];
  return scenarios.map((scenario) => {
    const scores = eligible.map((u) => safeComputeDecisionScore(scenario.profile, u, priorities)).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 5);
    const projected = scores.length ? Math.round(scores.reduce((sum, x) => sum + x.score, 0) / scores.length) : 0;
    return { ...scenario, current: currentAvg, projected, gain: Math.max(0, projected - currentAvg), impact: projected > currentAvg ? `Potentially +${Math.max(0, projected - currentAvg)} points to your average top-match signal` : "May help even if the overall score stays similar" };
  });
}

export function nextBudget(range) {
  const ranges = ["Under $5,000/yr", "$5,000 - $10,000/yr", "$10,000 - $15,000/yr", "$15,000 - $20,000/yr", "$20,000 - $30,000/yr", "$30,000 - $40,000/yr", "$40,000 - $50,000/yr", "$50,000+/yr"];
  const index = Math.max(0, ranges.indexOf(range));
  return ranges[Math.min(ranges.length - 1, index + 1)];
}
