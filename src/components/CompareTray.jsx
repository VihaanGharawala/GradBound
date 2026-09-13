import React, { useEffect, useMemo, useState } from "react";
import { Check, GitCompare, X } from "lucide-react";
import { getAllUniversities } from "@/lib/universityDataset";
import { getUniversityImage } from "@/lib/universityVisuals";

const KEY = "gradbound_compare";
export function loadCompare() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch { return []; }
}
export function toggleCompare(id) {
  const current = loadCompare();
  const next = current.includes(id) ? current.filter((x) => x !== id) : current.length < 3 ? [...current, id] : current;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* comparison still works for this render */ }
  try { window.dispatchEvent(new Event("gradbound-compare")); } catch { /* non-browser/test environment */ }
  return next;
}

export default function CompareTray() {
  const [ids, setIds] = useState(loadCompare);
  const [open, setOpen] = useState(false);
  const unis = useMemo(() => getAllUniversities().filter((u) => ids.includes(u.id)), [ids]);
  useEffect(() => {
    const sync = () => setIds(loadCompare());
    const openTray = () => setOpen(true);
    window.addEventListener("gradbound-compare", sync);
    window.addEventListener("gradbound-open-compare", openTray);
    return () => { window.removeEventListener("gradbound-compare", sync); window.removeEventListener("gradbound-open-compare", openTray); };
  }, []);
  if (!ids.length) return null;
  const remove = (id) => toggleCompare(id);
  return <div className="fixed bottom-4 left-1/2 z-[90] w-[min(94vw,980px)] -translate-x-1/2"><div className="rounded-3xl border border-primary/30 bg-card/95 p-3 shadow-2xl backdrop-blur-xl">
    <div className="flex flex-wrap items-center gap-3"><div className="flex -space-x-2">{unis.map((u) => <img key={u.id} src={getUniversityImage(u)} alt="" className="h-10 w-10 rounded-full border-2 border-card object-cover" />)}</div><div className="min-w-0 flex-1"><p className="text-sm font-black">Compare up to 3 colleges <span className="text-primary">{ids.length}/3</span></p><p className="text-xs text-muted-foreground">Select finalists and compare the numbers side by side.</p></div><button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"><GitCompare className="h-3.5 w-3.5" />{open ? "Hide comparison" : "Open comparison"}</button></div>
    {open && <div className="mt-4 overflow-x-auto rounded-2xl border border-border"><table className="w-full min-w-[720px] text-sm"><thead><tr className="bg-secondary/50"><th className="p-3 text-left text-xs text-muted-foreground">Decision factor</th>{unis.map((u) => <th key={u.id} className="p-3 text-left"><div className="flex items-start justify-between gap-2"><span className="font-black">{u.name}</span><button onClick={() => remove(u.id)} className="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground" aria-label={`Remove ${u.name}`}><X className="h-3.5 w-3.5" /></button></div></th>)}</tr></thead><tbody>{[["Tuition / year", (u) => `$${(Number(u.tuition_annual_usd)||0).toLocaleString()}`],["Living / year", (u) => `$${(Number(u.avg_annual_living_cost_usd)||0).toLocaleString()}`],["Starting salary", (u) => `$${(Number(u.median_starting_salary_usd)||0).toLocaleString()}`],["Visa runway", (u) => `${Number(u.post_study_visa_years)||0} yrs`],["ROI rating", (u) => `${Number(u.roi_rating)||0}/5`]].map(([label, fn]) => <tr key={label} className="border-t border-border"><td className="p-3 font-semibold text-muted-foreground">{label}</td>{unis.map((u) => <td key={u.id} className="p-3 font-bold">{fn(u)}</td>)}</tr>)}</tbody></table></div>}
    <div className="mt-2 flex items-center justify-end gap-2 text-[11px] text-muted-foreground"><Check className="h-3 w-3 text-primary" /> {ids.length < 3 ? "You can still add another finalist from the radar or search." : "Three finalists selected — you are ready to compare."}</div>
  </div></div>;
}
