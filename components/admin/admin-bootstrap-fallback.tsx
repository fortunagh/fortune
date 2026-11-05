import { AdminChromeSkeleton } from "@/components/admin/admin-skeletons";

/** First paint while admin session + shell resolve — skeleton + centered spinner */
export function AdminBootstrapFallback() {
  return (
    <div className="relative min-h-[100dvh] w-full">
      <AdminChromeSkeleton />
      <div className="absolute inset-0 flex items-center justify-center bg-[#f7f6f2]/75 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-8 py-6 shadow-[0_12px_40px_rgba(16,18,23,0.08)]">
          <div className="relative h-11 w-11">
            <div
              className="absolute inset-0 rounded-full border-2 border-neutral-200"
              aria-hidden
            />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#a8842a] border-r-[#a8842a]/40" />
          </div>
          <p className="text-xs font-medium tracking-wide text-neutral-500">
            Loading workspace…
          </p>
        </div>
      </div>
    </div>
  );
}
