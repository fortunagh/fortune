import {
  BronzeRule,
  Eyebrow,
  PortalCard,
  PortalTitle,
} from "@/components/portal/portal-primitives";
import { SupportComposer } from "@/components/portal/support-composer";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const session = await getSessionProfile();
  if (!session?.user) return null;

  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("support_requests")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Eyebrow>Support</Eyebrow>
        <PortalTitle className="mt-2">I need help</PortalTitle>
        <BronzeRule className="mt-4" />
      </div>

      <PortalCard className="p-6">
        <SupportComposer stepKey={step ?? null} />
      </PortalCard>

      <div className="space-y-3">
        {(requests ?? []).map((r) => (
          <PortalCard key={r.id} className="p-4">
            <p className="font-[Arial,Helvetica,sans-serif] text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {r.status}
              {r.step_key ? ` · ${r.step_key}` : ""}
            </p>
            <p className="mt-2 text-sm leading-relaxed">{r.body}</p>
          </PortalCard>
        ))}
      </div>
    </div>
  );
}
