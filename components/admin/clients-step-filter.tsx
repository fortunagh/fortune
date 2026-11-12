"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ClientsStepFilter({
  steps,
}: {
  steps: { key: string; title: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("step") ?? "all";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("step");
    else params.set("step", value);
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[180px] rounded-lg text-xs">
        <SelectValue placeholder="All steps" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All steps</SelectItem>
        {steps.map((s) => (
          <SelectItem key={s.key} value={s.key}>
            {s.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
