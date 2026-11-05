import {
  PageHeader,
  SoftNotice,
  WidgetCard,
} from "@/components/portal/portal-ui";
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
      <PageHeader
        eyebrow="Guides"
        title="Assistant"
        description="Ask questions about your current onboarding step."
      />
      <SoftNotice>
        The assistant will not ask for broker passwords or account credentials.
        {!process.env.OPENAI_API_KEY
          ? " The AI assistant is not configured yet — use Resources or I need help for support."
          : null}
      </SoftNotice>
      <WidgetCard>
        <AssistantPanel stepKey={caseRow?.current_step_key ?? null} />
      </WidgetCard>
    </div>
  );
}
