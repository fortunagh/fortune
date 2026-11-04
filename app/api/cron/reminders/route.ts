import { NextResponse } from "next/server";

import { enqueueNextStepNotification } from "@/lib/notifications/enqueue";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "Misconfigured" }, { status: 500 });
  }

  const { data: rules } = await admin
    .from("reminder_rules")
    .select("*")
    .eq("enabled", true);

  let sent = 0;

  for (const rule of rules ?? []) {
    const delayMs = (rule.delay_hours as number) * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - delayMs).toISOString();

    const { data: states } = await admin
      .from("onboarding_step_states")
      .select("id, step_key, unlocked_at, case_id, status")
      .eq("step_key", rule.step_key)
      .in("status", ["available", "in_progress", "awaiting"])
      .lte("unlocked_at", cutoff);

    for (const state of states ?? []) {
      const { data: caseRow } = await admin
        .from("onboarding_cases")
        .select("user_id")
        .eq("id", state.case_id)
        .maybeSingle();
      if (!caseRow) continue;

      const idempotencyKey = `reminder:${state.id}:${rule.delay_hours}h`;
      const result = await enqueueNextStepNotification(admin, {
        userId: caseRow.user_id,
        stepKey: state.step_key,
        idempotencyKey,
        templateKey: rule.template_key,
      });
      if (!("skipped" in result && result.skipped)) sent += 1;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
