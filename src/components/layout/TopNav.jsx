import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Moon, Sun, Search, Radar, UserRound, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: GraduationCap },
  { label: "Discover", path: "/university-search", icon: Search },
  { label: "Radar", path: "/admissions-radar", icon: Radar },
  { label: "My Profile", path: "/profile", icon: UserRound },
  { label: "Why Gradbound?", path: "/problem-solution", icon: Sparkles },
];

export default function TopNav({ isDark, onToggleDark }) {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-5">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="grid w-9 h-9 place-items-center rounded-xl bg-stone-950 shadow-lg shadow-teal-500/10 dark:bg-white"><GraduationCap className="w-5 h-5 text-white dark:text-stone-950" /></div>
          <div><span className="font-black tracking-tight text-[17px] text-foreground">GradBound</span><span className="hidden sm:block text-[9px] uppercase tracking-[.2em] text-muted-foreground">Admissions intelligence</span></div>
        </Link>
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
          {NAV_ITEMS.filter(({ label }) => label !== "My Profile").map(({ label, path, icon: Icon }) => { const active = location.pathname === path || (path === "/university-search" && location.pathname.startsWith("/university/")); return <Link key={path} to={path} className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-[15px] font-semibold transition ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-lg bg-secondary" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}<Icon className="w-3.5 h-3.5" />{label}</Link> })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/profile" className={`hidden sm:inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3.5 text-xs font-bold transition hover:bg-secondary ${location.pathname === "/profile" ? "bg-secondary text-foreground" : "text-foreground"}`}><UserRound className="w-3.5 h-3.5" /> My Profile</Link>
          <Link to="/profile-diagnostic" className="hidden sm:inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5"><Sparkles className="w-3.5 h-3.5" /><span>Start diagnostic</span></Link>
          <button onClick={onToggleDark} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-foreground transition hover:bg-secondary" aria-label="Toggle dark mode">{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
        </div>
      </div>
      <div className="md:hidden border-t border-slate-100 dark:border-slate-800 overflow-x-auto"><nav className="flex min-w-max gap-1 px-4 py-2">{NAV_ITEMS.map(({ label, path }) => <Link key={path} to={path} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${location.pathname === path ? "bg-teal-600 text-white" : "text-slate-500"}`}>{label}</Link>)}</nav></div>
    </header>
  );
}
