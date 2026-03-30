import { cn } from "@/lib/utils";

/** Centered animated loader for admin gates / full-page waits */
export function AdminPageLoader({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-neutral-50 px-4 dark:bg-neutral-950",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-700" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-amber-600 border-r-amber-500/40" />
      </div>
      <p className="animate-pulse text-sm font-medium tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}…
      </p>
    </div>
  );
}
