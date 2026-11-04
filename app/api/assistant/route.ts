import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { answerFromGuides, looksSensitive } from "@/lib/integrations/openai";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const bodySchema = z.object({
  message: z.string().trim().min(2).max(2000),
  stepKey: z.string().optional().nullable(),
  threadId: z.string().uuid().optional().nullable(),
});

export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  if (looksSensitive(parsed.data.message)) {
    return NextResponse.json(
      {
        error:
          "Please do not share passwords or credentials. Use “I need help” for software support.",
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  let threadId = parsed.data.threadId ?? null;

  if (!threadId) {
    const { data: thread, error } = await supabase
      .from("assistant_threads")
      .insert({
        user_id: session.user.id,
        step_key: parsed.data.stepKey ?? null,
        title: parsed.data.message.slice(0, 80),
      })
      .select("id")
      .single();
    if (error || !thread) {
      return NextResponse.json({ error: "Could not start thread" }, { status: 500 });
    }
    threadId = thread.id;
  }

  await supabase.from("assistant_messages").insert({
    thread_id: threadId,
    role: "user",
    content: parsed.data.message,
  });

  // Load published resource titles as lightweight context (full PDF text optional later)
  const { data: resources } = await supabase
    .from("resources")
    .select("title, kind, related_step_keys")
    .eq("published", true);

  const snippets = (resources ?? []).map(
    (r) =>
      `Resource: ${r.title} (${r.kind}) — steps: ${(r.related_step_keys ?? []).join(", ")}`,
  );

  // Optional admin-provided guide text in env for MVP grounding
  if (process.env.ASSISTANT_GUIDE_TEXT) {
    snippets.unshift(process.env.ASSISTANT_GUIDE_TEXT);
  }

  const { answer, escalate } = await answerFromGuides({
    question: parsed.data.message,
    stepKey: parsed.data.stepKey,
    guideSnippets: snippets,
  });

  await supabase.from("assistant_messages").insert({
    thread_id: threadId,
    role: "assistant",
    content: answer,
  });

  if (escalate) {
    try {
      const admin = createServiceRoleClient();
      await admin.from("support_requests").insert({
        user_id: session.user.id,
        step_key: parsed.data.stepKey ?? null,
        body: `[Assistant escalate] ${parsed.data.message}`,
        status: "open",
      });
    } catch {
      /* optional */
    }
  }

  return NextResponse.json({ ok: true, threadId, answer, escalate });
}
