import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { getStepCopy } from "@/lib/onboarding/step-copy";
import { DEFAULT_LINKS } from "@/lib/onboarding/steps";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function StepInstructionCard({
  stepKey,
  className,
}: {
  stepKey: string;
  className?: string;
}) {
  const copy = getStepCopy(stepKey);
  if (!copy) return null;

  return (
    <div className={cn(fortunaUiClass, "space-y-4 text-sm leading-relaxed text-neutral-700", className)}>
      {copy.portalParagraphs.map((p) => (
        <p key={p.slice(0, 48)}>{p}</p>
      ))}

      {copy.portalBullets?.length ? (
        <ul className="list-disc space-y-1.5 pl-5 text-neutral-700">
          {copy.portalBullets.map((b) => (
            <li key={b.slice(0, 40)}>{b}</li>
          ))}
        </ul>
      ) : null}

      {copy.portalNote ? (
        <div className="rounded-xl border border-[#c59d3f]/35 bg-[hsl(var(--portal-gold-soft))] px-4 py-3 text-sm text-neutral-800">
          <strong className="font-semibold text-neutral-950">Important. </strong>
          {copy.portalNote}
        </div>
      ) : null}

      {stepKey === "vps_setup" ? (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-black/5">
          <video
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full bg-black"
            src={DEFAULT_LINKS.vpsVideo}
          >
            Your browser does not support embedded video.{" "}
            <a href={DEFAULT_LINKS.vpsVideo} className="underline">
              Open the VPS setup video
            </a>
            .
          </video>
        </div>
      ) : null}

      {copy.links?.length ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {copy.links.map((link) => (
            <Button key={link.href + link.label} asChild variant="outline" size="sm" className="rounded-xl">
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
                <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-60" />
              </a>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function StepSupportLink({ stepKey }: { stepKey: string }) {
  return (
    <Button asChild variant="outline" size="default" className="rounded-xl">
      <Link href={`/dashboard/support?step=${encodeURIComponent(stepKey)}`}>
        I need help
      </Link>
    </Button>
  );
}
