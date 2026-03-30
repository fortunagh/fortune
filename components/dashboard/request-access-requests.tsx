import { createClient } from "@/lib/supabase/server";
import type { RequestAccessSubmissionRow } from "@/lib/types/request-access-submission";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export async function RequestAccessRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("request_access_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("request_access list error", error);
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Could not load request access submissions. Ensure the table exists
        and RLS policies allow SELECT for authenticated users.
      </div>
    );
  }

  const rows = (data ?? []) as RequestAccessSubmissionRow[];

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No submissions yet. They will appear here when visitors complete the
        Request access form on the site.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <table className="w-full min-w-[960px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="whitespace-nowrap px-3 py-2 font-semibold">
              Received
            </th>
            <th className="whitespace-nowrap px-3 py-2 font-semibold">Name</th>
            <th className="whitespace-nowrap px-3 py-2 font-semibold">Email</th>
            <th className="whitespace-nowrap px-3 py-2 font-semibold">Phone</th>
            <th className="whitespace-nowrap px-3 py-2 font-semibold">City</th>
            <th className="whitespace-nowrap px-3 py-2 font-semibold">TZ</th>
            <th className="whitespace-nowrap px-3 py-2 font-semibold">Method</th>
            <th className="min-w-[160px] px-3 py-2 font-semibold">
              Best times to reach
            </th>
            <th className="min-w-[200px] px-3 py-2 font-semibold">
              Referral / source
            </th>
            <th className="min-w-[200px] px-3 py-2 font-semibold">
              Occupation / business
            </th>
            <th className="min-w-[240px] px-3 py-2 font-semibold">
              Platform interest
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b last:border-0">
              <td className="whitespace-nowrap px-3 py-2 align-top text-muted-foreground">
                {formatDate(row.created_at)}
              </td>
              <td className="px-3 py-2 align-top">
                {row.first_name} {row.last_name}
              </td>
              <td className="max-w-[180px] break-all px-3 py-2 align-top">
                {row.email}
              </td>
              <td className="max-w-[160px] break-all px-3 py-2 align-top text-muted-foreground">
                {row.phone_e164 ?? row.mobile_number}
              </td>
              <td className="px-3 py-2 align-top">{row.city}</td>
              <td className="max-w-[140px] break-words px-3 py-2 align-top text-xs text-muted-foreground">
                {row.timezone.replace(/_/g, " ")}
              </td>
              <td className="whitespace-nowrap px-3 py-2 align-top capitalize">
                {row.preferred_contact_method}
              </td>
              <td className="max-w-[200px] px-3 py-2 align-top text-xs leading-relaxed">
                {row.best_contact_times}
              </td>
              <td className="max-w-[280px] px-3 py-2 align-top text-xs leading-relaxed">
                {row.referral_source}
              </td>
              <td className="max-w-[280px] px-3 py-2 align-top text-xs leading-relaxed">
                {row.occupation_or_business}
              </td>
              <td className="max-w-[320px] px-3 py-2 align-top text-xs leading-relaxed">
                {row.platform_interest}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
