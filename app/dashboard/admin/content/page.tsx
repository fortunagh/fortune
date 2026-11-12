import { AdminContentForms } from "@/components/admin/admin-content-panel";
import { AdminPage } from "@/components/admin/ui/admin-page";
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
    <AdminPage
      title="Content"
      description="Guides, brokers, reminder timing, and step catalogue."
    >
      <AdminContentForms
        resources={resources ?? []}
        brokers={brokers ?? []}
        reminderRules={rules ?? []}
        steps={(steps ?? []).map((s) => ({
          key: s.key as string,
          title: s.title as string,
        }))}
      />
    </AdminPage>
  );
}
