"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AdminToolbar({
  searchPlaceholder = "Search…",
  searchParam = "q",
  filters,
  resultCount,
  children,
  className,
}: {
  searchPlaceholder?: string;
  searchParam?: string;
  filters?: React.ReactNode;
  resultCount?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(searchParam) ?? "";
  const [value, setValue] = React.useState(current);

  React.useEffect(() => {
    setValue(current);
  }, [current]);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      const next = value.trim();
      if (next === current) return;
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set(searchParam, next);
      else params.delete(searchParam);
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 250);
    return () => window.clearTimeout(t);
  }, [value, current, pathname, router, searchParam, searchParams]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-neutral-200/80 bg-white p-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 rounded-lg border-neutral-200 bg-white pl-8 text-sm"
          />
        </div>
        {filters ? (
          <div className="flex flex-wrap items-center gap-1.5">{filters}</div>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        {typeof resultCount === "number" ? (
          <span className="text-xs tabular-nums text-neutral-500">
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </span>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function AdminFilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center rounded-lg border px-2.5 text-xs font-medium transition-colors",
        active
          ? "border-[#c59d3f]/40 bg-[hsl(var(--portal-gold-soft))] text-[#8a6d1f]"
          : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
      )}
    >
      {children}
    </button>
  );
}
