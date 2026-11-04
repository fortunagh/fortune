import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  name: z.string().min(1),
  referralUrl: z.string().optional().nullable(),
  securePortalUrl: z.string().optional().nullable(),
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
    .from("brokers")
    .insert({
      name: parsed.data.name,
      referral_url: parsed.data.referralUrl || null,
      secure_portal_url: parsed.data.securePortalUrl || null,
      active: true,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, broker: data });
}
