import {
  BronzeRule,
  Eyebrow,
  PortalCard,
  PortalEmpty,
  PortalTitle,
} from "@/components/portal/portal-primitives";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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

  // Mark visible as read
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", session.user.id)
    .is("read_at", null);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Eyebrow>Inbox</Eyebrow>
        <PortalTitle className="mt-2">Notifications</PortalTitle>
        <BronzeRule className="mt-4" />
      </div>
      {(items?.length ?? 0) === 0 ? (
        <PortalEmpty title="No notifications yet" />
      ) : (
        <ul className="space-y-3">
          {(items ?? []).map((n) => (
            <li key={n.id}>
              <PortalCard className="p-4">
                <p className="font-[Arial,Helvetica,sans-serif] text-sm font-semibold">
                  {n.href ? (
                    <Link href={n.href} className="hover:text-primary">
                      {n.title}
                    </Link>
                  ) : (
                    n.title
                  )}
                </p>
                {n.body ? (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                    {n.body}
                  </p>
                ) : null}
              </PortalCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
