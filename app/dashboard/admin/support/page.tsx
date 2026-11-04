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
      <div>
        <h2 className="font-display text-2xl tracking-tight">Support queue</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Client “I need help” requests with the step context.
        </p>
      </div>
      <div className="space-y-3">
        {(requests ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No support requests.</p>
        ) : (
          (requests ?? []).map((r) => (
            <div key={r.id} className="border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-none uppercase">
                  {r.status}
                </Badge>
                {r.step_key ? (
                  <span className="font-mono text-xs text-muted-foreground">
                    {r.step_key}
                  </span>
                ) : null}
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{r.body}</p>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                user {r.user_id}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
