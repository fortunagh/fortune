"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export function AdminSupportStatus({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(next: string) {
    setBusy(true);
    setError(null);
    setValue(next);
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Update failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
      setValue(status);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <Button
            key={s}
            type="button"
            size="sm"
            variant={value === s ? "fortuna" : "outline"}
            className={cn(
              "rounded-full text-[10px] uppercase tracking-wide",
              value === s ? "" : "rounded-full",
            )}
            disabled={busy}
            onClick={() => save(s)}
          >
            {s.replace(/_/g, " ")}
          </Button>
        ))}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
