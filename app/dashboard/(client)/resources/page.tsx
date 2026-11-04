import {
  BronzeRule,
  Eyebrow,
  PortalEmpty,
  PortalTitle,
} from "@/components/portal/portal-primitives";
import { ResourceList } from "@/components/portal/resource-list";
import { createClient } from "@/lib/supabase/server";

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("published", true)
    .order("sort_order");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Eyebrow>Library</Eyebrow>
        <PortalTitle className="mt-2">Resources</PortalTitle>
        <BronzeRule className="mt-4" />
      </div>
      {(resources?.length ?? 0) === 0 ? (
        <PortalEmpty
          title="No guides published yet"
          description="EA, VPS, Equity Protect and MT5 mobile guides will appear here."
        />
      ) : (
        <ResourceList resources={resources ?? []} />
      )}
    </div>
  );
}
