import { cn } from "@/lib/utils";
import {
  fortunaDisplayClass,
  fortunaUiClass,
} from "@/lib/fonts/fortuna";

export function WidgetCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/[0.05] bg-white p-5 shadow-[0_10px_40px_rgba(16,18,23,0.05)] sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PortalPageTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        fortunaDisplayClass,
        "text-3xl tracking-tight text-neutral-950 sm:text-4xl",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function PortalMuted({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn(fortunaUiClass, "text-sm text-neutral-500", className)}>
      {children}
    </p>
  );
}

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-neutral-100",
        className,
      )}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#d4af37,#c59d3f)] transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function InitialsAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`
      : (parts[0]?.slice(0, 2) ?? "FG");
  return (
    <span
      className={cn(
        fortunaUiClass,
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--portal-gold-soft))] text-xs font-semibold uppercase text-[#8a6d1f]",
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function SoftNotice({
  children,
  variant = "info",
  className,
}: {
  children: React.ReactNode;
  variant?: "info" | "warning" | "success";
  className?: string;
}) {
  return (
    <div
      className={cn(
        fortunaUiClass,
        "rounded-xl px-4 py-3 text-sm leading-relaxed",
        variant === "info" && "bg-neutral-50 text-neutral-700",
        variant === "warning" && "bg-amber-50 text-amber-950",
        variant === "success" && "bg-emerald-50 text-emerald-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      {eyebrow ? (
        <p
          className={cn(
            fortunaUiClass,
            "text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <PortalPageTitle className={eyebrow ? "mt-2" : undefined}>
        {title}
      </PortalPageTitle>
      {description ? (
        <PortalMuted className="mt-2 max-w-2xl">{description}</PortalMuted>
      ) : null}
    </div>
  );
}

export { fortunaDisplayClass, fortunaUiClass };
