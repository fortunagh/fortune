import { Skeleton } from "@/components/ui/skeleton";

/** Full admin chrome skeleton (first paint while auth + shell resolve) */
export function AdminChromeSkeleton() {
  return (
    <div className="flex min-h-svh w-full bg-neutral-50 dark:bg-neutral-950">
      <aside className="hidden h-svh w-64 shrink-0 flex-col border-r border-neutral-200 bg-white p-3 md:flex dark:border-neutral-800 dark:bg-neutral-900">
        <Skeleton className="mx-auto h-9 w-28 rounded-md" />
        <div className="mt-6 flex flex-1 flex-col gap-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
      </aside>
      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900 md:px-6">
          <Skeleton className="h-10 w-10 shrink-0 rounded-md md:hidden" />
          <Skeleton className="h-5 w-32" />
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 max-w-full" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl sm:col-span-2 lg:col-span-1" />
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
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-36 rounded-xl border border-neutral-100 dark:border-neutral-800" />
        <Skeleton className="h-36 rounded-xl border border-neutral-100 dark:border-neutral-800" />
        <Skeleton className="h-36 rounded-xl border border-neutral-100 sm:col-span-2 lg:col-span-1 dark:border-neutral-800" />
      </div>
    </div>
  );
}

/** Table-heavy route placeholder */
export function AdminTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`row-${i}`} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Customer `/dashboard` loading */
export function CustomerDashboardSkeleton() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-16">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[85%]" />
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  );
}
