import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending:
    "border-neutral-300 bg-white text-neutral-700",
  contacted:
    "border-sky-200 bg-sky-50 text-sky-800",
  approved:
    "border-transparent bg-[#a8842a] text-white",
  declined:
    "border-transparent bg-red-600 text-white",
  active:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  completed:
    "border-transparent bg-neutral-800 text-white",
  open:
    "border-amber-200 bg-amber-50 text-amber-900",
  in_progress:
    "border-sky-200 bg-sky-50 text-sky-800",
  resolved:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  closed:
    "border-neutral-200 bg-neutral-100 text-neutral-600",
  paid:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  pending_payment:
    "border-amber-200 bg-amber-50 text-amber-900",
  failed:
    "border-transparent bg-red-600 text-white",
  draft:
    "border-neutral-200 bg-neutral-50 text-neutral-600",
  published:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function AdminStatus({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const key = (status ?? "pending").toLowerCase();
  const label = key.replace(/_/g, " ");
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2 py-0 text-[10px] font-semibold uppercase tracking-wide",
        STATUS_STYLES[key] ?? "border-neutral-200 bg-neutral-50 text-neutral-600",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
