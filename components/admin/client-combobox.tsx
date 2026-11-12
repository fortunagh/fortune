"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ClientOption = {
  userId: string;
  name: string;
  email: string | null;
};

export function ClientCombobox({
  options,
  value,
  onChange,
  placeholder = "Select client…",
}: {
  options: ClientOption[];
  value: string;
  onChange: (userId: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.userId === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected
              ? `${selected.name}${selected.email ? ` · ${selected.email}` : ""}`
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search clients…" />
          <CommandList>
            <CommandEmpty>No client found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.userId}
                  value={`${opt.name} ${opt.email ?? ""} ${opt.userId}`}
                  onSelect={() => {
                    onChange(opt.userId);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5",
                      value === opt.userId ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">
                    {opt.name}
                    {opt.email ? (
                      <span className="text-neutral-500"> · {opt.email}</span>
                    ) : null}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
