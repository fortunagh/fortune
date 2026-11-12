import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  delayHours: z.number().min(0).max(24 * 30).optional(),
  enabled: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionProfile();
  if (!session?.user || session.profile?.role !== "admin") {
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
  if (parsed.data.delayHours !== undefined)
    updates.delay_hours = parsed.data.delayHours;
  if (parsed.data.enabled !== undefined) updates.enabled = parsed.data.enabled;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reminder_rules")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, rule: data });
}
