import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  status: z
    .enum(["pending", "contacted", "approved", "declined"])
    .optional(),
  admin_notes: z.string().max(8000).nullable().optional(),
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
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.admin_notes !== undefined) {
    updates.admin_notes = parsed.data.admin_notes;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("request_access_submissions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("admin PATCH request_access", error);
    return NextResponse.json(
      { error: "Could not update submission" },
      { status: 500 },
    );
  }

  return NextResponse.json({ row: data });
}

export async function DELETE(
  _request: Request,
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("request_access_submissions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("admin DELETE request_access", error);
    return NextResponse.json(
      { error: "Could not delete submission" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
