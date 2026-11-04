"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";

type Broker = { id: string; name: string };

export function QuestionnaireForm({ brokers }: { brokers: Broker[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [matched, setMatched] = React.useState<string[] | null>(null);

  const [form, setForm] = React.useState({
    accountOpeningMethod: "",
    entityType: "",
    countryOfIncorporation: "",
    ultimateBeneficialOwner: "",
    multipleUbos: false,
    uboCount: "1",
    taxResidencyCountry: "",
    passportIssuingCountry: "",
    residencyDocumentCountries: "",
    canProvideProofOfAddress: false,
    chosenBrokerId: "",
    chosenEaKey: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountOpeningMethod: form.accountOpeningMethod,
          entityType: form.entityType,
          countryOfIncorporation: form.countryOfIncorporation || null,
          ultimateBeneficialOwner: form.ultimateBeneficialOwner,
          multipleUbos: form.multipleUbos,
          uboCount: form.multipleUbos ? Number(form.uboCount) : 1,
          taxResidencyCountry: form.taxResidencyCountry,
          passportIssuingCountry: form.passportIssuingCountry,
          residencyDocumentCountries: form.residencyDocumentCountries
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          canProvideProofOfAddress: form.canProvideProofOfAddress,
          chosenBrokerId: form.chosenBrokerId || null,
          chosenEaKey: form.chosenEaKey || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submit failed");
      setMatched(json.matchedBrokerIds ?? []);
      router.refresh();
      if (json.reviewStatus !== "needs_review") {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn(fortunaUiClass, "space-y-5")}>
      <Field label="How will you open the account?">
        <Select
          value={form.accountOpeningMethod}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, accountOpeningMethod: v }))
          }
        >
          <SelectTrigger className="rounded-none">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="trust">Trust</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Entity type">
        <Input
          className="rounded-none"
          value={form.entityType}
          onChange={(e) => setForm((f) => ({ ...f, entityType: e.target.value }))}
          required
        />
      </Field>

      <Field label="Country of incorporation (if applicable)">
        <Input
          className="rounded-none"
          value={form.countryOfIncorporation}
          onChange={(e) =>
            setForm((f) => ({ ...f, countryOfIncorporation: e.target.value }))
          }
        />
      </Field>

      <Field label="Ultimate beneficial owner">
        <Input
          className="rounded-none"
          value={form.ultimateBeneficialOwner}
          onChange={(e) =>
            setForm((f) => ({ ...f, ultimateBeneficialOwner: e.target.value }))
          }
          required
        />
      </Field>

      <div className="flex items-center gap-2">
        <Checkbox
          id="multipleUbos"
          checked={form.multipleUbos}
          onCheckedChange={(c) =>
            setForm((f) => ({ ...f, multipleUbos: c === true }))
          }
        />
        <Label htmlFor="multipleUbos">More than one UBO</Label>
      </div>

      {form.multipleUbos ? (
        <Field label="How many UBOs?">
          <Input
            className="rounded-none"
            type="number"
            min={2}
            value={form.uboCount}
            onChange={(e) => setForm((f) => ({ ...f, uboCount: e.target.value }))}
          />
        </Field>
      ) : null}

      <Field label="Country of tax residency">
        <Input
          className="rounded-none"
          value={form.taxResidencyCountry}
          onChange={(e) =>
            setForm((f) => ({ ...f, taxResidencyCountry: e.target.value }))
          }
          required
        />
      </Field>

      <Field label="Passport issuing country">
        <Input
          className="rounded-none"
          value={form.passportIssuingCountry}
          onChange={(e) =>
            setForm((f) => ({ ...f, passportIssuingCountry: e.target.value }))
          }
          required
        />
      </Field>

      <Field label="Countries for which residency documents are available (comma-separated)">
        <Input
          className="rounded-none"
          value={form.residencyDocumentCountries}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              residencyDocumentCountries: e.target.value,
            }))
          }
        />
      </Field>

      <div className="flex items-center gap-2">
        <Checkbox
          id="poa"
          checked={form.canProvideProofOfAddress}
          onCheckedChange={(c) =>
            setForm((f) => ({ ...f, canProvideProofOfAddress: c === true }))
          }
        />
        <Label htmlFor="poa">I can provide proof of residential address</Label>
      </div>

      {brokers.length > 0 ? (
        <Field label="Preferred broker (if known)">
          <Select
            value={form.chosenBrokerId}
            onValueChange={(v) => setForm((f) => ({ ...f, chosenBrokerId: v }))}
          >
            <SelectTrigger className="rounded-none">
              <SelectValue placeholder="Select broker" />
            </SelectTrigger>
            <SelectContent>
              {brokers.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}

      <Field label="EA interest (Gravity / Source 55 / Tourbillion X)">
        <Select
          value={form.chosenEaKey}
          onValueChange={(v) => setForm((f) => ({ ...f, chosenEaKey: v }))}
        >
          <SelectTrigger className="rounded-none">
            <SelectValue placeholder="Select EA" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gravity">Gravity</SelectItem>
            <SelectItem value="source_55">Source 55</SelectItem>
            <SelectItem value="tourbillion_x">Tourbillion X</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {matched && matched.length === 0 ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          No automatic broker match — Fortuna will review your answers.
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" variant="fortuna" disabled={busy}>
        {busy ? "Submitting…" : "Submit questionnaire"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.12em]">
        {label}
      </Label>
      {children}
    </div>
  );
}
