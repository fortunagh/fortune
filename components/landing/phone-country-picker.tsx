"use client";

import { Check, ChevronsUpDown, Search } from "lucide-react";
import * as React from "react";

import {
  detectCountryIso2,
  flagEmoji,
  getPhoneCountry,
  phoneCountriesSorted,
} from "@/lib/data/phone-countries";
import { cn } from "@/lib/utils";

type PhoneCountryPickerProps = {
  value: string;
  onChange: (iso2: string) => void;
  className?: string;
  /** Auto-select detected country when value is empty. Default true. */
  autoDetect?: boolean;
};

export function PhoneCountryPicker({
  value,
  onChange,
  className,
  autoDetect = true,
}: PhoneCountryPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!autoDetect || value) return;
    const detected = detectCountryIso2();
    if (detected) onChange(detected);
  }, [autoDetect, value, onChange]);

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    setQuery("");
    const id = window.requestAnimationFrame(() => {
      searchRef.current?.focus();
      const selected = listRef.current?.querySelector("[data-selected=true]");
      selected?.scrollIntoView({ block: "nearest" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  const selected = getPhoneCountry(value);
  const q = query.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!q) return phoneCountriesSorted;
    return phoneCountriesSorted.filter((c) => {
      const name = c.name.toLowerCase();
      const dial = c.dialCode;
      const iso = c.iso2.toLowerCase();
      return (
        name.includes(q) ||
        dial.includes(q.replace(/^\+/, "")) ||
        iso.includes(q) ||
        `+${dial}`.includes(q)
      );
    });
  }, [q]);

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={
          selected
            ? `Country code +${selected.dialCode}, ${selected.name}. Change country`
            : "Select country code"
        }
        className={cn(
          "font-[Arial,Helvetica,sans-serif] inline-flex h-full min-h-10 items-center gap-1.5 border-0 border-r border-[#b9764a55] bg-[#f5f1ea]/80 px-2.5 text-sm text-[#101217] transition hover:bg-[#f5f1ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a84d0b]/30 sm:px-3",
        )}
      >
        <span className="text-base leading-none" aria-hidden>
          {selected ? flagEmoji(selected.iso2) : "🌐"}
        </span>
        <span className="tabular-nums font-medium">
          {selected ? `+${selected.dialCode}` : "Code"}
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[#a84d0b]/80" />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Country codes"
          className="absolute left-0 top-[calc(100%+4px)] z-50 flex w-[min(calc(100vw-2rem),20rem)] flex-col border border-[#b9764a55] bg-white shadow-[0_16px_40px_rgba(80,40,10,0.14)]"
        >
          <div className="flex items-center gap-2 border-b border-[#b9764a40] px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="font-[Arial,Helvetica,sans-serif] w-full bg-transparent text-sm text-[#101217] outline-none placeholder:text-neutral-400"
            />
          </div>
          <div
            ref={listRef}
            className="max-h-[min(280px,45vh)] overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <p className="font-[Arial,Helvetica,sans-serif] px-3 py-4 text-center text-xs text-neutral-500">
                No countries match
              </p>
            ) : (
              filtered.map((c) => {
                const isSelected = c.iso2 === value;
                return (
                  <button
                    key={c.iso2}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-selected={isSelected || undefined}
                    onClick={() => {
                      onChange(c.iso2);
                      setOpen(false);
                    }}
                    className={cn(
                      "font-[Arial,Helvetica,sans-serif] flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition",
                      isSelected
                        ? "bg-[#f5f1ea] text-[#a84d0b]"
                        : "text-[#101217] hover:bg-[#f5f1ea]/80",
                    )}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {flagEmoji(c.iso2)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="shrink-0 tabular-nums text-neutral-500">
                      +{c.dialCode}
                    </span>
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#a84d0b]" />
                    ) : (
                      <span className="w-3.5 shrink-0" aria-hidden />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
