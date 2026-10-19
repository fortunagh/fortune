"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyUrlButtonProps = {
  url: string;
};

export function CopyUrlButton({ url }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center rounded-md p-1.5 text-neutral-500 transition hover:bg-black/5 hover:text-[#a84d0b]"
      aria-label={copied ? "Copied" : "Copy registration URL"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-[#a84d0b]" strokeWidth={2.25} />
      ) : (
        <Copy className="h-4 w-4" strokeWidth={2} />
      )}
    </button>
  );
}
