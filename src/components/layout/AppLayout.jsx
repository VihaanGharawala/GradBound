import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TopNav from "@/components/layout/TopNav";

export default function AppLayout() {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem("gradbound_theme");
    const dark = saved === "dark";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("gradbound_theme", next ? "dark" : "light");
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground transition-colors">
      <TopNav isDark={isDark} onToggleDark={toggleDark} />
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div key={`${location.pathname}${location.search}`} className="page-transition">
          <Outlet />
        </div>
      </main>
      <footer className="mt-8 border-t border-border px-4 py-7 text-center">
        <div className="footer-signature">
          <span className="text-sm font-semibold tracking-wide text-muted-foreground">#designathon2026</span>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="text-sm font-bold text-primary">Vihaan Gharawala</span>
        </div>
        <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">GradBound · Make your next move make sense.</p>
      </footer>
    </div>
  );
}