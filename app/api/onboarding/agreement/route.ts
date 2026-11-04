import { NextResponse } from "next/server";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createUserAgreementRequest } from "@/lib/integrations/dropbox-sign";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST() {
  const session = await getSessionProfile();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "Misconfigured" }, { status: 500 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", session.user.id)
    .maybeSingle();

  const name =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    session.user.email;

  const result = await createUserAgreementRequest({
    email: session.user.email,
    name,
    userId: session.user.id,
    clientId: process.env.DROPBOX_SIGN_CLIENT_ID,
  });

  await admin.from("agreements").upsert(
    {
      user_id: session.user.id,
      provider: "dropbox_sign",
      provider_request_id:
        result.signatureRequestId ?? `fallback:${session.user.id}`,
      status: "sent",
      meta: { sign_url: result.signUrl, error: result.error ?? null },
    },
    { onConflict: "provider_request_id" },
  );

  // Mark step awaiting until webhook confirms
  await admin
    .from("onboarding_step_states")
    .update({ status: "awaiting" })
    .eq("step_key", "user_agreement")
    .eq(
      "case_id",
      (
        await admin
          .from("onboarding_cases")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle()
      ).data?.id,
    );

  return NextResponse.json({
    ok: true,
    signUrl: result.signUrl,
    signatureRequestId: result.signatureRequestId,
    warning: result.error,
  });
}
