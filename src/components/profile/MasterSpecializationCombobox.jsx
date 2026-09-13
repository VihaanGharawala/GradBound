import React, { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getUniqueMasterPrograms } from "@/lib/universityDataset";

const PROGRAMS = getUniqueMasterPrograms();

export default function MasterSpecializationCombobox({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? PROGRAMS.filter((program) => program.toLowerCase().includes(q)) : PROGRAMS;
  }, [query]);

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setQuery(""); }}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} className="h-14 w-full justify-between rounded-2xl border-border bg-background px-4 text-left font-medium shadow-sm transition-colors hover:bg-secondary/40 hover:text-foreground">
          <span className="flex min-w-0 items-center gap-3">
            <Search className="h-4 w-4 shrink-0 text-primary" />
            <span className={cn("truncate text-base", !value && "text-muted-foreground")}>{value || "Search or select your target specialization..."}</span>
          </span>
          <ChevronsUpDown className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[120] w-[var(--radix-popover-trigger-width)] p-0" align="start" onWheel={(event) => event.stopPropagation()}>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Master's programs..." className="h-11 w-full bg-transparent text-sm outline-none" />
        </div>
        <div className="max-h-[55vh] min-h-[220px] overflow-y-auto overscroll-contain py-1 pr-1" onWheel={(event) => event.stopPropagation()}>
          {filtered.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">No program found.</p> : filtered.map((program) => <button type="button" key={program} onClick={() => { onChange(program); setOpen(false); setQuery(""); }} className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none">
            <Check className={cn("mr-2 h-4 w-4 shrink-0", value === program ? "opacity-100 text-primary" : "opacity-0")} />
            <span>{program}</span>
          </button>)}
        </div>
      </PopoverContent>
    </Popover>
  );
}
