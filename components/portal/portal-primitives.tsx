import { cn } from "@/lib/utils";
import {
  fortunaBodyClass,
  fortunaDisplayClass,
  fortunaUiClass,
} from "@/lib/fonts/fortuna";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        fortunaUiClass,
        "text-[11px] font-semibold uppercase tracking-[0.18em] text-primary",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function BronzeRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("h-px w-10 bg-primary", className)}
    />
  );
}

export function PortalTitle({
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
        "text-3xl leading-tight tracking-tight text-foreground sm:text-4xl",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function PortalSubtitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        fortunaBodyClass,
        "text-base leading-relaxed text-muted-foreground sm:text-lg",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function PortalCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-border bg-card text-card-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PortalEmpty({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <PortalCard className="px-6 py-10 text-center">
      <Eyebrow>Fortuna</Eyebrow>
      <p className={cn(fortunaDisplayClass, "mt-3 text-xl")}>{title}</p>
      {description ? (
        <p className={cn(fortunaUiClass, "mt-2 text-sm text-muted-foreground")}>
          {description}
        </p>
      ) : null}
    </PortalCard>
  );
}

export function NoticeBlock({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "warning";
}) {
  return (
    <div
      className={cn(
        fortunaUiClass,
        "border px-4 py-3 text-sm leading-relaxed",
        variant === "warning"
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      {children}
    </div>
  );
}
