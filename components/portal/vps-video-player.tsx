"use client";

import * as React from "react";
import { ExternalLink, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEFAULT_LINKS } from "@/lib/onboarding/steps";
import { cn } from "@/lib/utils";

function resolveVideoUrl(preferred?: string | null) {
  const raw = (preferred || DEFAULT_LINKS.vpsVideo).trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  if (typeof window !== "undefined") {
    return new URL(raw, window.location.origin).toString();
  }
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.fortunaglobalholdings.com";
  return `${site}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

/**
 * VPS setup video — absolute URL + open-in-new-tab fallback.
 * Large mp4 embeds can sit black until metadata loads; the Open button always works.
 */
export function VpsVideoPlayer({
  src,
  className,
}: {
  src?: string | null;
  className?: string;
}) {
  const url = resolveVideoUrl(src);
  const [failed, setFailed] = React.useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-neutral-500">VPS setup video</p>
        <Button asChild size="sm" variant="outline" className="rounded-xl">
          <a href={url} target="_blank" rel="noreferrer">
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Open video
            <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-60" />
          </a>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-black">
        {failed ? (
          <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-neutral-950 px-4 text-center">
            <p className="text-sm text-neutral-300">
              The in-page player could not load this video. Use Open video
              instead.
            </p>
            <Button asChild variant="fortuna" size="sm" className="rounded-xl">
              <a href={url} target="_blank" rel="noreferrer">
                Watch in a new tab
              </a>
            </Button>
          </div>
        ) : (
          <video
            key={url}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full bg-black"
            onError={() => setFailed(true)}
          >
            <source src={url} type="video/mp4" />
            Your browser does not support embedded video.{" "}
            <a href={url} className="underline">
              Open the VPS setup video
            </a>
            .
          </video>
        )}
      </div>
    </div>
  );
}
