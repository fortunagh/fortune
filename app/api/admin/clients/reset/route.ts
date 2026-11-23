import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { resetOnboardingData } from "@/lib/onboarding/case";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const bodySchema = z.object({
  userId: z.string().uuid(),
  confirmEmail: z.string().email(),
  /** When false, keep payments/agreements/notifications. Default true. */
  clearRelatedData: z.boolean().optional(),
  requiresOnboardingFee: z.boolean().optional(),
});

/**
 * Soft wipe: keep Auth login, rebuild onboarding from step 1/2.
 * Use hard wipe (/api/admin/clients/wipe) to delete the account entirely.
 */
export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { userId, confirmEmail, clearRelatedData, requiresOnboardingFee } =
    parsed.data;
  const confirm = confirmEmail.trim().toLowerCase();

  if (userId === session.user.id) {
    return NextResponse.json(
      { error: "You cannot reset your own admin account" },
      { status: 400 },
    );
  }

  const admin = createServiceRoleClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "admin") {
    return NextResponse.json(
      { error: "Cannot reset an admin account" },
      { status: 400 },
    );
  }

  const { data: authData, error: authLookupErr } =
    await admin.auth.admin.getUserById(userId);
  if (authLookupErr || !authData.user) {
    return NextResponse.json(
      { error: authLookupErr?.message || "User not found" },
      { status: 404 },
    );
  }

  const email = (authData.user.email ?? "").trim().toLowerCase();
  if (!email || email !== confirm) {
    return NextResponse.json(
      {
        error:
          "Confirm email does not match this client. Type the exact email to reset.",
      },
      { status: 400 },
    );
  }

  try {
    const caseRow = await resetOnboardingData(admin, userId, {
      clearRelatedData: clearRelatedData !== false,
      requiresOnboardingFee,
    });

    await admin.from("audit_log").insert({
      actor_id: session.user.id,
      entity_type: "onboarding_cases",
      entity_id: caseRow.id,
      action: "admin_reset_onboarding_data",
      from_status: "active",
      to_status: "active",
      meta: {
        userId,
        email,
        clearRelatedData: clearRelatedData !== false,
        requiresOnboardingFee:
          requiresOnboardingFee ?? caseRow.requires_onboarding_fee !== false,
        currentStepKey: caseRow.current_step_key,
      },
    });

    return NextResponse.json({
      ok: true,
      caseId: caseRow.id,
      currentStepKey: caseRow.current_step_key,
    });
  } catch (e) {
    console.error("admin reset onboarding", e);
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Reset failed",
      },
      { status: 500 },
    );
  }
}
