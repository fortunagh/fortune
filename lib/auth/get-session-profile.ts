import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "customer";

export type SessionProfile = {
  user: { id: string; email: string | null };
  profile: { role: UserRole } | null;
};

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: profile
      ? { role: profile.role as UserRole }
      : null,
  };
}

export async function requireAdmin() {
  const session = await getSessionProfile();
  if (!session?.user) {
    return { ok: false as const, reason: "unauthorized" as const };
  }
  if (session.profile?.role !== "admin") {
    return { ok: false as const, reason: "forbidden" as const };
  }
  return { ok: true as const, session };
}
