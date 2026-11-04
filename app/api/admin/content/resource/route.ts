import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  title: z.string().min(1),
  kind: z.enum(["pdf", "video", "link"]),
  externalUrl: z.string().optional().nullable(),
  relatedStepKeys: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});

export async function POST(request: Request) {
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

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .insert({
      title: parsed.data.title,
      kind: parsed.data.kind,
      external_url: parsed.data.externalUrl || null,
      related_step_keys: parsed.data.relatedStepKeys,
      published: parsed.data.published,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, resource: data });
}
