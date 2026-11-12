import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  referralUrl: z.string().optional().nullable(),
  securePortalUrl: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

async function requireAdmin() {
  const session = await getSessionProfile();
  if (!session?.user || session.profile?.role !== "admin") {
    return null;
  }
  return session;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.referralUrl !== undefined)
    updates.referral_url = parsed.data.referralUrl || null;
  if (parsed.data.securePortalUrl !== undefined)
    updates.secure_portal_url = parsed.data.securePortalUrl || null;
  if (parsed.data.active !== undefined) updates.active = parsed.data.active;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brokers")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, broker: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("brokers").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
