"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCodexEntry } from "@/app/journal/actions";
import { CODEX_PROMPTS } from "@/lib/data/journalCodexPrompts";
import type { CodexDay } from "@/lib/data/journalCodex";

function formatDate(dateStr: string) {
  // dateStr is a plain YYYY-MM-DD from Postgres `date` -- parse it as
  // local, not UTC-midnight (which can roll back a day near midnight).
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  return isToday
    ? "Today"
    : date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function EntryComposer({ onSaved }: { onSaved: () => void }) {
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!activePrompt || !answer.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await saveCodexEntry({ prompt: activePrompt, answer });
    setSubmitting(false);
    if (!result.success) {
      setError(result.error ?? "Couldn't save that.");
      return;
    }
    setAnswer("");
    setActivePrompt(null);
    onSaved();
  }

  return (
    <div className="rounded border border-white/10 bg-white/5 p-3">
      <p className="mb-2 text-xs text-white/50">
        Not AI, not a score — just a place to put it into words. Answer as many times a day as you want; each one
        logs under today's date.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {CODEX_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setActivePrompt(p)}
            className={`rounded border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              activePrompt === p
                ? "border-primary bg-primary/15 text-primary"
                : "border-white/15 text-white/60 hover:border-white/30"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {activePrompt && (
        <div className="mt-3">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write whatever's true right now..."
            rows={3}
            className="w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {error && <p className="mt-1 text-xs text-loss">{error}</p>}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !answer.trim()}
              className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Saving..." : "Log it"}
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePrompt(null);
                setAnswer("");
              }}
              className="rounded border border-white/15 px-3 py-1.5 text-xs text-white/50 hover:text-white/80"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CodexClient({ days }: { days: CodexDay[] }) {
  const router = useRouter();

  return (
    <div id="codex" className="scroll-mt-6">
      <EntryComposer onSaved={() => router.refresh()} />

      {days.length === 0 ? (
        <p className="mt-4 text-sm text-white/40">Nothing logged yet — answer one of the prompts above.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {days.map((day) => (
            <div key={day.date}>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                {formatDate(day.date)}
              </p>
              <div className="space-y-2">
                {day.entries.map((entry) => (
                  <div key={entry.id} className="rounded border border-white/10 bg-surface p-3">
                    <p className="text-[11px] font-medium text-primary">{entry.prompt}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-white/80">{entry.answer}</p>
                    <p className="mt-1.5 text-[10px] text-white/30">
                      {new Date(entry.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
