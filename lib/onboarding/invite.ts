import { createHash, randomBytes } from "crypto";

import type { SupabaseClient, User } from "@supabase/supabase-js";

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

function siteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

/** Find auth user by email via Admin API (paginated). */
async function findUserByEmail(
  admin: AdminClient,
  email: string,
): Promise<User | null> {
  const target = email.toLowerCase();
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("listUsers", error);
      return null;
    }
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit;
    if (data.users.length < perPage) return null;
    page += 1;
    if (page > 20) return null;
  }
}

/**
 * Create/link auth user and return a set-password action link without
 * sending Supabase's built-in invite email (Resend sends branded mail).
 */
async function createSetPasswordLink(options: {
  admin: AdminClient;
  email: string;
  firstName: string;
  invitationId: string;
  submissionId: string;
}): Promise<{ userId: string | null; actionLink: string | null }> {
  const { admin, email, firstName, invitationId, submissionId } = options;
  const origin = siteOrigin();
  const redirectTo = `${origin}/auth/update-password`;
  const meta = {
    first_name: firstName,
    invitation_id: invitationId,
    submission_id: submissionId,
  };

  let user = await findUserByEmail(admin, email);

  if (!user) {
    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email: email.toLowerCase(),
        email_confirm: true,
        user_metadata: meta,
      });
    if (createErr || !created.user) {
      console.error("createUser", createErr);
      // Fall through to generateLink invite which may create the user
    } else {
      user = created.user;
    }
  } else {
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, ...meta },
    });
  }

  // Prefer invite link for new accounts; recovery if invite fails (user exists).
  let actionLink: string | null = null;

  const inviteLink = await admin.auth.admin.generateLink({
    type: "invite",
    email: email.toLowerCase(),
    options: { redirectTo, data: meta },
  });

  if (!inviteLink.error && inviteLink.data.properties?.action_link) {
    actionLink = inviteLink.data.properties.action_link;
    if (!user && inviteLink.data.user) user = inviteLink.data.user;
  } else {
    if (inviteLink.error) {
      console.error("generateLink invite", inviteLink.error);
    }
    const recovery = await admin.auth.admin.generateLink({
      type: "recovery",
      email: email.toLowerCase(),
      options: { redirectTo },
    });
    if (recovery.error) {
      console.error("generateLink recovery", recovery.error);
    } else {
      actionLink = recovery.data.properties?.action_link ?? null;
      if (!user && recovery.data.user) user = recovery.data.user;
    }
  }

  return { userId: user?.id ?? null, actionLink };
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

  const origin = siteOrigin();
  const fallbackActivateUrl = `${origin}/auth/activate?token=${token}`;

  const { userId, actionLink } = await createSetPasswordLink({
    admin,
    email,
    firstName,
    invitationId: invite.id,
    submissionId,
  });

  if (userId) {
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
      .eq("id", userId);

    await admin
      .from("request_access_submissions")
      .update({ user_id: userId })
      .eq("id", submissionId);
  }

  const setPasswordUrl = actionLink || fallbackActivateUrl;

  await sendAccessApprovedEmail(admin, {
    userId,
    email: email.toLowerCase(),
    firstName,
    activateUrl: setPasswordUrl,
    idempotencyKey: `access_approved:${submissionId}`,
  });

  await admin.from("audit_log").insert({
    actor_id: invitedBy,
    entity_type: "invitation",
    entity_id: invite.id,
    action: "send_invitation",
    from_status: "pending",
    to_status: "sent",
    meta: {
      submissionId,
      email,
      usedGenerateLink: Boolean(actionLink),
    },
  });

  return { invite, token, userId };
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
  if (invite.used_at)
    return { ok: false as const, error: "Invitation already used" };
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

/** After set-password: mark invite used (via metadata) and bootstrap case. */
export async function finalizeInviteAfterPassword(
  admin: AdminClient,
  userId: string,
) {
  const { data: userData } = await admin.auth.admin.getUserById(userId);
  const meta = userData.user?.user_metadata ?? {};
  const invitationId =
    typeof meta.invitation_id === "string" ? meta.invitation_id : null;
  const submissionId =
    typeof meta.submission_id === "string" ? meta.submission_id : null;

  if (invitationId) {
    await admin
      .from("invitations")
      .update({ used_at: new Date().toISOString() })
      .eq("id", invitationId)
      .is("used_at", null);
  }

  if (submissionId) {
    await admin
      .from("request_access_submissions")
      .update({ user_id: userId })
      .eq("id", submissionId);

    const { data: sub } = await admin
      .from("request_access_submissions")
      .select("first_name, last_name, phone_e164, mobile_number")
      .eq("id", submissionId)
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
      .eq("id", userId)
      .is("activated_at", null);
  }

  await bootstrapOnboardingCase(admin, userId);
  return { ok: true as const };
}
