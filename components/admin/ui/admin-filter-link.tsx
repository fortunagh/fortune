"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

export function AdminStatusFilterLinks({
  options,
  param = "status",
}: {
  options: { value: string; label: string }[];
  param?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get(param) ?? "all").toLowerCase();

  function hrefFor(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(param);
    else params.set(param, value);
    params.delete("page");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <>
      {options.map((opt) => {
        const active = current === opt.value;
        return (
          <Link
            key={opt.value}
            href={hrefFor(opt.value)}
            className={cn(
              "inline-flex h-8 items-center rounded-lg border px-2.5 text-xs font-medium transition-colors",
              active
                ? "border-[#c59d3f]/40 bg-[hsl(var(--portal-gold-soft))] text-[#8a6d1f]"
                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
            )}
          >
            {opt.label}
          </Link>
        );
      })}
    </>
  );
}
