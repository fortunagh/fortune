"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function AssistantPanel({ stepKey }: { stepKey: string | null }) {
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const question = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: question }]);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, stepKey, threadId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Assistant unavailable");
      if (json.threadId) setThreadId(json.threadId);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: json.answer as string },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn(fortunaUiClass, "space-y-4")}>
      <p className="text-sm text-neutral-500">
        Answers come from approved Fortuna guides. For exceptions, use{" "}
        <strong className="text-neutral-800">I need help</strong>.
      </p>
      <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-neutral-500">Ask a setup question.</p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "text-sm leading-relaxed",
                m.role === "assistant" ? "text-neutral-900" : "text-[#a8842a]",
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                {m.role === "assistant" ? "Fortuna" : "You"}
              </span>
              <p className="mt-1 whitespace-pre-wrap">{m.content}</p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={send} className="space-y-3">
        <Textarea
          className="rounded-xl"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. How do I apply for a demo licence?"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" variant="fortuna" disabled={busy}>
          {busy ? "Thinking…" : "Ask"}
        </Button>
      </form>
    </div>
  );
}
