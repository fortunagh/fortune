import {
  PageHeader,
  WidgetCard,
} from "@/components/portal/portal-ui";
import { SupportComposer } from "@/components/portal/support-composer";
import { Badge } from "@/components/ui/badge";
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
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-neutral-200 uppercase"
              >
                {r.status}
              </Badge>
              {r.step_key ? (
                <span className="font-mono text-xs text-neutral-500">
                  {r.step_key}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-neutral-800">
              {r.body}
            </p>
          </WidgetCard>
        ))}
      </div>
    </div>
  );
}
