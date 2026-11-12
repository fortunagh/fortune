import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  kind: z.enum(["pdf", "video", "link"]).optional(),
  externalUrl: z.string().optional().nullable(),
  relatedStepKeys: z.array(z.string()).optional(),
  published: z.boolean().optional(),
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
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.kind !== undefined) updates.kind = parsed.data.kind;
  if (parsed.data.externalUrl !== undefined)
    updates.external_url = parsed.data.externalUrl || null;
  if (parsed.data.relatedStepKeys !== undefined)
    updates.related_step_keys = parsed.data.relatedStepKeys;
  if (parsed.data.published !== undefined)
    updates.published = parsed.data.published;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, resource: data });
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
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
