"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

  async function save(next: string) {
    setBusy(true);
    setValue(next);
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Update failed");
      toast.success(`Marked ${next.replace(/_/g, " ")}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
      setValue(status);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      {STATUSES.map((s) => (
        <Button
          key={s}
          type="button"
          size="sm"
          variant={value === s ? "fortuna" : "outline"}
          className={cn("h-7 px-2 text-[10px] uppercase tracking-wide")}
          disabled={busy}
          onClick={() => save(s)}
        >
          {s.replace(/_/g, " ")}
        </Button>
      ))}
    </div>
  );
}
