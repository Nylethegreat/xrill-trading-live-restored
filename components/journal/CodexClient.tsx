"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveCodexEntry } from "@/app/journal/actions";
import { CODEX_PROMPTS } from "@/lib/data/journalCodexPrompts";
import { buildSuggestions, type Suggestion } from "@/lib/data/resetSuggestions";
import type { CodexDay } from "@/lib/data/journalCodex";

export interface RedDayStatus {
  active: boolean; // a journaled loss today, or the Two-Loss Lockout tripped
  netPnl: number; // today's journaled net P/L (Eastern trading day)
  lockedOut: boolean;
}

// One color + icon per standing prompt, used on the chips and the timeline.
const PROMPT_LOOK: Record<string, { icon: string; color: string }> = {
  [CODEX_PROMPTS[0]]: { icon: "☀️", color: "#22d3ee" },
  [CODEX_PROMPTS[1]]: { icon: "🧠", color: "#a855f7" },
  [CODEX_PROMPTS[2]]: { icon: "✅", color: "#22c55e" },
  [CODEX_PROMPTS[3]]: { icon: "⚓", color: "#facc15" },
};
const FALLBACK_LOOK = { icon: "📝", color: "#94a3b8" };

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

function money(v: number) {
  return `${v < 0 ? "−" : ""}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── "We suggest you…" deck ────────────────────────────────────────────
function SuggestionDeck({ cards, redDay, hasHobbies }: { cards: Suggestion[]; redDay: boolean; hasHobbies: boolean }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const doneCount = cards.filter((c) => done[c.id]).length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">We suggest you…</p>
        <span className="font-mono text-[11px] text-white/40">
          {doneCount}/{cards.length} done
        </span>
      </div>
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 transition-[width] duration-500"
          style={{ width: `${cards.length ? (doneCount / cards.length) * 100 : 0}%` }}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {cards.map((c) => {
          const isDone = !!done[c.id];
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setDone((d) => ({ ...d, [c.id]: !d[c.id] }))}
              aria-pressed={isDone}
              className="group relative flex gap-3 overflow-hidden rounded-xl border p-3 text-left transition-transform hover:-translate-y-0.5"
              style={{
                borderColor: `${c.color}${isDone ? "99" : "40"}`,
                background: `linear-gradient(140deg, ${c.color}${isDone ? "2e" : "1a"}, rgba(0,0,0,0.25) 60%)`,
              }}
            >
              <span
                className="flex h-10 w-10 flex-none items-center justify-center rounded-lg text-lg"
                style={{ background: `${c.color}22`, boxShadow: `0 0 14px ${c.color}55` }}
              >
                {isDone ? "✓" : c.icon}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isDone ? "text-white/50 line-through" : "text-white"}`}>{c.title}</span>
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-white/60">{c.body}</span>
                <span
                  className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: c.color, background: `${c.color}1f` }}
                >
                  {c.tag}
                </span>
              </span>
            </button>
          );
        })}
        {!hasHobbies && (
          <Link
            href="/account"
            className="flex items-center gap-3 rounded-xl border border-dashed border-white/20 p-3 text-left text-xs text-white/50 hover:border-white/40 hover:text-white/80"
          >
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-white/5 text-lg">＋</span>
            <span>
              <span className="block text-sm font-semibold text-white/80">Add your hobbies</span>
              Tell XRILL what resets you (gym, music, games, cooking) and these suggestions get personal.
            </span>
          </Link>
        )}
      </div>

      {redDay && (
        <p className="mt-3 text-[11px] leading-relaxed text-white/40">
          If this feels bigger than one bad trade, or it&apos;s been sitting on you for a while, tell someone you trust or
          talk to a professional. Nothing here replaces that.
        </p>
      )}
    </div>
  );
}

// ── Composer ──────────────────────────────────────────────────────────
function EntryComposer({ onSaved }: { onSaved: () => void }) {
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const look = activePrompt ? PROMPT_LOOK[activePrompt] ?? FALLBACK_LOOK : null;

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
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">Put it into words</p>
      <p className="mt-1 text-xs text-white/40">
        Not AI, not a score. Answer as many times a day as you want; each one logs under today&apos;s date.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {CODEX_PROMPTS.map((p) => {
          const l = PROMPT_LOOK[p] ?? FALLBACK_LOOK;
          const active = activePrompt === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setActivePrompt(p)}
              aria-pressed={active}
              className="flex min-h-[44px] items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all"
              style={{
                borderColor: active ? l.color : "rgba(255,255,255,0.12)",
                background: active ? `${l.color}1f` : "rgba(255,255,255,0.03)",
                color: active ? "#fff" : "rgba(255,255,255,0.65)",
                boxShadow: active ? `0 0 16px ${l.color}40` : undefined,
              }}
            >
              <span className="text-base">{l.icon}</span>
              {p}
            </button>
          );
        })}
      </div>

      {activePrompt && look && (
        <div className="mt-3">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write whatever's true right now..."
            rows={3}
            autoFocus
            className="w-full rounded-lg border bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
            style={{ borderColor: `${look.color}80` }}
          />
          {error && <p className="mt-1 text-xs text-loss">{error}</p>}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !answer.trim()}
              className="min-h-[36px] rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-black disabled:opacity-40"
              style={{ background: look.color }}
            >
              {submitting ? "Saving..." : "Log it"}
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePrompt(null);
                setAnswer("");
              }}
              className="min-h-[36px] rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/50 hover:text-white/80"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Codex ─────────────────────────────────────────────────────────────
export default function CodexClient({
  days,
  hobbies = [],
  redDay = { active: false, netPnl: 0, lockedOut: false },
  seed = "",
}: {
  days: CodexDay[];
  hobbies?: string[];
  redDay?: RedDayStatus;
  seed?: string;
}) {
  const router = useRouter();
  const cards = useMemo(() => buildSuggestions({ hobbies, redDay: redDay.active, seed }), [hobbies, redDay.active, seed]);
  const entryCount = days.reduce((n, d) => n + d.entries.length, 0);

  const accent = redDay.active ? "#f43f5e" : "#22d3ee";

  return (
    <div id="codex" className="scroll-mt-6 space-y-4">
      {/* Status banner */}
      <div
        className="relative overflow-hidden rounded-xl border p-4"
        style={{
          borderColor: `${accent}55`,
          background: redDay.active
            ? "linear-gradient(135deg, rgba(244,63,94,0.22), rgba(168,85,247,0.08) 55%, transparent)"
            : "linear-gradient(135deg, rgba(34,211,238,0.16), rgba(168,85,247,0.10) 55%, transparent)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: accent, textShadow: `0 0 12px ${accent}aa` }}>
              {redDay.active ? "🔴 Red Day Mode" : "📖 Codex · Daily Check-In"}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              {redDay.active ? "The charts can wait. You come first right now." : "How's your head today?"}
            </h3>
            <p className="mt-1 text-xs text-white/55">
              {redDay.active
                ? redDay.lockedOut
                  ? "Two-Loss Lockout is on. Trading is done for today. Use the time on something below."
                  : "You're red today. Don't try to win it back. Step away, then come back with a clear head."
                : "A few small resets for today, then a place to write it down."}
            </p>
          </div>
          <div className="flex gap-2">
            {redDay.active && (
              <div className="rounded-lg border border-rose-400/30 bg-black/30 px-3 py-2 text-right">
                <p className="text-[9px] uppercase tracking-widest text-white/40">Today</p>
                <p className="font-mono text-sm font-bold text-rose-300">{money(redDay.netPnl)}</p>
              </div>
            )}
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-right">
              <p className="text-[9px] uppercase tracking-widest text-white/40">Entries</p>
              <p className="font-mono text-sm font-bold text-white">{entryCount}</p>
            </div>
          </div>
        </div>
      </div>

      <SuggestionDeck cards={cards} redDay={redDay.active} hasHobbies={hobbies.length > 0} />

      <EntryComposer onSaved={() => router.refresh()} />

      {/* Timeline */}
      {days.length === 0 ? (
        <p className="text-sm text-white/40">Nothing logged yet. Pick a prompt above.</p>
      ) : (
        <div className="space-y-5">
          {days.map((day) => (
            <div key={day.date}>
              <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-white/45">{formatDate(day.date)}</p>
              <div className="relative ml-2 space-y-2 border-l border-white/10 pl-4">
                {day.entries.map((entry) => {
                  const l = PROMPT_LOOK[entry.prompt] ?? FALLBACK_LOOK;
                  return (
                    <div key={entry.id} className="relative rounded-lg border border-white/10 bg-black/30 p-3">
                      <span
                        className="absolute -left-[22px] top-4 h-3 w-3 rounded-full border-2 border-black"
                        style={{ background: l.color, boxShadow: `0 0 8px ${l.color}` }}
                      />
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: l.color }}>
                        <span>{l.icon}</span>
                        {entry.prompt}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-white/85">{entry.answer}</p>
                      <p className="mt-1.5 text-[10px] text-white/30">
                        {new Date(entry.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
