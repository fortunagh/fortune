import {
  BronzeRule,
  Eyebrow,
  PortalCard,
  PortalTitle,
} from "@/components/portal/portal-primitives";
import { AssistantPanel } from "@/components/portal/assistant-panel";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { getCaseForUser } from "@/lib/onboarding/case";
import { createClient } from "@/lib/supabase/server";

export default async function AssistantPage() {
  const session = await getSessionProfile();
  if (!session?.user) return null;

  const supabase = await createClient();
  const { caseRow } = await getCaseForUser(supabase, session.user.id);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Eyebrow>Guides</Eyebrow>
        <PortalTitle className="mt-2">Assistant</PortalTitle>
        <BronzeRule className="mt-4" />
      </div>
      <PortalCard className="p-6">
        <AssistantPanel stepKey={caseRow?.current_step_key ?? null} />
      </PortalCard>
    </div>
  );
}
