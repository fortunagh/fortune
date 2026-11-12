import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupportDefaults } from "@/lib/admin/settings";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { sendSupportReplyEmail } from "@/lib/notifications/enqueue";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const patchSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  adminNotes: z.string().optional().nullable(),
  reply: z.string().min(1).max(5000).optional(),
  sendEmail: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionProfile();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  if (
    parsed.data.status === undefined &&
    parsed.data.adminNotes === undefined &&
    parsed.data.reply === undefined
  ) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: existing, error: loadError } = await supabase
    .from("support_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.adminNotes !== undefined)
    updates.admin_notes = parsed.data.adminNotes;
  let supportDefaults = {
    autoMarkInProgressOnReply: true,
    replyEmailEnabled: true,
  };
  try {
    supportDefaults = await getSupportDefaults(createServiceRoleClient());
  } catch {
    // keep defaults
  }

  if (parsed.data.reply !== undefined) {
    updates.admin_notes = parsed.data.reply;
    if (
      !parsed.data.status &&
      existing.status === "open" &&
      supportDefaults.autoMarkInProgressOnReply
    ) {
      updates.status = "in_progress";
    }
  }

  const { data, error } = await supabase
    .from("support_requests")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let emailWarning: string | null = null;
  const shouldEmail =
    !!parsed.data.reply &&
    parsed.data.sendEmail !== false &&
    supportDefaults.replyEmailEnabled;
  if (shouldEmail) {
    try {
      const admin = createServiceRoleClient();
      const sent = await sendSupportReplyEmail(admin, {
        userId: existing.user_id as string,
        supportRequestId: id,
        reply: parsed.data.reply!,
        originalMessage: existing.body as string,
      });
      if (!sent.ok) {
        emailWarning =
          "error" in sent && sent.error
            ? sent.error
            : "Reply saved but email could not be sent";
      }
    } catch (e) {
      emailWarning =
        e instanceof Error ? e.message : "Reply saved but email failed";
    }
  }

  return NextResponse.json({
    ok: true,
    request: data,
    warning: emailWarning,
  });
}
