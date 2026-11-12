"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function AdminPagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function go(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-2">
      <p className="text-xs text-neutral-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => go(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
