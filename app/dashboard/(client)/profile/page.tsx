import {
  PageHeader,
  WidgetCard,
} from "@/components/portal/portal-ui";
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
      <PageHeader eyebrow="Account" title="Profile" />
      <WidgetCard className="space-y-3 text-sm">
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
      </WidgetCard>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </span>
      <span className="text-right text-neutral-900">{value}</span>
    </div>
  );
}
