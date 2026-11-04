import { PageHeader, PortalMuted, WidgetCard } from "@/components/portal/portal-ui";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSupportPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("support_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Support queue"
        description='Client “I need help” requests with the step context.'
      />
      <div className="space-y-3">
        {(requests ?? []).length === 0 ? (
          <WidgetCard>
            <PortalMuted>No support requests.</PortalMuted>
          </WidgetCard>
        ) : (
          (requests ?? []).map((r) => (
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
                <span className="text-xs text-neutral-500">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-800">
                {r.body}
              </p>
              <p className="mt-2 font-mono text-[10px] text-neutral-400">
                user {r.user_id}
              </p>
            </WidgetCard>
          ))
        )}
      </div>
    </div>
  );
}
