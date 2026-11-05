import { Skeleton } from "@/components/ui/skeleton";

/** Full admin chrome skeleton (first paint while auth + shell resolve) */
export function AdminChromeSkeleton() {
  return (
    <div className="flex min-h-[100dvh] w-full bg-[#f7f6f2] text-neutral-950">
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-black/[0.06] bg-white px-3 py-4 md:flex">
        <Skeleton className="mb-8 ml-2 h-8 w-36 rounded-md" />
        <div className="flex flex-1 flex-col gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`admin-nav-${i}`} className="h-11 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-auto h-10 w-full rounded-xl" />
      </aside>
      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-black/[0.06] bg-[#f7f6f2] px-4 sm:px-6">
          <Skeleton className="h-10 w-10 rounded-xl md:hidden" />
          <Skeleton className="h-6 w-48 max-w-full rounded-md" />
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 max-w-full rounded-md" />
            <Skeleton className="h-4 w-72 max-w-full rounded-md" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-2xl border border-black/[0.04] bg-white" />
            <Skeleton className="h-28 rounded-2xl border border-black/[0.04] bg-white" />
            <Skeleton className="h-28 rounded-2xl border border-black/[0.04] bg-white" />
            <Skeleton className="h-28 rounded-2xl border border-black/[0.04] bg-white" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl border border-black/[0.04] bg-white" />
            <Skeleton className="h-64 rounded-2xl border border-black/[0.04] bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Main content area only (route `loading.tsx` while navigating) */
export function AdminMainSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 max-w-full rounded-md" />
        <Skeleton className="h-4 w-80 max-w-full rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-2xl border border-black/[0.04] bg-white" />
        <Skeleton className="h-28 rounded-2xl border border-black/[0.04] bg-white" />
        <Skeleton className="h-28 rounded-2xl border border-black/[0.04] bg-white" />
        <Skeleton className="h-28 rounded-2xl border border-black/[0.04] bg-white" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl border border-black/[0.04] bg-white" />
        <Skeleton className="h-64 rounded-2xl border border-black/[0.04] bg-white" />
      </div>
    </div>
  );
}

/** Table-heavy route placeholder */
export function AdminTableSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-md" />
        <Skeleton className="h-4 w-full max-w-md rounded-md" />
      </div>
      <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`row-${i}`} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use CustomerDashboardSkeleton from portal-skeletons */
export { CustomerDashboardSkeleton } from "@/components/portal/portal-skeletons";
