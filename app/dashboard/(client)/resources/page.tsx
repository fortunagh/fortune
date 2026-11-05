import {
  PageHeader,
  PortalMuted,
  WidgetCard,
} from "@/components/portal/portal-ui";
import { ResourceList } from "@/components/portal/resource-list";
import { createClient } from "@/lib/supabase/server";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";

  const supabase = await createClient();
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("published", true)
    .order("sort_order");

  const filtered = (resources ?? []).filter((r) =>
    query ? String(r.title ?? "").toLowerCase().includes(query) : true,
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Library"
        title="Resources"
        description={
          query
            ? `Showing results for “${q}”.`
            : "Guides, videos, and links for your Fortuna setup."
        }
      />
      {(resources?.length ?? 0) === 0 ? (
        <WidgetCard className="text-center">
          <p className="text-base font-semibold text-neutral-950">
            No guides published yet
          </p>
          <PortalMuted className="mt-2">
            EA, VPS (tag step key <span className="font-mono">vps_setup</span>),
            Equity Protect and MT5 mobile guides will appear here once Fortuna
            publishes them in Admin → Content.
          </PortalMuted>
        </WidgetCard>
      ) : filtered.length === 0 ? (
        <WidgetCard className="text-center">
          <p className="text-base font-semibold text-neutral-950">
            No matching resources
          </p>
          <PortalMuted className="mt-2">
            Try a different search term.
          </PortalMuted>
        </WidgetCard>
      ) : (
        <WidgetCard>
          <ResourceList resources={filtered} />
        </WidgetCard>
      )}
    </div>
  );
}
