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
      <p className="text-sm text-muted-foreground">
        Answers come from approved Fortuna guides. For exceptions, use{" "}
        <strong>I need help</strong>.
      </p>
      <div className="max-h-80 space-y-3 overflow-y-auto border border-border p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ask a setup question.</p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "text-sm leading-relaxed",
                m.role === "assistant" ? "text-foreground" : "text-primary",
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {m.role === "assistant" ? "Fortuna" : "You"}
              </span>
              <p className="mt-1 whitespace-pre-wrap">{m.content}</p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={send} className="space-y-3">
        <Textarea
          className="rounded-none"
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
