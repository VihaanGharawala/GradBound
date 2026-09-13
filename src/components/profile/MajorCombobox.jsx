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
import { UNDERGRAD_MAJOR_GROUPS, OTHER_MAJOR } from "@/lib/constants";

export default function MajorCombobox({ value, onChange }) {
  const [open, setOpen] = useState(false);

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
            {value || "Search or select your major..."}
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
          <CommandInput placeholder="Type to search majors..." />
          <CommandList>
            <CommandEmpty>No major found.</CommandEmpty>
            {UNDERGRAD_MAJOR_GROUPS.map((g) => (
              <CommandGroup key={g.group} heading={g.group}>
                {g.majors.map((m) => (
                  <CommandItem
                    key={m}
                    value={m}
                    onSelect={() => {
                      onChange(m);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === m ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {m}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            <CommandGroup>
              <CommandItem
                value={OTHER_MAJOR}
                onSelect={() => {
                  onChange(OTHER_MAJOR);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === OTHER_MAJOR ? "opacity-100" : "opacity-0"
                  )}
                />
                {OTHER_MAJOR}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}