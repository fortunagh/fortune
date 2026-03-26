import { cn } from "@/lib/utils";

/** Card on hero-style background (light, readable) */
export const authCardClass = cn(
  "border-[#e5dcc4]/90 bg-white/95 text-left text-neutral-900 shadow-[0_1px_0_rgba(0,0,0,0.04)]",
);

export const authCardTitleClass = cn(
  "text-[#111111]",
);

export const authCardDescriptionClass = cn(
  "text-neutral-600",
);

export const authFooterLineClass = cn(
  "text-left text-sm text-neutral-600",
);

export const authLinkClass = cn(
  "font-['Engravers_MT',sans-serif] text-sm text-neutral-800 underline-offset-4 hover:text-neutral-950 hover:underline",
);

export const authLabelClass = cn(
  "text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-800",
);

export const authInputClass = cn(
  "text-left border-neutral-200/90 focus-visible:border-amber-600/40 focus-visible:ring-amber-700/25",
);

export const authErrorTextClass = cn("text-left text-sm text-red-600");
