import { cn } from "@/lib/utils";

/** Premium auth card — matches mockup floating panel */
export const authCardClass = cn(
  "rounded-2xl border border-black/[0.06] bg-white text-left text-neutral-900 shadow-[var(--portal-shadow)]",
);

export const authCardTitleClass = cn(
  "font-display text-2xl font-normal tracking-tight text-neutral-950 sm:text-[1.75rem]",
);

export const authCardDescriptionClass = cn(
  "text-sm leading-relaxed text-neutral-500",
);

export const authFooterLineClass = cn(
  "text-center text-sm text-neutral-500",
);

export const authLinkClass = cn(
  "text-sm font-medium text-[#b8922e] underline-offset-4 transition-colors hover:text-[#9a7a22] hover:underline",
);

export const authLabelClass = cn(
  "text-left text-sm font-medium text-neutral-700",
);

export const authInputClass = cn(
  "h-11 rounded-xl border-neutral-200 bg-neutral-50/80 text-left text-sm shadow-none placeholder:text-neutral-400 focus-visible:border-[#c59d3f]/50 focus-visible:bg-white focus-visible:ring-[#c59d3f]/25",
);

export const authErrorTextClass = cn("text-left text-sm text-red-600");
