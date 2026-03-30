import { cn } from "@/lib/utils";
import Link from "next/link";

/** Wireframe globe / sphere mark — grayscale, pairs with wordmark */
export function AdminBrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M12 3.75v16.5M3.75 12h16.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <ellipse cx="12" cy="12" rx="8.25" ry="3.35" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="12" cy="12" rx="3.35" ry="8.25" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

const wordmarkShadow =
  "[text-shadow:0_0_1px_rgba(212,175,55,0.55),0_0_2px_rgba(184,134,11,0.22),0_0.5px_0_rgba(17,17,17,0.08)] dark:[text-shadow:0_0_1px_rgba(212,175,55,0.45),0_0_2px_rgba(212,175,55,0.12)]";

export function AdminSidebarBrand({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <Link
        href="/"
        className="flex justify-center py-1"
        title="Fortuna Global Holdings — home"
      >
        <AdminBrandMark className="h-7 w-7 text-neutral-500 dark:text-neutral-400" />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className="flex min-w-0 flex-1 items-start gap-2.5 pl-0.5 pr-1"
      title="Fortuna Global Holdings — home"
    >
      <AdminBrandMark className="mt-[3px] h-[18px] w-[18px] shrink-0 text-neutral-500 dark:text-neutral-400" />
      <div className="min-w-0 leading-[1.15]">
        <span
          className={cn(
            "block text-[12px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50",
            wordmarkShadow,
          )}
        >
          Fortuna Global
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[11px] font-medium tracking-tight text-neutral-700 dark:text-neutral-300",
            wordmarkShadow,
          )}
        >
          Holdings
        </span>
      </div>
    </Link>
  );
}
