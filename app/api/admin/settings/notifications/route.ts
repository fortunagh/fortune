import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getNotificationEmails,
  setNotificationEmails,
} from "@/lib/admin/settings";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const bodySchema = z.object({
  emails: z.array(z.string().email()).max(20),
});

export async function GET() {
  const session = await getSessionProfile();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const admin = createServiceRoleClient();
    const emails = await getNotificationEmails(admin);
    return NextResponse.json({ emails });
  } catch (e) {
    // Fall back to cookie client if service role missing
    const supabase = await createClient();
    const emails = await getNotificationEmails(supabase);
    return NextResponse.json({ emails });
  }
}

export async function PUT(request: Request) {
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

  try {
    const admin = createServiceRoleClient();
    const result = await setNotificationEmails(
      admin,
      parsed.data.emails,
      session.user.id,
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, emails: parsed.data.emails });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
