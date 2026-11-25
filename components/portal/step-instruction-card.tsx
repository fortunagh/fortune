import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { getStepCopy } from "@/lib/onboarding/step-copy";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VpsVideoPlayer } from "@/components/portal/vps-video-player";

export function StepInstructionCard({
  stepKey,
  className,
  vpsVideoUrl,
}: {
  stepKey: string;
  className?: string;
  /** Prefer Resources external_url when set (Admin → Content). */
  vpsVideoUrl?: string | null;
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
        <VpsVideoPlayer src={vpsVideoUrl} />
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
