"use client";

import * as React from "react";

import { PhoneCountryPicker } from "@/components/landing/phone-country-picker";
import { SmsConsentBlock } from "@/components/landing/sms-consent-block";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const fontUi = "font-[Arial,Helvetica,sans-serif]";

/**
 * Public visual of the Fortuna SMS opt-in UI for Twilio A2P reviewers.
 * Mirrors the Register / request-access contact step (phone + optional consent).
 */
export function SmsOptInProofForm() {
  const [phoneCountryIso2, setPhoneCountryIso2] = React.useState("US");
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [smsOptIn, setSmsOptIn] = React.useState(false);

  return (
    <div className="space-y-5">
      <div>
        <label
          className={cn(
            fontUi,
            "mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#101217]",
          )}
          htmlFor="sms-opt-in-mobile"
        >
          Mobile number
        </label>
        <div className="flex min-h-10 items-stretch border border-[#b9764a55] bg-white focus-within:ring-2 focus-within:ring-[#a84d0b]/30">
          <PhoneCountryPicker
            value={phoneCountryIso2}
            onChange={setPhoneCountryIso2}
          />
          <Input
            id="sms-opt-in-mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="National number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className={cn(
              fontUi,
              "h-auto min-h-10 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0",
            )}
          />
        </div>
      </div>

      <SmsConsentBlock checked={smsOptIn} onCheckedChange={setSmsOptIn} />

      <p className={cn(fontUi, "text-[11px] leading-relaxed text-neutral-500")}>
        This page shows the SMS consent controls used on Fortuna Global Holdings
        registration. To submit a full access request, use{" "}
        <a
          href="/register"
          className="font-semibold text-[#a84d0b] underline underline-offset-2"
        >
          Register Now
        </a>
        .
      </p>
    </div>
  );
}
