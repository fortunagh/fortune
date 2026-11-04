import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { completeStep } from "@/lib/onboarding/transition";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const bodySchema = z.object({
  userId: z.string().uuid(),
  stepKey: z.string().min(1),
});

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

  const admin = createServiceRoleClient();
  const result = await completeStep({
    admin,
    userId: parsed.data.userId,
    stepKey: parsed.data.stepKey,
    source: "admin",
    actorId: session.user.id,
    force: true,
    payload: { admin_override: true },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
