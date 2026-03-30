import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const bodySchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export async function POST(request: Request) {
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
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid email" },
      { status: 400 },
    );
  }

  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    admin = createServiceRoleClient();
  } catch {
    return NextResponse.json(
      {
        error:
          "Server is not configured with SUPABASE_SERVICE_ROLE_KEY. Add it to invite users.",
      },
      { status: 500 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    request.headers.get("origin") ??
    "http://localhost:3000";

  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email.toLowerCase(),
    {
      redirectTo: `${origin.replace(/\/$/, "")}/auth/update-password`,
    },
  );

  if (error) {
    console.error("inviteUserByEmail", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, user: data.user });
}
