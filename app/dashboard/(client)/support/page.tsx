import {
  PageHeader,
  WidgetCard,
} from "@/components/portal/portal-ui";
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
      <PageHeader
        eyebrow="Support"
        title="I need help"
        description="Software help without sharing broker credentials."
      />

      <WidgetCard>
        <SupportComposer stepKey={step ?? null} />
      </WidgetCard>

      <div className="space-y-3">
        {(requests ?? []).map((r) => (
          <WidgetCard key={r.id}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {r.status}
              {r.step_key ? ` · ${r.step_key}` : ""}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-800">
              {r.body}
            </p>
          </WidgetCard>
        ))}
      </div>
    </div>
  );
}
