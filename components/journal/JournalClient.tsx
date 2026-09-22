"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import { saveTradeOutcome } from "@/app/journal/actions";
import type { SessionOutcomeRow } from "@/lib/analytics";

function money(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function YesNo({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-white/70">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded px-2.5 py-1 text-xs ${value === true ? "bg-accent text-black" : "border border-white/20 text-white/60"}`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded px-2.5 py-1 text-xs ${value === false ? "bg-blocked text-white" : "border border-white/20 text-white/60"}`}
        >
          No
        </button>
      </div>
    </div>
  );
}

function OutcomeForm({ sessionId, onSaved }: { sessionId: number; onSaved: () => void }) {
  const [pl, setPl] = useState("");
  const [followedPlan, setFollowedPlan] = useState<boolean | null>(null);
  const [followedExitRules, setFollowedExitRules] = useState<boolean | null>(null);
  const [emotion, setEmotion] = useState("");
  const [lesson, setLesson] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = pl.trim() !== "" && followedPlan !== null && followedExitRules !== null;

  return (
    <div className="mt-3 rounded border border-white/10 bg-white/5 p-3">
      <p className="mb-2 text-xs text-white/50">
        Log what actually happened — closes the loop from XRILL's authorization back to a real result, so Analytics
        has something to measure.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-white/60">Profit / Loss ($)</span>
          <input
            type="number"
            step="0.01"
            value={pl}
            onChange={(e) => setPl(e.target.value)}
            placeholder="-150.00"
            className="w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-white/60">Exit premium (optional)</span>
          <input
            type="number"
            step="any"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            className="w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-accent"
          />
        </label>
      </div>

      <YesNo label="Did you follow your trading plan?" value={followedPlan} onChange={setFollowedPlan} />
      <YesNo label="Did you follow your exit rules?" value={followedExitRules} onChange={setFollowedExitRules} />

      <label className="mt-2 block text-sm">
        <span className="mb-1 block text-xs text-white/60">Emotion during the trade</span>
        <input
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          placeholder="e.g. calm, anxious, impatient"
          className="w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="mt-2 block text-sm">
        <span className="mb-1 block text-xs text-white/60">Main lesson</span>
        <textarea
          value={lesson}
          onChange={(e) => setLesson(e.target.value)}
          rows={2}
          className="w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
      </label>

      {error && <p className="mt-2 text-sm text-blocked">{error}</p>}

      <button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={async () => {
          setSubmitting(true);
          setError(null);
          const res = await saveTradeOutcome({
            sessionId,
            profitLoss: parseFloat(pl),
            followedPlan: followedPlan!,
            followedExitRules: followedExitRules!,
            emotion,
            lesson,
            exitPrice: exitPrice.trim() ? parseFloat(exitPrice) : null,
          });
          setSubmitting(false);
          if (!res.success) {
            setError(res.error ?? "Something went wrong.");
            return;
          }
          onSaved();
        }}
        className={`mt-3 w-full rounded-lg px-4 py-3 text-base font-bold tracking-wide text-white transition-all disabled:opacity-40 ${
          // Glows blue for a profitable outcome, red for a loss, based on
          // the real P/L the user just typed in -- not decided ahead of
          // time. Neutral grey while pl is empty/zero/not-yet-typed.
          !pl || parseFloat(pl) === 0 || Number.isNaN(parseFloat(pl))
            ? "bg-white/10 text-white/70 hover:bg-white/20"
            : parseFloat(pl) > 0
              ? "bg-blue-500 shadow-[0_0_20px_6px_rgba(59,130,246,0.6)] hover:bg-blue-400"
              : "bg-red-600 shadow-[0_0_20px_6px_rgba(239,68,68,0.55)] hover:bg-red-500"
        }`}
      >
        {submitting
          ? "Saving..."
          : pl && parseFloat(pl) > 0
            ? "💰 Log the Win"
            : pl && parseFloat(pl) < 0
              ? "📉 Log the Loss"
              : "Save Outcome"}
      </button>
    </div>
  );
}

type Filter = "all" | "authorized" | "blocked";

export default function JournalClient({ rows }: { rows: SessionOutcomeRow[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  if (rows.length === 0) {
    return (
      <div className="rounded border border-white/10 bg-white/5 p-6 text-center text-white/60">
        No XRILL sessions found yet. Complete a session first, then come back here to journal the result.
      </div>
    );
  }

  const authorizedCount = rows.filter((r) => r.trade_authorized).length;
  const blockedCount = rows.length - authorizedCount;

  const filtered = rows.filter((r) => {
    if (filter === "authorized") return r.trade_authorized;
    if (filter === "blocked") return !r.trade_authorized;
    return true;
  });

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(
          [
            ["all", `All (${rows.length})`],
            ["authorized", `Authorized (${authorizedCount})`],
            ["blocked", `Blocked (${blockedCount})`],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === key
                ? "border-accent bg-accent/15 text-accent"
                : "border-white/20 text-white/60 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded border border-white/10 bg-white/5 p-6 text-center text-white/60">
          No sessions in this view.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const hasOutcome = r.profit_loss !== null;
            return (
              <div key={r.session_id} className="rounded border border-white/10 bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-white">#{r.session_id}</span>
                    <span className="text-white/80">
                      {r.ticker} <span className="text-white/50">{r.direction}</span>
                    </span>
                    <span className="text-xs text-white/40">
                      {r.session_date ?? new Date(r.created_at).toISOString().slice(0, 10)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={r.trade_authorized ? "good" : "blocked"}>
                      {r.trade_authorized ? "AUTHORIZED" : "BLOCKED"}
                    </Badge>
                    <span className="font-mono text-xs text-white/50">{r.trade_score}/100</span>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-white/50 sm:grid-cols-6">
                  <span>Entry premium ${r.entry ?? "—"}</span>
                  <span>Stop premium ${r.stop ?? "—"}</span>
                  <span>Target premium ${r.target ?? "—"}</span>
                  <span>Contracts {r.contracts ?? "—"}</span>
                  <span>R:R {r.rr ? r.rr.toFixed(2) : "—"}</span>
                  {!r.trade_authorized && r.rejection_reason && (
                    <span className="text-blocked">Blocked: {r.rejection_reason}</span>
                  )}
                </div>

                {hasOutcome ? (
                  <div className="mt-3 rounded border border-white/10 bg-white/5 p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={r.profit_loss! >= 0 ? "font-medium text-accent" : "font-medium text-loss"}>
                        {money(r.profit_loss)}
                      </span>
                      <Badge tone={r.followed_plan ? "good" : "caution"}>
                        {r.followed_plan ? "Followed Plan" : "Deviated From Plan"}
                      </Badge>
                      <Badge tone={r.followed_exit_rules ? "good" : "caution"}>
                        {r.followed_exit_rules ? "Followed Exit Rules" : "Broke Exit Rules"}
                      </Badge>
                    </div>
                    {r.emotion && <p className="mt-2 text-white/70">Emotion: {r.emotion}</p>}
                    {r.lesson && <p className="text-white/70">Lesson: {r.lesson}</p>}
                  </div>
                ) : !r.trade_authorized ? (
                  <p className="mt-3 text-xs text-white/40">
                    This session was blocked — there's no execution to journal an outcome for.
                  </p>
                ) : openId === r.session_id ? (
                  <OutcomeForm
                    sessionId={r.session_id}
                    onSaved={() => {
                      setOpenId(null);
                      router.refresh();
                    }}
                  />
                ) : (
                  <button
                    onClick={() => setOpenId(r.session_id)}
                    className="mt-3 rounded border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:border-accent hover:text-accent"
                  >
                    📈 Record Outcome
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
