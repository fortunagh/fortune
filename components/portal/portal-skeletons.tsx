import { Skeleton } from "@/components/ui/skeleton";

/** Full customer portal chrome + home grid silhouette */
export function CustomerDashboardSkeleton() {
  return (
    <div className="flex min-h-[100dvh] w-full bg-[#f7f6f2] text-neutral-950">
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-black/[0.06] bg-white px-3 py-4 lg:flex">
        <Skeleton className="mb-8 ml-2 h-8 w-36 rounded-md" />
        <div className="flex flex-1 flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`nav-${i}`} className="h-11 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-auto h-14 w-full rounded-xl" />
      </aside>

      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-black/[0.06] px-4 sm:px-6">
          <Skeleton className="h-10 w-10 rounded-xl lg:hidden" />
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="ml-auto hidden h-10 w-56 rounded-full md:block" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </header>

        <div className="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 max-w-full rounded-md" />
            <Skeleton className="h-4 w-80 max-w-full rounded-md" />
          </div>
          <Skeleton className="h-3 w-full max-w-xl rounded-full" />
          <Skeleton className="h-28 w-full rounded-2xl border border-black/[0.04] bg-white" />
          <div className="grid gap-4 lg:grid-cols-12">
            <Skeleton className="h-72 rounded-2xl border border-black/[0.04] bg-white lg:col-span-3" />
            <Skeleton className="h-72 rounded-2xl border border-black/[0.04] bg-white lg:col-span-5" />
            <Skeleton className="h-72 rounded-2xl border border-black/[0.04] bg-white lg:col-span-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Content-only skeleton inside an already-mounted PortalShell */
export function CustomerMainSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 max-w-full rounded-md" />
        <Skeleton className="h-4 w-72 max-w-full rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-36 rounded-2xl border border-black/[0.04] bg-white" />
        <Skeleton className="h-36 rounded-2xl border border-black/[0.04] bg-white" />
        <Skeleton className="h-36 rounded-2xl border border-black/[0.04] bg-white sm:col-span-2 lg:col-span-1" />
      </div>
    </div>
  );
}
