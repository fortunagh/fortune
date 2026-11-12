import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getBillingDefaults,
  getNotificationEmails,
  getSupportDefaults,
  setBillingDefaults,
  setNotificationEmails,
  setSupportDefaults,
} from "@/lib/admin/settings";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const putSchema = z.object({
  notificationEmails: z.array(z.string()).optional(),
  billing: z
    .object({
      currency: z.string().min(1),
      ratePerLotUsd: z.number().positive(),
      invoiceDueDays: z.number().int().positive().max(90),
    })
    .optional(),
  support: z
    .object({
      autoMarkInProgressOnReply: z.boolean(),
      replyEmailEnabled: z.boolean(),
    })
    .optional(),
});

export async function GET() {
  const session = await getSessionProfile();
  if (!session?.user || session.profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const admin = createServiceRoleClient();
    const [notificationEmails, billing, support] = await Promise.all([
      getNotificationEmails(admin),
      getBillingDefaults(admin),
      getSupportDefaults(admin),
    ]);
    return NextResponse.json({ notificationEmails, billing, support });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not load settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await getSessionProfile();
  if (!session?.user || session.profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  try {
    const admin = createServiceRoleClient();
    const userId = session.user.id;

    if (parsed.data.notificationEmails) {
      const r = await setNotificationEmails(
        admin,
        parsed.data.notificationEmails,
        userId,
      );
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: 500 });
    }
    if (parsed.data.billing) {
      const r = await setBillingDefaults(admin, parsed.data.billing, userId);
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: 500 });
    }
    if (parsed.data.support) {
      const r = await setSupportDefaults(admin, parsed.data.support, userId);
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: 500 });
    }

    const [notificationEmails, billing, support] = await Promise.all([
      getNotificationEmails(admin),
      getBillingDefaults(admin),
      getSupportDefaults(admin),
    ]);

    return NextResponse.json({ ok: true, notificationEmails, billing, support });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not save settings" },
      { status: 500 },
    );
  }
}
