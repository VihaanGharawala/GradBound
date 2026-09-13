import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, Compass, HeartHandshake, Lightbulb, Search, Sparkles, Target } from "lucide-react";

const problemPoints = [
  "Admission requirements live across dozens of university pages and are difficult to compare consistently.",
  "Students often build spreadsheets of universities without a clear way to judge Safety, Target and Reach choices.",
  "GPA, tests, experience, certifications and research are rarely translated into one understandable profile signal.",
  "Cost, visa runway and career outcomes usually appear only after the student has already shortlisted schools.",
];

const solutionPoints = [
  ["Build one profile", "Academics, tests, work, certifications, research and goals are captured once."],
  ["Match the right programs", "The radar only shows universities that offer the student's chosen Master's program."],
  ["Explain the ranking", "GradBound shows the decision score, the reasons behind it and the gaps that matter."],
  ["Compare before committing", "Students can shortlist three colleges and compare tuition, living cost, visa runway and salary signals."],
];

export default function ProblemSolution() {
  return <div className="max-w-6xl mx-auto space-y-10 pb-16">
    <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Designathon story · Problem → Insight → Solution</p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">Choosing a Master's should feel like a decision, not a research project.</h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">GradBound turns a fragmented graduate-school search into one guided journey: understand your profile, find realistic programs, compare trade-offs and know what to improve next.</p>
    </motion.header>

    <section className="grid gap-5 lg:grid-cols-2">
      <StoryCard icon={AlertTriangle} eyebrow="01 · THE PROBLEM" title="Too many tabs. Too little confidence." tone="rose">
        <div className="space-y-3">{problemPoints.map((point) => <div key={point} className="flex gap-3 text-sm leading-6"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />{point}</div>)}</div>
      </StoryCard>
      <StoryCard icon={Lightbulb} eyebrow="02 · THE INSIGHT" title="Students don't need another ranking list." tone="amber">
        <p className="text-sm leading-7 text-muted-foreground">The real question is not “Which university is ranked highest?” It is “Given <strong className="text-foreground">my</strong> profile, goals, budget and destination preferences, which choices make sense?”</p>
        <div className="mt-4 grid grid-cols-2 gap-3"><Mini label="Profile" value="Who am I?" /><Mini label="Match" value="Where do I fit?" /><Mini label="Trade-offs" value="What changes?" /><Mini label="Next step" value="What should I improve?" /></div>
      </StoryCard>
    </section>

    <section className="rounded-[2rem] border border-primary/20 bg-primary/5 p-6 sm:p-9">
      <div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"><Sparkles className="h-6 w-6" /></div><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">03 · THE SOLUTION</p><h2 className="mt-1 text-3xl font-black">GradBound is a decision engine.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Instead of returning one mysterious recommendation, GradBound makes the reasoning visible and lets the student control the trade-offs.</p></div></div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">{solutionPoints.map(([title, text], i) => <div key={title} className="rounded-2xl border border-border bg-card p-4"><div className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-black text-primary">{i + 1}</span><div><p className="font-black">{title}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div></div></div>)}</div>
    </section>

    <section className="grid gap-5 md:grid-cols-3">
      <Feature icon={Search} title="Evidence beside the decision" text="Tuition, living cost, starting salary and visa runway sit next to the admission signal." />
      <Feature icon={Compass} title="A visual admissions radar" text="Safety, Target and Reach choices become a map instead of a spreadsheet." />
      <Feature icon={Target} title="Actionable improvement" text="The improvement simulator shows how tests, experience, budget or certifications can change the profile signal." />
    </section>

    <section className="rounded-[2rem] bg-stone-950 p-7 sm:p-10 text-white">
      <div className="grid gap-8 lg:grid-cols-[1fr_.8fr] items-center"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-300">04 · WHY IT MATTERS</p><h2 className="mt-2 text-3xl sm:text-4xl font-black">Better decisions before the application fee is spent.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">GradBound is designed to help students build a balanced application strategy, understand the trade-offs behind each option and identify practical next steps—without pretending that a model can guarantee admission.</p></div><div className="space-y-3">{["One reusable student profile", "Program-specific matching", "Transparent decision reasoning", "Three-school comparison", "Clear next actions"].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" />{item}</div>)}</div></div>
      <Link to="/profile-diagnostic" className="theme-cta bubble-hover mt-8 inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-black">Experience the decision engine <ArrowRight className="h-4 w-4" /></Link>
    </section>

    <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-xs leading-5 text-muted-foreground"><HeartHandshake className="mr-1 inline h-4 w-4 text-primary" /> GradBound's scores are directional estimates from the included dataset. Students should verify current university requirements, immigration rules and financial information with official sources.</div>
  </div>;
}

function StoryCard({ icon: Icon, eyebrow, title, tone, children }) { const tones = { rose: "border-rose-200/70 bg-rose-50/40 dark:border-rose-500/20 dark:bg-rose-500/5", amber: "border-amber-200/70 bg-amber-50/40 dark:border-amber-500/20 dark:bg-amber-500/5" }; return <motion.article initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} className={`rounded-[2rem] border p-6 sm:p-7 ${tones[tone]}`}><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">{eyebrow}</p><h2 className="mt-2 text-2xl font-black">{title}</h2><div className="mt-5">{children}</div></motion.article>; }
function Mini({ label, value }) { return <div className="rounded-xl border border-border bg-card p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-sm font-black">{value}</p></div>; }
function Feature({ icon: Icon, title, text }) { return <div className="rounded-2xl border border-border bg-card p-5"><Icon className="h-5 w-5 text-primary" /><h3 className="mt-4 font-black">{title}</h3><p className="mt-1.5 text-sm leading-6 text-muted-foreground">{text}</p></div>; }
