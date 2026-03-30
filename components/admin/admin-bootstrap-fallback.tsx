import { AdminChromeSkeleton } from "@/components/admin/admin-skeletons";

/** First paint while admin session + shell resolve — skeleton + centered spinner */
export function AdminBootstrapFallback() {
  return (
    <div className="relative min-h-svh w-full">
      <AdminChromeSkeleton />
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-50/75 backdrop-blur-[2px] dark:bg-neutral-950/70">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-8 py-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
          <div className="relative h-11 w-11">
            <div
              className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-700"
              aria-hidden
            />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-amber-600 border-r-amber-500/50" />
          </div>
          <p className="text-xs font-medium tracking-wide text-neutral-500 dark:text-neutral-400">
            Loading workspace…
          </p>
        </div>
      </div>
    </div>
  );
}
