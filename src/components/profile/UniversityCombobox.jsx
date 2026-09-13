import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UNDERGRAD_UNIVERSITIES, OTHER_UNIVERSITY } from "@/lib/constants";

const TIER_LABELS = {
  1: "Tier 1 — Top Research / Global Campuses",
  2: "Tier 2 — Established Branch & Regional Universities",
  3: "Tier 3 — Newer Private Colleges",
};

export default function UniversityCombobox({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const grouped = [1, 2, 3].map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    unis: UNDERGRAD_UNIVERSITIES.filter((u) => u.tier === tier),
  }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || "Search or select your university..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <CommandInput placeholder="Type to search universities..." />
          <CommandList>
            <CommandEmpty>No university found.</CommandEmpty>
            {grouped.map((g) => (
              <CommandGroup key={g.tier} heading={g.label}>
                {g.unis.map((u) => (
                  <CommandItem
                    key={u.name}
                    value={u.name}
                    onSelect={() => {
                      onChange(u.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === u.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {u.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            <CommandGroup>
              <CommandItem
                value={OTHER_UNIVERSITY}
                onSelect={() => {
                  onChange(OTHER_UNIVERSITY);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === OTHER_UNIVERSITY ? "opacity-100" : "opacity-0"
                  )}
                />
                {OTHER_UNIVERSITY}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}