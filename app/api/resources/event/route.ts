import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  resourceId: z.string().uuid(),
  event: z.enum(["open", "progress"]),
  progress: z.number().min(0).max(1).optional(),
});

export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  const { error } = await supabase.from("resource_events").insert({
    user_id: session.user.id,
    resource_id: parsed.data.resourceId,
    event: parsed.data.event,
    progress: parsed.data.progress ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
