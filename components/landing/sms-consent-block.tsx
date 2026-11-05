"use client";

import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const fontUi = "font-[Arial,Helvetica,sans-serif]";

/** Shared Twilio-facing SMS disclosure + optional unchecked consent checkbox. */
export function SmsConsentBlock({
  checked,
  onCheckedChange,
  id = "sms-opt-in",
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  id?: string;
}) {
  return (
    <div className="space-y-3 border border-[#b9764a40] bg-white/80 p-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          className="mt-0.5 rounded-none border-[#a84d0b] data-[state=checked]:bg-[#a84d0b] data-[state=checked]:text-white"
        />
        <label
          htmlFor={id}
          className={cn(fontUi, "cursor-pointer text-sm leading-relaxed text-[#101217]")}
        >
          I agree to receive SMS messages from Fortuna Global Holdings about
          Client Portal onboarding and account support. Message frequency varies.
          Message and data rates may apply. Reply STOP to cancel, HELP for help.
          Consent is not a condition of purchase.
        </label>
      </div>
      <p className={cn(fontUi, "text-[11px] leading-relaxed text-neutral-600")}>
        See our{" "}
        <Link
          href="/privacy-policy"
          className="font-semibold text-[#a84d0b] underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/terms-and-conditions"
          className="font-semibold text-[#a84d0b] underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms &amp; Conditions
        </Link>
        . We do not sell or share your SMS opt-in data or personal information
        with third parties for marketing purposes.
      </p>
    </div>
  );
}
