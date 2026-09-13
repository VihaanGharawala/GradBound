import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, Target, Flame, ArrowRight, GitCompare, MapPin, WalletCards, BriefcaseBusiness, X, Radar as RadarIcon, FlaskConical, Globe2 } from "lucide-react";
import { getAllUniversities } from "@/lib/universityDataset";
import { isProfileComplete, loadProfile, saveProfile } from "@/lib/profileStorage";
import { offersTargetMajor, meetsMinimumRequirements } from "@/lib/compositeScore";
import { normalizeStandardizedTests, testSignal } from "@/lib/testCatalog";
import { safeComputeDecisionScore, getBudgetCeiling, normalizePriorities, computeGradBoundScore } from "@/lib/decisionEngine";
import PrioritySliders from "@/components/profile/PrioritySliders";
import ScoreRing from "@/components/radar/ScoreRing";
import MatchExplanation from "@/components/radar/MatchExplanation";
import RiskTierSection from "@/components/radar/RiskTierSection";
import { toggleCompare } from "@/components/CompareTray";

export default function AdmissionsRadar() {
  const [profile, setProfile] = useState(undefined);
  const [priorities, setPriorities] = useState(null);
  const [compareIds, setCompareIds] = useState(() => { try { const parsed = JSON.parse(localStorage.getItem("gradbound_compare") || "[]"); return Array.isArray(parsed) ? parsed.slice(0, 3) : []; } catch { return []; } });
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [planner, setPlanner] = useState({});
  useEffect(() => { const sync = () => { try { setPlanner(JSON.parse(localStorage.getItem("gradbound_plan") || "{}")); } catch { setPlanner({}); } }; sync(); window.addEventListener("gradbound-plan", sync); return () => window.removeEventListener("gradbound-plan", sync); }, []);

  useEffect(() => { const p = loadProfile(); setProfile(p); setPriorities(p?.priorities || null); }, []);

  const updatePriorities = (next) => {
    setPriorities(next);
    if (profile) { const updated = { ...profile, priorities: next }; saveProfile(updated); setProfile(updated); }
  };

  const universities = getAllUniversities();
  const activePriorities = useMemo(() => normalizePriorities(priorities || profile?.priorities), [priorities, profile]);
  const budgetCeiling = getBudgetCeiling(profile?.budget_range);
  const comparisonUnis = useMemo(() => universities.filter((u) => compareIds.includes(u.id)), [universities, compareIds]);
  const baselinePriorities = { admissions: 0, cost: 0, career: 0, visa: 0, lifestyle: 0 };
  const matched = useMemo(() => {
    if (!isProfileComplete(profile) || !profile?.target_major) return [];
    return universities
      .filter((u) => offersTargetMajor(u, profile.target_major))
      .filter((u) => meetsMinimumRequirements(profile, u))
      .filter((u) => !Array.isArray(profile.target_countries) || profile.target_countries.length === 0 || profile.target_countries.includes(u.country))
      .filter((u) => !Number.isFinite(budgetCeiling) || Number(u.tuition_annual_usd) <= budgetCeiling)
      .map((uni) => {
        try { return { uni, result: safeComputeDecisionScore(profile, uni, activePriorities) }; }
        catch { return null; }
      })
      .filter(({ result }) => result)
      .filter(({ result }) => Number.isFinite(Number(result?.score)))
      .sort((a, b) => b.result.score - a.result.score);
  }, [profile, activePriorities, universities, budgetCeiling]);
  const priorityImpact = useMemo(() => {
    if (!profile) return [];
    return matched.slice(0, 4).map(({ uni, result }) => {
      const baselineResult = safeComputeDecisionScore(profile, uni, baselinePriorities);
      const baseline = baselineResult?.score ?? result.score;
      return { uni, current: result.score, baseline, delta: result.score - baseline };
    });
  }, [matched, profile]);

  if (profile === undefined) return <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-primary" /></div>;
  if (!isProfileComplete(profile)) return <EmptyState />;
  if (!profile.target_major) return <EmptyState title="Choose a target specialization." text="Your radar needs a preferred Master's program so it can show only relevant universities." button="Update profile" />;

  const grouped = { Safety: [], Target: [], Reach: [], Unlikely: [] };
  matched.forEach((item) => grouped[item.result.tier]?.push(item));
  const top = matched.slice(0, 5);
  const avg = top.length ? Math.round(top.reduce((sum, x) => sum + x.result.score, 0) / top.length) : 0;
  const gradScore = (() => { try { return computeGradBoundScore(profile, universities); } catch { return 0; } })();
  const selectedTop = top.slice(0, 3);
  const scoreBreakdown = top[0] ? [
    ["Academic fit", Math.round((Number(top[0].result.breakdown?.cgpaComponent || 0) / 25) * 100)],
    ["Program fit", Math.round((Number(top[0].result.breakdown?.majorComponent || 0) / 20) * 100)],
    ["Experience", Math.round((Number(top[0].result.breakdown?.workComponent || 0) / 15) * 100)],
    ["Research", Math.round((Number(top[0].result.breakdown?.researchComponent || 0) / 10) * 100)],
    ["Tests", Math.round((Number(top[0].result.breakdown?.testComponent || 0) / 10) * 100)],
  ] : [];
  const plannerCounts = ["Dream", "Target", "Safety"].map((tier) => ({ tier, count: matched.filter(({ uni }) => planner[uni.id] === tier).length }));
  const plannerTotal = plannerCounts.reduce((a, x) => a + x.count, 0);
  const radarValues = [
    { label: "Academics", value: Math.round(Math.min(100, (Number(top[0]?.result?.breakdown?.cgpaComponent || 0) / 30) * 100)) },
    { label: "Tests", value: Math.round(Math.min(100, (Number(top[0]?.result?.breakdown?.testComponent || 0) / 10) * 100)) },
    { label: "Experience", value: Math.round(Math.min(100, (Number(top[0]?.result?.breakdown?.workComponent || 0) / 14) * 100)) },
    { label: "Research", value: Math.round(Math.min(100, (Number(top[0]?.result?.breakdown?.researchComponent || 0) / 15) * 100)) },
    { label: "Program fit", value: Math.round(Number(top[0]?.result?.admissions || 0)) },
  ];
  const compare = (id) => {
    const next = toggleCompare(id);
    setCompareIds(next);
    if (next.length < 3) setComparisonOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Personalized admissions intelligence</p><h1 className="mt-2 text-4xl font-black tracking-tight">Your Admissions Radar</h1><p className="mt-2 text-muted-foreground">Only universities that teach <strong className="text-foreground">{profile.target_major}</strong> are shown.</p></div>
        <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/profile">Edit profile</Link></Button></div>
      </div>

      <div>
        <PrioritySliders value={priorities} onChange={updatePriorities} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Sparkles} label="GradBound Score" value={`${gradScore}/100`} sub="Overall profile signal" />
        <Stat icon={Target} label="Top match" value={top[0]?.result.score ?? 0} sub={top[0]?.uni.name || "No match yet"} />
        <Stat icon={ShieldCheck} label="Safety options" value={grouped.Safety.length} sub="Within selected budget" />
        <Stat icon={Flame} label="Top-5 average" value={`${avg}/100`} sub={`${matched.length} relevant programs`} />
      </div>

      <section className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <div className="bubble-hover rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-4"><ScoreRing score={gradScore} size={112} /><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Profile signal</p><h2 className="mt-1 text-xl font-black">Your score, explained.</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">A stronger score comes from the evidence that matters most for your current shortlist.</p></div></div>
          <div className="mt-5 space-y-2.5">{scoreBreakdown.map(([label,value]) => <div key={label}><div className="flex justify-between text-xs font-bold"><span>{label}</span><span>{value}/100</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary"><motion.div initial={{width:0}} animate={{width:`${value}%`}} transition={{duration:.65}} className="h-full rounded-full bg-primary" /></div></div>)}</div>
        </div>
        <div className="bubble-hover rounded-3xl border border-border bg-card p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">What changed?</p><h2 className="mt-1 text-xl font-black">Your priorities are reshaping the shortlist.</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Compared with the neutral baseline, see which current matches move up or down when your importance sliders are applied.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">{priorityImpact.map(({uni,current,baseline,delta}) => <div key={uni.id} className="rounded-2xl border border-border bg-secondary/30 p-3"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-black">{uni.name}</p><span className={`rounded-full px-2 py-1 text-[10px] font-black ${delta > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : delta < 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-300" : "bg-card text-muted-foreground"}`}>{delta > 0 ? `+${delta}` : delta}</span></div><p className="mt-1 text-[11px] text-muted-foreground">Baseline {baseline} → current {current}</p></div>)}</div>
        </div>
      </section>

      <section className="bubble-hover rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Shortlist planner</p><h2 className="mt-1 text-2xl font-black">Build your Dream → Target → Safety mix.</h2><p className="mt-1 text-sm text-muted-foreground">Use the pills on any Radar card to classify your finalists. GradBound will flag an unbalanced shortlist.</p></div><div className="flex gap-2">{plannerCounts.map(({tier,count})=><span key={tier} className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-black">{tier} · {count}</span>)}</div></div>
        {plannerTotal > 0 && plannerCounts.filter(x => x.tier !== "Safety").reduce((a,x)=>a+x.count,0) > 0 && plannerCounts.find(x=>x.tier === "Safety")?.count === 0 && <div className="mt-4 rounded-2xl border border-amber-300/40 bg-amber-50/60 p-3 text-xs font-semibold text-amber-900 dark:bg-amber-400/5 dark:text-amber-100">⚠️ Your shortlist is reach-heavy. Add at least one Safety option before you finalize your list.</div>}
        <div className="mt-5 grid gap-3 md:grid-cols-3">{["Dream","Target","Safety"].map((tier)=><div key={tier} className="min-h-[90px] rounded-2xl border border-dashed border-border bg-secondary/20 p-3"><p className="text-xs font-black">{tier}</p><div className="mt-2 space-y-1">{matched.filter(({uni})=>planner[uni.id]===tier).slice(0,3).map(({uni,result})=><p key={uni.id} className="truncate text-[11px] font-semibold text-muted-foreground">{uni.name} · {result.score}</p>)}{!matched.some(({uni})=>planner[uni.id]===tier) && <p className="text-[11px] text-muted-foreground">Nothing pinned yet.</p>}</div></div>)}</div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
        <div className="bubble-hover rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><RadarIcon className="h-5 w-5" /></div>
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Live profile radar</p><h2 className="mt-1 text-xl font-black">What is driving your match?</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">A live view of the strongest signals behind your current top match.</p></div>
          </div>
          <div className="mt-4">{top[0] ? <RadarVisual values={radarValues} /> : <div className="grid h-64 place-items-center rounded-2xl bg-secondary/30 text-sm text-muted-foreground">Your radar will appear after GradBound finds a matching program.</div>}</div>
        </div>
        <div className="bubble-hover rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><FlaskConical className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Test advantage</p><h2 className="mt-1 text-xl font-black">Your selected tests now stack intelligently</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">GradBound uses the strongest relevant score first, then adds smaller bonuses for additional credible signals.</p></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{normalizeStandardizedTests(profile).length ? normalizeStandardizedTests(profile).map((test) => <div key={test.type} className="bubble-hover rounded-2xl border border-border bg-secondary/35 p-3"><div className="flex items-center justify-between gap-2"><span className="text-sm font-black">{test.type}</span><span className="text-sm font-black text-primary">{test.score || "—"}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.round(testSignal(test) * 100)}%` }} /></div></div>) : <div className="sm:col-span-2 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">No standardized tests are selected yet. Add them in your profile to make the admissions signal more precise.</div>}</div>
        </div>
      </section>

      {top[0] && <MatchExplanation profile={profile} uni={top[0].uni} result={top[0].result} />}

      {matched.length === 0 && (
        <div className="rounded-3xl border border-amber-300/50 bg-amber-50/70 p-5 text-sm leading-6 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/5 dark:text-amber-100">
          <p className="font-black">No exact matches under the current filters.</p>
          <p className="mt-1">Try increasing your tuition ceiling or selecting a broader specialization. Your profile and priorities are still saved.</p>
        </div>
      )}

      <section className="bubble-hover rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Step 3 · Make a shortlist</p>
            <h2 className="mt-1 text-2xl font-black">Compare 3 colleges</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose up to three finalists. Once three are selected, open the side-by-side comparison here.</p>
          </div>
          <Button
            variant={compareIds.length === 3 ? "default" : "outline"}
            disabled={compareIds.length !== 3}
            onClick={() => setComparisonOpen(true)}
            className="gap-2 shrink-0"
          >
            <GitCompare className="h-4 w-4" /> Compare 3 colleges {compareIds.length > 0 ? `· ${compareIds.length}/3` : ""}
          </Button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {selectedTop.map(({uni,result}) => (
            <div key={uni.id} className="bubble-hover flex h-full min-h-[156px] flex-col overflow-hidden rounded-2xl border border-border">
              <div className="flex h-full flex-col p-4">
                <p className="text-xs font-bold text-muted-foreground">{result.tier} · {result.score}/100</p>
                <p className="mt-1 font-black leading-5">{uni.name}</p>
                <Button size="sm" variant={compareIds.includes(uni.id) ? "default" : "outline"} className="mt-auto w-full" onClick={() => compare(uni.id)}>
                  {compareIds.includes(uni.id) ? "Selected for comparison" : "Add to comparison"}
                </Button>
              </div>
            </div>
          ))}
          {!selectedTop.length && <p className="text-sm text-muted-foreground">Complete your profile to build a shortlist.</p>}
        </div>

        <AnimatePresence initial={false}>
          {comparisonOpen && compareIds.length === 3 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
                <div className="flex items-center justify-between border-b border-border bg-secondary/50 p-3">
                  <p className="text-sm font-black">Side-by-side comparison</p>
                  <button onClick={() => setComparisonOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-card hover:text-foreground" aria-label="Close comparison"><X className="h-4 w-4" /></button>
                </div>
                <table className="w-full min-w-[720px] text-sm">
                  <thead><tr className="bg-secondary/30"><th className="p-3 text-left text-xs text-muted-foreground">Decision factor</th>{comparisonUnis.map((u) => <th key={u.id} className="p-3 text-left font-black">{u.name}</th>)}</tr></thead>
                  <tbody>
                    {[
                      ["Tuition / year", (u) => `$${(Number(u.tuition_annual_usd)||0).toLocaleString()}`],
                      ["Living / year", (u) => `$${(Number(u.avg_annual_living_cost_usd)||0).toLocaleString()}`],
                      ["Starting salary", (u) => `$${(Number(u.median_starting_salary_usd)||0).toLocaleString()}`],
                      ["Visa runway", (u) => `${Number(u.post_study_visa_years)||0} yrs`],
                      ["ROI rating", (u) => `${Number(u.roi_rating)||0}/5`],
                    ].map(([label, fn]) => <tr key={label} className="border-t border-border"><td className="p-3 font-semibold text-muted-foreground">{label}</td>{comparisonUnis.map((u) => <td key={u.id} className="p-3 font-bold">{fn(u)}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Insight icon={WalletCards} title="Cost" text="Lower-cost universities remain included when your budget ceiling increases." /><Insight icon={BriefcaseBusiness} title="Career" text="Starting-salary signals help distinguish similar admission matches." /><Insight icon={Globe2} title="Visa" text="Post-study runway is visible alongside admission fit." /><Insight icon={MapPin} title="Program" text={`Only programs offering ${profile.target_major} are mapped here.`} /></div>
      <RiskTierSection tier="Safety" items={grouped.Safety} profile={profile} /><RiskTierSection tier="Target" items={grouped.Target} profile={profile} /><RiskTierSection tier="Reach" items={grouped.Reach} profile={profile} /><RiskTierSection tier="Unlikely" items={grouped.Unlikely} profile={profile} />
    </div>
  );
}

function RadarVisual({ values }) {
  const size = 280;
  const center = size / 2;
  const radius = 88;
  const point = (value, index, r = radius) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / values.length;
    const distance = r * (value / 100);
    return [center + Math.cos(angle) * distance, center + Math.sin(angle) * distance];
  };
  const polygon = (r, value = 100) => values.map((_, i) => point(value, i, r)).join(" ");
  const valuePoints = values.map((item, i) => point(item.value, i)).join(" ");
  return (
    <div className="relative mx-auto max-w-[320px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full overflow-visible">
        {[1, .75, .5, .25].map((scale) => <polygon key={scale} points={polygon(radius * scale)} fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />)}
        {values.map((item, i) => { const [x, y] = point(100, i); return <line key={item.label} x1={center} y1={center} x2={x} y2={y} stroke="currentColor" strokeWidth="1" className="text-border" />; })}
        <motion.polygon initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .65, ease: [0.22, 1, 0.36, 1] }} points={valuePoints} fill="hsl(var(--primary) / .16)" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinejoin="round" style={{ transformOrigin: "center" }} />
        {values.map((item, i) => { const [x, y] = point(item.value, i); return <motion.circle key={item.label} initial={{ r: 0 }} animate={{ r: 4 }} transition={{ delay: i * .08 }} cx={x} cy={y} fill="hsl(var(--primary))" />; })}
      </svg>
      {values.map((item, i) => { const angle = -Math.PI / 2 + (i * Math.PI * 2) / values.length; const x = 50 + Math.cos(angle) * 46; const y = 50 + Math.sin(angle) * 46; return <span key={item.label} className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-secondary/80 px-2.5 py-1 text-[10px] font-bold text-muted-foreground backdrop-blur" style={{ left: `${x}%`, top: `${y}%` }}>{item.label} · {item.value}</span>; })}
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }) { return <div className="bubble-hover rounded-2xl border border-border bg-card p-4"><Icon className="h-4 w-4 text-primary" /><p className="mt-3 text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate text-2xl font-black">{value}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{sub}</p></div>; }
function Insight({ icon: Icon, title, text }) { return <div className="bubble-hover rounded-2xl border border-border bg-secondary/40 p-4"><Icon className="h-4 w-4 text-primary" /><p className="mt-2 text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div>; }
function EmptyState({ title="Build your decision profile.", text="Complete the diagnostic once and GradBound will reuse it across every decision.", button="Build my profile" }) { return <div className="mx-auto max-w-xl"><div className="rounded-3xl border border-border bg-card p-10 text-center"><Sparkles className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-4 text-2xl font-black">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{text}</p><Button asChild className="mt-6"><Link to="/profile-diagnostic">{button} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div></div>; }
