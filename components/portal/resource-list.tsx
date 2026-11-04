"use client";

import { FileText, Link2, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";

type Resource = {
  id: string;
  title: string;
  kind: string;
  storage_path?: string | null;
  external_url?: string | null;
};

export function ResourceList({ resources }: { resources: Resource[] }) {
  async function track(resourceId: string) {
    try {
      await fetch("/api/resources/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId, event: "open" }),
      });
    } catch {
      /* non-blocking */
    }
  }

  return (
    <ul className={cn(fortunaUiClass, "space-y-3")}>
      {resources.map((r) => {
        const href = r.external_url || r.storage_path || "#";
        const Icon =
          r.kind === "video" ? Play : r.kind === "link" ? Link2 : FileText;
        return (
          <li
            key={r.id}
            className="flex items-center justify-between gap-3 border-b border-border pb-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="truncate text-sm">{r.title}</span>
            </div>
            <Button asChild size="sm" variant="outline" className="rounded-none">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={() => track(r.id)}
              >
                Open
              </a>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
