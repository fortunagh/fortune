import { createHash, randomBytes } from "crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { sendAccessApprovedEmail } from "@/lib/notifications/enqueue";
import { bootstrapOnboardingCase } from "./case";
import { normalizePhoneE164 } from "./phone";

type AdminClient = SupabaseClient;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateInviteToken() {
  return randomBytes(32).toString("hex");
}

export async function createAndSendInvitation(options: {
  admin: AdminClient;
  submissionId: string;
  email: string;
  firstName: string;
  invitedBy: string;
  expiresInDays?: number;
}) {
  const {
    admin,
    submissionId,
    email,
    firstName,
    invitedBy,
    expiresInDays = 7,
  } = options;

  const token = generateInviteToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: invite, error } = await admin
    .from("invitations")
    .insert({
      submission_id: submissionId,
      email: email.toLowerCase(),
      token_hash: tokenHash,
      expires_at: expiresAt,
      invited_by: invitedBy,
    })
    .select("*")
    .single();

  if (error || !invite) {
    throw new Error(error?.message ?? "Could not create invitation");
  }

  await admin
    .from("request_access_submissions")
    .update({
      status: "approved",
      invitation_sent_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const activateUrl = `${origin}/auth/activate?token=${token}`;

  // Prefer Supabase invite so the user can set a password
  const { data: authInvite, error: authErr } =
    await admin.auth.admin.inviteUserByEmail(email.toLowerCase(), {
      redirectTo: `${origin}/auth/update-password`,
      data: {
        first_name: firstName,
        invitation_id: invite.id,
        submission_id: submissionId,
      },
    });

  if (authErr) {
    console.error("inviteUserByEmail", authErr);
  }

  if (authInvite?.user?.id) {
    const { data: subPhone } = await admin
      .from("request_access_submissions")
      .select("phone_e164, mobile_number")
      .eq("id", submissionId)
      .maybeSingle();
    const phone =
      normalizePhoneE164(subPhone?.phone_e164) ||
      normalizePhoneE164(subPhone?.mobile_number);

    await admin
      .from("profiles")
      .update({
        first_name: firstName,
        ...(phone ? { phone_e164: phone } : {}),
      })
      .eq("id", authInvite.user.id);

    await admin
      .from("request_access_submissions")
      .update({ user_id: authInvite.user.id })
      .eq("id", submissionId);
  }

  await sendAccessApprovedEmail(admin, {
    userId: authInvite?.user?.id ?? null,
    email: email.toLowerCase(),
    firstName,
    activateUrl: authInvite?.user
      ? `${origin}/auth/update-password`
      : activateUrl,
    idempotencyKey: `access_approved:${submissionId}`,
  });

  await admin.from("audit_log").insert({
    actor_id: invitedBy,
    entity_type: "invitation",
    entity_id: invite.id,
    action: "send_invitation",
    from_status: "pending",
    to_status: "sent",
    meta: { submissionId, email },
  });

  return { invite, token, userId: authInvite?.user?.id ?? null };
}

export async function activateInvitation(options: {
  admin: AdminClient;
  token: string;
  userId: string;
}) {
  const { admin, token, userId } = options;
  const tokenHash = hashToken(token);

  const { data: invite } = await admin
    .from("invitations")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!invite) return { ok: false as const, error: "Invalid invitation" };
  if (invite.used_at) return { ok: false as const, error: "Invitation already used" };
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { ok: false as const, error: "Invitation expired" };
  }

  await admin
    .from("invitations")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invite.id);

  if (invite.submission_id) {
    await admin
      .from("request_access_submissions")
      .update({ user_id: userId })
      .eq("id", invite.submission_id);

    const { data: sub } = await admin
      .from("request_access_submissions")
      .select("first_name, last_name, phone_e164, mobile_number")
      .eq("id", invite.submission_id)
      .maybeSingle();

    if (sub) {
      const phone =
        normalizePhoneE164(sub.phone_e164) ||
        normalizePhoneE164(sub.mobile_number);
      await admin
        .from("profiles")
        .update({
          first_name: sub.first_name,
          last_name: sub.last_name,
          phone_e164: phone,
          activated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
  } else {
    await admin
      .from("profiles")
      .update({ activated_at: new Date().toISOString() })
      .eq("id", userId);
  }

  await bootstrapOnboardingCase(admin, userId);

  return { ok: true as const, invite };
}
