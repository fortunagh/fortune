import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { getCaseForUser } from "@/lib/onboarding/case";
import { completeStep } from "@/lib/onboarding/transition";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const bodySchema = z.object({
  accountOpeningMethod: z.string().min(1),
  entityType: z.string().min(1),
  countryOfIncorporation: z.string().optional().nullable(),
  ultimateBeneficialOwner: z.string().min(1),
  multipleUbos: z.boolean(),
  uboCount: z.number().int().min(1).optional().nullable(),
  taxResidencyCountry: z.string().min(1),
  passportIssuingCountry: z.string().min(1),
  residencyDocumentCountries: z.array(z.string()).default([]),
  canProvideProofOfAddress: z.boolean(),
  chosenBrokerId: z.string().uuid().optional().nullable(),
  chosenEaKey: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { caseRow } = await getCaseForUser(supabase, session.user.id);
  if (!caseRow) {
    return NextResponse.json({ error: "No onboarding case" }, { status: 404 });
  }

  const v = parsed.data;
  const answers = {
    account_opening_method: v.accountOpeningMethod,
    entity_type: v.entityType,
    country_of_incorporation: v.countryOfIncorporation,
    ultimate_beneficial_owner: v.ultimateBeneficialOwner,
    multiple_ubos: v.multipleUbos,
    ubo_count: v.uboCount,
    tax_residency_country: v.taxResidencyCountry,
    passport_issuing_country: v.passportIssuingCountry,
    residency_document_countries: v.residencyDocumentCountries,
    can_provide_proof_of_address: v.canProvideProofOfAddress,
  };

  // Match brokers via eligibility rules (simple AND on rule keys)
  const { data: rules } = await supabase
    .from("eligibility_rules")
    .select("*, brokers(*)")
    .eq("active", true);

  const matched: string[] = [];
  for (const rule of rules ?? []) {
    const r = (rule.rule ?? {}) as Record<string, unknown>;
    let ok = true;
    for (const [k, expected] of Object.entries(r)) {
      const actual = (answers as Record<string, unknown>)[k];
      if (expected !== actual) {
        ok = false;
        break;
      }
    }
    if (ok) matched.push(rule.broker_id as string);
  }

  const reviewStatus =
    matched.length === 0
      ? "needs_review"
      : matched.length === 1
        ? "matched"
        : "matched";

  const { error } = await supabase.from("questionnaire_responses").upsert(
    {
      user_id: session.user.id,
      case_id: caseRow.id,
      account_opening_method: v.accountOpeningMethod,
      entity_type: v.entityType,
      country_of_incorporation: v.countryOfIncorporation,
      ultimate_beneficial_owner: v.ultimateBeneficialOwner,
      multiple_ubos: v.multipleUbos,
      ubo_count: v.uboCount,
      tax_residency_country: v.taxResidencyCountry,
      passport_issuing_country: v.passportIssuingCountry,
      residency_document_countries: v.residencyDocumentCountries,
      can_provide_proof_of_address: v.canProvideProofOfAddress,
      chosen_broker_id: v.chosenBrokerId ?? matched[0] ?? null,
      chosen_ea_key: v.chosenEaKey,
      answers,
      review_status: reviewStatus,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const admin = createServiceRoleClient();
  const result = await completeStep({
    admin,
    userId: session.user.id,
    stepKey: "questionnaire",
    source: "client",
    payload: { matched_broker_ids: matched, review_status: reviewStatus },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });
  }

  return NextResponse.json({
    ok: true,
    matchedBrokerIds: matched,
    reviewStatus,
  });
}
