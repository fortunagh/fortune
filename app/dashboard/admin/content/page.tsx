import { AdminContentForms } from "@/components/admin/admin-content-panel";
import { PageHeader, WidgetCard } from "@/components/portal/portal-ui";
import { createClient } from "@/lib/supabase/server";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const [{ data: resources }, { data: brokers }, { data: rules }, { data: steps }] =
    await Promise.all([
      supabase.from("resources").select("*").order("sort_order"),
      supabase.from("brokers").select("*").order("sort_order"),
      supabase.from("reminder_rules").select("*"),
      supabase
        .from("onboarding_step_defs")
        .select("key, title, config, confirm_label")
        .order("sort_order"),
    ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <PageHeader
        title="Content"
        description="Guides, brokers, reminder timing, and step link configuration."
      />
      <WidgetCard>
        <AdminContentForms
          resources={resources ?? []}
          brokers={brokers ?? []}
          reminderRules={rules ?? []}
          steps={steps ?? []}
        />
      </WidgetCard>
    </div>
  );
}
