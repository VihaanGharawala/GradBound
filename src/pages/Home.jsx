import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleGauge,
  Compass,
  GraduationCap,
  Globe2,
  Radar,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
  Zap,
} from "lucide-react";
import { getAllUniversities } from "@/lib/universityDataset";
import { loadProfile, isProfileComplete } from "@/lib/profileStorage";
import { offersTargetMajor } from "@/lib/compositeScore";
import { safeComputeDecisionScore, simulateImprovement, computeGradBoundScore } from "@/lib/decisionEngine";
import { normalizeStandardizedTests, testSignal } from "@/lib/testCatalog";

const FEATURES = [
  { icon: GraduationCap, eyebrow: "01 · PROFILE", title: "Build your applicant signal", description: "Turn GPA, tests, experience, research and goals into one reusable profile.", to: "/profile-diagnostic" },
  { icon: Radar, eyebrow: "02 · MATCH", title: "See your real shortlist", description: "Get Safety, Target and Reach recommendations with transparent fit scores.", to: "/admissions-radar" },
  { icon: Globe2, eyebrow: "03 · EXPLORE", title: "Compare the world", description: "Search programs across countries without juggling dozens of tabs.", to: "/university-search" },
  { icon: WalletCards, eyebrow: "04 · OUTCOME", title: "Choose beyond rankings", description: "Compare visa runway, cost of living, salary and estimated 3-year ROI.", to: "/visa-roi-matrix" },
];

function ScoreRing({ score = 82 }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-800" />
        <motion.circle initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.1, ease: "easeOut" }} cx="56" cy="56" r={radius} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} className="text-teal-500" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center"><div className="text-2xl font-black">{score}</div><div className="text-[10px] uppercase tracking-widest text-slate-400">fit</div></div>
      </div>
    </div>
  );
}

function improvementTarget(key) {
  const targets = {
    test: "/profile-diagnostic?step=2",
    budget: "/profile-diagnostic?step=4",
    experience: "/profile-diagnostic?step=3&focus=work-experience",
    certification: "/profile-diagnostic?step=3&focus=certifications_count",
  };
  return targets[key] || "/profile-diagnostic";
}

function normalizeTestReadiness(profile) {
  const tests = normalizeStandardizedTests(profile);
  if (!tests.length) return 0;
  const scored = tests.map(testSignal);
  const best = Math.max(...scored);
  const stackBonus = Math.min(.25, Math.max(0, scored.length - 1) * .07);
  return Math.round(Math.min(1, best * .8 + stackBonus) * 100);
}

export default function Home() {
  const universities = getAllUniversities();
  const profile = loadProfile();
  const complete = isProfileComplete(profile);
  const countryCount = new Set(universities.map((u) => u.country)).size;

  const snapshot = useMemo(() => {
    if (!complete || !profile?.target_major) return null;
    return universities
      .filter((u) => offersTargetMajor(u, profile.target_major))
      .map((uni) => ({ uni, result: safeComputeDecisionScore(profile, uni, profile.priorities) }))
      .filter(({ result }) => result)
      .sort((a, b) => b.result.score - a.result.score)
      .slice(0, 3);
  }, [complete, profile, universities]);

  const top = snapshot?.[0];
  const gradBoundScore = complete ? computeGradBoundScore(profile, universities) : 0;
  const stats = [
    { value: `${universities.length}+`, label: "universities" },
    { value: `${countryCount}`, label: "countries" },
    { value: "4", label: "decision tools" },
    { value: "100%", label: "profile-driven" },
  ];

  return (
    <div className="pb-24">
      <section className="relative overflow-hidden pt-10 sm:pt-16 lg:pt-20 pb-14 sm:pb-20">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-teal-200/70 dark:border-teal-500/20 bg-white/70 dark:bg-stone-900/60 backdrop-blur px-3 py-1.5 text-xs font-semibold text-teal-600 dark:text-teal-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Graduate admissions, without the guesswork.
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="mt-6 text-5xl sm:text-6xl lg:text-[76px] leading-[.96] font-black tracking-[-0.055em] text-stone-950 dark:text-white">
              Make your<br /><span className="gradient-text">next move</span><br />make sense.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mt-7 max-w-xl text-lg sm:text-xl leading-8 text-slate-600 dark:text-slate-300">
              GradBound turns your profile into a shortlist, a risk map, and an outcome comparison — so you can choose where to apply with confidence.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24 }} className="mt-8 flex flex-wrap gap-3">
              <Link to={complete ? "/admissions-radar" : "/profile-diagnostic"} className="inline-flex h-12 items-center gap-2 rounded-xl bg-stone-950 px-5 text-sm font-bold text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-teal-600 dark:bg-white dark:text-stone-950 dark:hover:bg-teal-100">
                {complete ? "Open my admissions radar" : "Build my profile"}<ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/university-search" className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-5 text-sm font-bold text-slate-800 backdrop-blur transition hover:border-teal-300 hover:bg-white dark:border-slate-700 dark:bg-stone-900/70 dark:text-white dark:hover:border-teal-500">
                Explore universities <Compass className="w-4 h-4" />
              </Link>
            </motion.div>
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Transparent scoring</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="w-4 h-4 text-yellow-500" /> No spreadsheet required</span>
              <span className="inline-flex items-center gap-1.5"><Globe2 className="w-4 h-4 text-teal-500" /> Global coverage</span>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, x: 30, scale: .98 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: .18, duration: .65 }} className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-teal-500/10 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/70 dark:border-slate-700/80 bg-white/85 dark:bg-stone-900/90 backdrop-blur-2xl shadow-[0_30px_90px_-35px_rgba(15,23,42,.45)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-teal-500">Decision cockpit</p><p className="mt-1 text-sm font-bold">Your application picture</p></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.12)]" />
              </div>
              <div className="p-5 sm:p-6">
                {complete && top ? (
                  <>
                    <div className="flex items-center gap-5">
                      <ScoreRing score={gradBoundScore} />
                      <div><p className="text-xs font-semibold text-slate-500">TOP MATCH</p><h3 className="mt-1 text-xl font-black tracking-tight">{top.uni.name}</h3><p className="mt-1 text-sm text-slate-500">{top.uni.city} · {top.uni.country}</p><span className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{top.result.tier}</span></div>
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-2">
                      {snapshot.map(({ uni, result }) => <Link key={uni.id} to={`/university/${uni.id}`} className="bubble-hover rounded-xl border border-slate-200 bg-slate-50/70 p-3 hover:border-teal-300 dark:border-slate-800 dark:bg-stone-950/60"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{result.tier}</div><div className="mt-1 text-sm font-bold truncate">{uni.name}</div><div className="mt-2 text-xs font-semibold text-teal-600">{result.score}% match</div></Link>)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-5"><div className="grid h-28 w-28 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-500/10 dark:to-cyan-500/10"><CircleGauge className="w-11 h-11 text-teal-500" /></div><div><p className="text-xs font-semibold text-teal-500">STEP 01</p><h3 className="mt-1 text-2xl font-black tracking-tight">Create your signal.</h3><p className="mt-2 text-sm leading-6 text-slate-500">Give GradBound the few inputs that change your admissions picture. We reuse them across every tool.</p></div></div>
                    <div className="mt-6 space-y-2.5">{["Academic baseline", "Tests & experience", "Target program & countries"].map((item, i) => <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-stone-950"><span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[11px] font-bold shadow-sm dark:bg-stone-900">{i + 1}</span><span className="text-sm font-semibold">{item}</span><ChevronRight className="ml-auto w-4 h-4 text-slate-400" /></div>)}</div>
                    <Link to="/profile-diagnostic" className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-bold text-white transition hover:bg-teal-700">Start the diagnostic <ArrowRight className="w-4 h-4" /></Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-stone-900/70 backdrop-blur shadow-sm">
          {stats.map((s, i) => <div key={s.label} className={`bubble-hover px-5 py-5 sm:py-6 ${i % 2 ? "border-l" : ""} ${i > 1 ? "lg:border-l" : ""} border-slate-200 dark:border-slate-800`}><div className="text-2xl sm:text-3xl font-black tracking-tight">{s.value}</div><div className="mt-1 text-xs font-medium text-slate-500">{s.label}</div></div>)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} className="rounded-[2rem] border border-border bg-card p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Application readiness</p><h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">See the signals before you apply.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">GradBound turns the information you already entered into a quick readiness pulse, so you can spot weak signals before spending an application fee.</p></div>
            <Link to="/profile-diagnostic" className="inline-flex items-center gap-1 text-sm font-bold text-primary">Improve profile <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Academic", complete ? Math.min(100, Math.round((Number(profile.cgpa_value || 0) / (profile.cgpa_scale === "10" ? 10 : 4)) * 100)) : 0],
              ["Testing", complete ? Math.min(100, Math.round((normalizeTestReadiness(profile)))) : 0],
              ["Experience", complete ? Math.min(100, Math.round(((profile.work_experiences?.length || 0) / 3) * 100)) : 0],
              ["Goals", complete ? Math.min(100, Math.round(((profile.target_countries?.length || 0) > 0 ? 70 : 45) + (profile.target_major ? 30 : 0))) : 0],
              ["Decision fit", complete ? gradBoundScore : 0],
            ].map(([label, value], i) => <motion.div key={label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .06 }} className="rounded-2xl border border-border bg-secondary/30 p-4"><div className="flex items-center justify-between gap-2"><span className="text-sm font-black">{label}</span><span className="text-sm font-black text-primary">{value}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-card"><motion.div initial={{ width: 0 }} whileInView={{ width: `${value}%` }} viewport={{ once: true }} transition={{ duration: .7, delay: i * .06 }} className="h-full rounded-full bg-primary" /></div><p className="mt-2 text-[11px] text-muted-foreground">{value >= 75 ? "Strong signal" : value >= 50 ? "Worth improving" : "Add more evidence"}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {complete && top && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
          <div className="grid gap-5">
            <motion.div initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{delay:.08}} className="rounded-[2rem] border border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Your next best moves</p><h2 className="mt-2 text-2xl font-black">Four changes worth making.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Start with the highest-impact change, then jump straight to the field that needs attention.</p></div>
                <div className="hidden rounded-2xl bg-primary/10 px-3 py-2 text-right sm:block"><p className="text-[10px] font-bold uppercase tracking-wider text-primary">Goal</p><p className="text-xs font-black">Stronger applications</p></div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {simulateImprovement(profile,universities,profile.priorities).map((x, i)=><div key={x.key} className="rounded-2xl border border-border bg-secondary/30 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary/50">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><span className="text-sm font-black">{i + 1}</span></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-black">{x.title}</p><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${x.gain > 0 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>{x.gain > 0 ? `+${x.gain} possible` : "Worth checking"}</span></div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{x.detail}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold"><span className="rounded-lg bg-card px-2 py-1">Now {x.current}/100</span><span className="text-muted-foreground">→</span><span className="rounded-lg bg-card px-2 py-1">Then {x.projected}/100</span></div>
                      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-primary/10 bg-card/70 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-primary">Do this</p><p className="mt-0.5 text-xs font-bold">{x.action}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{x.impact}</p></div><Link to={improvementTarget(x.key)} className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-[11px] font-black text-primary-foreground transition hover:-translate-y-0.5">Go to field <ArrowRight className="h-3 w-3" /></Link></div>
                    </div>
                  </div>
                </div>)}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-9"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-500">One profile. Four decisions.</p><h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">Everything you need to decide.</h2></div><p className="max-w-md text-sm leading-6 text-slate-500">The strongest competitors each solve one piece. GradBound connects the whole journey — from profile signal to post-study outcome.</p></div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => { const Icon = f.icon; return <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ delay: i * .06 }}><Link to={f.to} className="bubble-hover group block h-full rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/10 dark:border-slate-800 dark:bg-stone-900/70 dark:hover:border-teal-600"><div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition dark:bg-slate-800"><Icon className="w-5 h-5" /></div><span className="text-[10px] font-bold tracking-widest text-slate-400">{f.eyebrow}</span></div><h3 className="mt-5 text-lg font-black tracking-tight">{f.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{f.description}</p><div className="mt-5 flex items-center gap-1 text-xs font-bold text-teal-600">Open tool <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" /></div></Link></motion.div> })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-[#2A1F17] text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(156,71,34,.55),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(184,134,11,.30),transparent_32%)]" />
          <div className="relative grid lg:grid-cols-[1fr_.85fr] gap-10 p-7 sm:p-10 lg:p-14">
            <div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-300">Why GradBound wins</p><h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight leading-tight">Not just a list of universities.<br /><span className="text-teal-300">A decision system.</span></h2><p className="mt-5 max-w-xl text-white/85 leading-7">Instead of making students compare rankings, requirements, visa pages and salary tables separately, GradBound puts the trade-offs next to each other and explains the match.</p><Link to={complete ? "/admissions-radar" : "/profile-diagnostic"} className="theme-cta bubble-hover mt-7 inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold">{complete ? "See my recommendations" : "Build my recommendation"}<ArrowRight className="w-4 h-4" /></Link></div>
            <div className="grid gap-3 content-center">{["Transparent fit score — not a mystery recommendation", "Safety / Target / Reach — instantly understandable", "Visa + cost + salary — the decision after admission", "Searchable global dataset — built for comparison"].map((x) => <div key={x} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur"><div className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Check className="w-3 h-3" /></div><span className="text-sm font-semibold text-white/90">{x}</span></div>)}</div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <motion.div initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} className="rounded-[2rem] border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Everything in GradBound</p><h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">One cozy workspace for the whole decision.</h2><p className="mt-3 text-sm sm:text-base leading-7 text-muted-foreground">From your first profile input to your final three-school comparison, every feature is connected so you do less tab-switching and make clearer decisions.</p></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [GraduationCap,"Profile diagnostic","Build one reusable academic, testing, experience and goals profile."],
              [Radar,"Admissions Radar","See Safety, Target and Reach options using your own profile signals."],
              [Globe2,"University search","Explore a global university dataset by program, country and fit."],
              [CircleGauge,"3-school comparison","Select three finalists and compare them side by side in one focused view."],
              [WalletCards,"Visa + ROI matrix","Compare tuition, living costs, visa runway, salary and estimated ROI."],
              [TrendingUp,"Actionable improvement","Get concrete next moves with a projected impact on your shortlist signal."],
              [Sparkles,"Standardized test stack","Select multiple tests, enter valid-range scores and see how they strengthen your signal."],
              [ShieldCheck,"Transparent scoring","Understand why a university is a match instead of receiving a black-box recommendation."],
              [CircleGauge,"GradBound Score","Track one evolving profile signal across your strongest matching programs."],
              [Compass,"Decision priorities","Set how important cost, career, visa, admissions and other factors are independently."],
              [Check,"Dark + light mode","Switch between two cozy, readable themes without losing the visual hierarchy."],
              [Zap,"Smooth guided experience","Use animated page transitions, entrance motion and responsive interactions throughout the app."],
            ].map(([Icon,title,text],i)=><motion.div key={title} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:(i%6)*.04}} className="bubble-hover group rounded-2xl border border-border bg-secondary/25 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-secondary/45"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105"><Icon className="h-4 w-4" /></div><h3 className="mt-4 text-sm font-black">{title}</h3><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{text}</p></motion.div>)}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
