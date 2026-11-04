import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { bootstrapOnboardingCase } from "@/lib/onboarding/case";
import { activateInvitation } from "@/lib/onboarding/invite";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const bodySchema = z.object({
  token: z.string().min(10).optional(),
});

export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown = {};
  try {
    json = await request.json();
  } catch {
    /* empty body ok */
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const admin = createServiceRoleClient();

  if (parsed.data.token) {
    const result = await activateInvitation({
      admin,
      token: parsed.data.token,
      userId: session.user.id,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  await bootstrapOnboardingCase(admin, session.user.id);
  await admin
    .from("profiles")
    .update({ activated_at: new Date().toISOString() })
    .eq("id", session.user.id)
    .is("activated_at", null);

  return NextResponse.json({ ok: true });
}
