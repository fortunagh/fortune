import Link from "next/link";

import {
  PageHeader,
  PortalMuted,
  WidgetCard,
} from "@/components/portal/portal-ui";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const session = await getSessionProfile();
  if (!session?.user) return null;

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", session.user.id)
    .is("read_at", null);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader eyebrow="Inbox" title="Notifications" />
      {(items?.length ?? 0) === 0 ? (
        <WidgetCard className="text-center">
          <p className="text-base font-semibold text-neutral-950">
            No notifications yet
          </p>
          <PortalMuted className="mt-2">
            Step updates and billing notices will appear here.
          </PortalMuted>
        </WidgetCard>
      ) : (
        <ul className="space-y-3">
          {(items ?? []).map((n) => (
            <li key={n.id}>
              <WidgetCard>
                <p className="text-sm font-semibold text-neutral-950">
                  {n.href ? (
                    <Link href={n.href} className="hover:text-[#a8842a]">
                      {n.title}
                    </Link>
                  ) : (
                    n.title
                  )}
                </p>
                {n.body ? (
                  <p className="mt-1 line-clamp-3 text-sm text-neutral-500">
                    {n.body}
                  </p>
                ) : null}
              </WidgetCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
