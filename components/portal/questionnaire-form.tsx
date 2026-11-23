"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";
import { useNavProgress } from "@/components/portal/navigation-progress";

type Broker = { id: string; name: string };

/**
 * Fields aligned to Fortuna_Onboarding_Questionnaire.pdf (7 questions).
 * No EA selection here — that belongs on the demo licence apply step.
 */
export function QuestionnaireForm({ brokers }: { brokers: Broker[] }) {
  const router = useRouter();
  const { start: startNav, done: doneNav } = useNavProgress();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [matched, setMatched] = React.useState<string[] | null>(null);
  const inflight = React.useRef(false);

  const [form, setForm] = React.useState({
    accountOpeningMethod: "",
    entityType: "",
    countryOfIncorporation: "",
    ultimateBeneficialOwner: "",
    multipleUbos: "no",
    uboCount: "1",
    taxResidencyCountry: "",
    passportIssuingCountry: "",
    residencyDocumentCountries: "",
    canProvideProofOfAddress: "",
    chosenBrokerId: "",
  });

  const isEntity =
    form.accountOpeningMethod === "company" ||
    form.accountOpeningMethod === "trust" ||
    form.accountOpeningMethod === "entity";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inflight.current) return;
    inflight.current = true;
    setBusy(true);
    setError(null);
    try {
      const multipleUbos = form.multipleUbos === "yes";
      const res = await fetch("/api/onboarding/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountOpeningMethod: form.accountOpeningMethod,
          entityType: isEntity
            ? form.entityType || form.accountOpeningMethod
            : "individual",
          countryOfIncorporation: isEntity
            ? form.countryOfIncorporation || null
            : "Not applicable",
          ultimateBeneficialOwner:
            form.accountOpeningMethod === "individual"
              ? form.ultimateBeneficialOwner || "Individual account"
              : form.ultimateBeneficialOwner,
          multipleUbos,
          uboCount: multipleUbos ? Number(form.uboCount) : 1,
          taxResidencyCountry: form.taxResidencyCountry,
          passportIssuingCountry: form.passportIssuingCountry,
          residencyDocumentCountries: form.residencyDocumentCountries
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          canProvideProofOfAddress: form.canProvideProofOfAddress === "yes",
          chosenBrokerId: form.chosenBrokerId || null,
          chosenEaKey: null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submit failed");
      setMatched(json.matchedBrokerIds ?? []);
      if (json.reviewStatus !== "needs_review") {
        startNav();
        const next =
          typeof json.nextStepKey === "string" ? json.nextStepKey : "vps_setup";
        router.push(`/dashboard/steps/${next}`);
        router.refresh();
        return;
      }
      router.refresh();
    } catch (err) {
      doneNav();
      setError(err instanceof Error ? err.message : "Submit failed");
      setBusy(false);
      inflight.current = false;
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn(fortunaUiClass, "space-y-6")}>
      <p className="text-sm leading-relaxed text-neutral-600">
        Provide country information and confirm document availability only. Your
        broker will collect identification documents and address evidence
        directly. Do not enter document numbers, full residential addresses, or
        upload files here.
      </p>

      <Field
        label="01 Account structure"
        hint="Will you open the broker account as an individual or through an entity? If using an entity, describe its structure (company or trust)."
      >
        <Select
          value={form.accountOpeningMethod || undefined}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, accountOpeningMethod: v }))
          }
          required
        >
          <SelectTrigger className="rounded-xl border-[#c59d3f]/70">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent position="popper" className="z-[300]">
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="trust">Trust</SelectItem>
            <SelectItem value="entity">Other entity</SelectItem>
          </SelectContent>
        </Select>
        {isEntity ? (
          <Textarea
            className="mt-2 rounded-xl"
            placeholder="Describe the entity structure (e.g. company, trust)"
            value={form.entityType}
            onChange={(e) =>
              setForm((f) => ({ ...f, entityType: e.target.value }))
            }
            required
          />
        ) : null}
      </Field>

      <Field
        label="02 Country of incorporation or establishment"
        hint='If using an entity, in which country is it legally incorporated or established? If opening an individual account, write “Not applicable”.'
      >
        <Input
          className="rounded-xl"
          value={
            form.accountOpeningMethod === "individual"
              ? "Not applicable"
              : form.countryOfIncorporation
          }
          disabled={form.accountOpeningMethod === "individual"}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              countryOfIncorporation: e.target.value,
            }))
          }
          required={isEntity}
        />
      </Field>

      <Field
        label="03 Ultimate beneficial ownership"
        hint='Who is the UBO of the proposed entity account? Is there more than one? If yes, state how many. For an individual account, write “Individual account”.'
      >
        <Input
          className="rounded-xl"
          value={
            form.accountOpeningMethod === "individual"
              ? "Individual account"
              : form.ultimateBeneficialOwner
          }
          disabled={form.accountOpeningMethod === "individual"}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              ultimateBeneficialOwner: e.target.value,
            }))
          }
          required={isEntity}
        />
        {isEntity ? (
          <div className="mt-3 space-y-2">
            <Label className="text-xs text-neutral-500">More than one UBO?</Label>
            <div className="flex gap-3" role="radiogroup" aria-label="More than one UBO">
              {(
                [
                  { value: "no", label: "No" },
                  { value: "yes", label: "Yes" },
                ] as const
              ).map((opt) => {
                const selected = form.multipleUbos === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() =>
                      setForm((f) => ({ ...f, multipleUbos: opt.value }))
                    }
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                      selected
                        ? "border-[#c59d3f] bg-[hsl(var(--portal-gold-soft))] text-[#8a6d1f]"
                        : "border-neutral-200 bg-white text-neutral-800 hover:border-[#c59d3f]/50",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {form.multipleUbos === "yes" ? (
              <Input
                className="rounded-xl"
                type="number"
                min={2}
                value={form.uboCount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, uboCount: e.target.value }))
                }
                placeholder="How many UBOs?"
                required
              />
            ) : null}
          </div>
        ) : null}
      </Field>

      <Field
        label="04 Country of tax residency"
        hint="What is your country of tax residency? If you have more than one, list each country."
      >
        <Input
          className="rounded-xl"
          value={form.taxResidencyCountry}
          onChange={(e) =>
            setForm((f) => ({ ...f, taxResidencyCountry: e.target.value }))
          }
          required
        />
      </Field>

      <Field
        label="05 Passport issuing country"
        hint="Which country issued your passport? If you hold more than one, list the issuing countries. For an entity, identify the issuing country for each UBO where applicable."
      >
        <Input
          className="rounded-xl"
          value={form.passportIssuingCountry}
          onChange={(e) =>
            setForm((f) => ({ ...f, passportIssuingCountry: e.target.value }))
          }
          required
        />
      </Field>

      <Field
        label="06 Residency documents available"
        hint="Do you hold residency documents? If yes, which country or countries are they for? Separate multiple countries with commas."
      >
        <Input
          className="rounded-xl"
          value={form.residencyDocumentCountries}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              residencyDocumentCountries: e.target.value,
            }))
          }
          placeholder="e.g. Australia, United Arab Emirates"
        />
      </Field>

      <Field
        label="07 Proof of residential address"
        hint="Can you provide current proof of your residential address directly to your broker? Yes / No."
      >
        <div
          className="flex gap-3"
          role="radiogroup"
          aria-label="Proof of residential address"
        >
          {(
            [
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ] as const
          ).map((opt) => {
            const selected = form.canProvideProofOfAddress === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    canProvideProofOfAddress: opt.value,
                  }))
                }
                className={cn(
                  "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                  selected
                    ? "border-[#c59d3f] bg-[hsl(var(--portal-gold-soft))] text-[#8a6d1f]"
                    : "border-neutral-200 bg-white text-neutral-800 hover:border-[#c59d3f]/50",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {/* Native required control for form validation */}
        <input
          tabIndex={-1}
          className="sr-only"
          required
          value={form.canProvideProofOfAddress}
          onChange={() => undefined}
        />
      </Field>

      {brokers.length > 0 ? (
        <Field
          label="Preferred broker (optional)"
          hint="If you already know which approved broker you prefer, select it. Otherwise leave blank."
        >
          <Select
            value={form.chosenBrokerId || "__none__"}
            onValueChange={(v) =>
              setForm((f) => ({
                ...f,
                chosenBrokerId: v === "__none__" ? "" : v,
              }))
            }
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select broker" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[300]">
              <SelectItem value="__none__">No preference yet</SelectItem>
              {brokers.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}

      {matched && matched.length === 0 ? (
        <p className="text-sm text-amber-800">
          No automatic broker match — Fortuna will review your answers and
          follow up with available options.
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" variant="fortuna" disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {busy ? "Submitting…" : "Submit questionnaire"}
      </Button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.12em]">
        {label}
      </Label>
      {hint ? <p className="text-xs leading-relaxed text-neutral-500">{hint}</p> : null}
      {children}
    </div>
  );
}
