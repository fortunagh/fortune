import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

export function AdminEmpty({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-medium text-neutral-900">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-neutral-500">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
