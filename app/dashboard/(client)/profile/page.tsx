import {
  BronzeRule,
  Eyebrow,
  PortalCard,
  PortalTitle,
} from "@/components/portal/portal-primitives";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const session = await getSessionProfile();
  if (!session?.user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div>
        <Eyebrow>Account</Eyebrow>
        <PortalTitle className="mt-2">Profile</PortalTitle>
        <BronzeRule className="mt-4" />
      </div>
      <PortalCard className="space-y-3 p-6 font-[Arial,Helvetica,sans-serif] text-sm">
        <Row label="Email" value={session.user.email ?? "—"} />
        <Row label="First name" value={profile?.first_name ?? "—"} />
        <Row label="Last name" value={profile?.last_name ?? "—"} />
        <Row label="Role" value={profile?.role ?? "customer"} />
        <Row
          label="Activated"
          value={
            profile?.activated_at
              ? new Date(profile.activated_at).toLocaleString()
              : "—"
          }
        />
      </PortalCard>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}
