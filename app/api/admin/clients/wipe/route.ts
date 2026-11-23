import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const bodySchema = z.object({
  userId: z.string().uuid(),
  /** Must match the client's email exactly (case-insensitive). */
  confirmEmail: z.string().email(),
});

/**
 * Permanently wipe a test client so the same email can re-register cleanly.
 * Deletes Auth user (cascades case/steps/payments/support/profile) plus
 * request_access_submissions and invitations for that email.
 */
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
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { userId, confirmEmail } = parsed.data;
  const confirm = confirmEmail.trim().toLowerCase();

  if (userId === session.user.id) {
    return NextResponse.json(
      { error: "You cannot wipe your own admin account" },
      { status: 400 },
    );
  }

  const admin = createServiceRoleClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "admin") {
    return NextResponse.json(
      { error: "Cannot wipe an admin account" },
      { status: 400 },
    );
  }

  const { data: authData, error: authLookupErr } =
    await admin.auth.admin.getUserById(userId);
  if (authLookupErr || !authData.user) {
    return NextResponse.json(
      { error: authLookupErr?.message || "User not found" },
      { status: 404 },
    );
  }

  const email = (authData.user.email ?? "").trim().toLowerCase();
  if (!email || email !== confirm) {
    return NextResponse.json(
      {
        error:
          "Confirm email does not match this client. Type the exact email to wipe.",
      },
      { status: 400 },
    );
  }

  // Clear non-cascading assignee refs so Auth delete is not blocked.
  await admin
    .from("support_requests")
    .update({ assignee_id: null })
    .eq("assignee_id", userId);

  await admin.from("audit_log").insert({
    actor_id: session.user.id,
    entity_type: "auth.users",
    entity_id: userId,
    action: "admin_wipe_test_client",
    from_status: profile?.role ?? "customer",
    to_status: "deleted",
    meta: { email, wiped_by: session.user.id },
  });

  const { error: subDelErr } = await admin
    .from("request_access_submissions")
    .delete()
    .eq("email", email);
  if (subDelErr) {
    console.error("wipe submissions", subDelErr);
    return NextResponse.json(
      { error: `Could not delete request-access rows: ${subDelErr.message}` },
      { status: 500 },
    );
  }

  const { error: invDelErr } = await admin
    .from("invitations")
    .delete()
    .eq("email", email);
  if (invDelErr) {
    console.error("wipe invitations", invDelErr);
    return NextResponse.json(
      { error: `Could not delete invitations: ${invDelErr.message}` },
      { status: 500 },
    );
  }

  const { error: deleteUserErr } = await admin.auth.admin.deleteUser(userId);
  if (deleteUserErr) {
    console.error("wipe auth user", deleteUserErr);
    return NextResponse.json(
      { error: `Could not delete auth user: ${deleteUserErr.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, email });
}
