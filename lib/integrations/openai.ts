import OpenAI from "openai";

const SENSITIVE =
  /(password|passphrase|mt5\s*password|login\s*password|account\s*number\s*[:=]|api[_\s-]?key)/i;

export function looksSensitive(text: string): boolean {
  return SENSITIVE.test(text);
}

export async function answerFromGuides(options: {
  question: string;
  stepKey?: string | null;
  guideSnippets: string[];
}): Promise<{ answer: string; escalate: boolean }> {
  if (looksSensitive(options.question)) {
    return {
      answer:
        "I can’t help with passwords, account numbers, or credentials. Please keep those private. If you need software support, select “I need help” in your portal.",
      escalate: true,
    };
  }

  const key = process.env.OPENAI_API_KEY;
  const context =
    options.guideSnippets.filter(Boolean).join("\n\n---\n\n").slice(0, 12000) ||
    "No guide excerpts are loaded yet. Tell the client to use I need help.";

  if (!key) {
    return {
      answer:
        "The Fortuna assistant is not configured yet. Please use “I need help” for software support, or review the guides in Resources.",
      escalate: true,
    };
  }

  const openai = new OpenAI({ apiKey: key });
  const completion = await openai.chat.completions.create({
    // Hardcoded — not env-editable. Luna reasons by default; "none" keeps a fast chat reply.
    model: "gpt-6-luna",
    reasoning_effort: "none",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `You are the Fortuna Global Holdings onboarding assistant. Answer only from the approved guide excerpts below. If the answer is not in the guides, say so and recommend “I need help”. Never ask for or store passwords, identity documents, or broker credentials. Be concise and premium in tone. Current step: ${options.stepKey ?? "unknown"}.

GUIDES:
${context}`,
      },
      { role: "user", content: options.question },
    ],
  });

  const answer =
    completion.choices[0]?.message?.content?.trim() ||
    "I couldn’t find that in the approved guides. Please select “I need help”.";

  const escalate =
    /i need help|not in the guides|don’t have|do not have|cannot find/i.test(
      answer,
    );

  return { answer, escalate };
}
