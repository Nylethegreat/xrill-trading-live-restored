"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import { saveTradeOutcome, saveTradeReview } from "@/app/journal/actions";
import { countsForJournalStreak, isReviewed } from "@/lib/disciplineStreaks";
import type { SessionOutcomeRow } from "@/lib/analytics";
import type { ScreenshotRow, TrimRow } from "@/lib/data/xrill-analytics-data";
import { structureLabel } from "@/lib/structures";
import { MishapChecklist, ScreenshotStrip, TrimPanel } from "@/components/journal/TradeExtras";
import TradeCardStrip, { type TradeCardData } from "@/components/session/TradeCardStrip";
import { tradingStyleLabel } from "@/lib/data/tradingStyles";
import { EXIT_REASONS, THESIS_RESULTS, type ExitReason, type ThesisResult } from "@/lib/thesis";

function toCard(r: SessionOutcomeRow): TradeCardData {
  return {
    ticker: r.ticker,
    sideLabel: structureLabel(r.structure, r.legs) ?? r.direction,
    engine: r.engine,
    strategy: r.setup_type,
    tradingStyle: r.trading_style ?? null,
    thesis: r.thesis,
    invalidation: r.invalidation,
    confidencePre: r.confidence_pre,
    setupScore: r.setup_score,
    volumeState: r.volume_state,
    entry: r.entry,
    stop: r.stop,
    target: r.target,
    rr: r.rr,
    contracts: r.contracts,
    delta: r.delta,
    theta: r.theta,
    tradeRisk: r.trade_risk,
    confidencePost: r.confidence_post,
    thesisResult: r.thesis_result,
    exitReason: r.exit_reason,
    profitLoss: r.profit_loss,
  };
}

// Post-trade review: optional, but it's what lets Intelligence show you
// whether your exits follow your thesis or your nerves.
function ReviewFields({
  invalidation,
  confidencePost,
  setConfidencePost,
  thesisResult,
  setThesisResult,
  exitReason,
  setExitReason,
}: {
  invalidation: string | null;
  confidencePost: number | null;
  setConfidencePost: (v: number | null) => void;
  thesisResult: ThesisResult | null;
  setThesisResult: (v: ThesisResult | null) => void;
  exitReason: ExitReason | null;
  setExitReason: (v: ExitReason | null) => void;
}) {
  const pill = (on: boolean) =>
    `rounded-full border px-2.5 py-1 text-xs ${on ? "border-accent bg-accent/15 text-accent" : "border-white/20 text-white/60 hover:border-white/40"}`;
  return (
    <div className="mt-3 space-y-3 rounded border border-white/10 bg-black/20 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Thesis check <span className="normal-case text-white/35">(optional, but all three keep your Journal Streak alive)</span></p>
      {invalidation && (
        <p className="text-xs text-white/60">
          You said you'd be wrong if: <span className="text-white/85">{invalidation}</span>
        </p>
      )}
      <div>
        <p className="mb-1 text-xs text-white/60">Did your thesis play out?</p>
        <div className="flex flex-wrap gap-1.5">
          {THESIS_RESULTS.map((r) => (
            <button key={r.key} type="button" className={pill(thesisResult === r.key)} onClick={() => setThesisResult(thesisResult === r.key ? null : r.key)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs text-white/60">Why did you actually exit?</p>
        <div className="flex flex-wrap gap-1.5">
          {EXIT_REASONS.map((r) => (
            <button
              key={r.key}
              type="button"
              title={r.hint}
              className={pill(exitReason === r.key)}
              onClick={() => setExitReason(exitReason === r.key ? null : r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs text-white/60">Confidence now (1–10)</p>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setConfidencePost(confidencePost === n ? null : n)}
              className={`h-7 w-7 rounded border font-mono text-xs ${
                confidencePost === n ? "border-accent bg-accent text-black" : "border-white/20 text-white/60"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

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

function OutcomeForm({
  sessionId,
  onSaved,
  remaining,
  trimPl,
  screenshots,
  card,
  invalidation,
}: {
  sessionId: number;
  onSaved: () => void;
  remaining: number | null;
  trimPl: number;
  screenshots?: React.ReactNode;
  card?: React.ReactNode;
  invalidation?: string | null;
}) {
  const [confidencePost, setConfidencePost] = useState<number | null>(null);
  const [thesisResult, setThesisResult] = useState<ThesisResult | null>(null);
  const [exitReason, setExitReason] = useState<ExitReason | null>(null);
  const [pl, setPl] = useState("");
  const [followedPlan, setFollowedPlan] = useState<boolean | null>(null);
  const [followedExitRules, setFollowedExitRules] = useState<boolean | null>(null);
  const [emotion, setEmotion] = useState("");
  const [lesson, setLesson] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [mishaps, setMishaps] = useState<string[]>([]);
  const [mishapNote, setMishapNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = pl.trim() !== "" && followedPlan !== null && followedExitRules !== null;

  return (
    <div className="mt-3 rounded border border-white/10 bg-white/5 p-3">
      {card && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/50">What you planned</p>
          {card}
        </div>
      )}
      <p className="mb-2 text-xs text-white/50">
        Log what actually happened — closes the loop from XRILL's authorization back to a real result, so Analytics
        has something to measure.
      </p>
      {trimPl !== 0 && (
        <p className="mb-2 rounded bg-white/5 px-2 py-1 text-[11px] text-white/60">
          Enter P/L for the {remaining ?? "remaining"} contract{remaining === 1 ? "" : "s"} still open. Your trims (
          <span className={trimPl >= 0 ? "text-accent" : "text-loss"}>{money(trimPl)}</span>) are added automatically, so the
          saved outcome is the whole trade.
        </p>
      )}
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

      <ReviewFields
        invalidation={invalidation ?? null}
        confidencePost={confidencePost}
        setConfidencePost={setConfidencePost}
        thesisResult={thesisResult}
        setThesisResult={setThesisResult}
        exitReason={exitReason}
        setExitReason={setExitReason}
      />

      {screenshots && <div className="mt-3 rounded border border-white/10 bg-black/20 p-3">{screenshots}</div>}
      <MishapChecklist value={mishaps} onChange={setMishaps} note={mishapNote} onNote={setMishapNote} />

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
            mishaps,
            mishapNote,
            confidencePost,
            thesisResult,
            exitReason,
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

// Shown on a closed trade whose review is incomplete. Pre-fills whatever
// was already answered, so finishing it is one or two taps.
function FinishReview({ row, onSaved }: { row: SessionOutcomeRow; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [confidencePost, setConfidencePost] = useState<number | null>(row.confidence_post ?? null);
  const [thesisResult, setThesisResult] = useState<ThesisResult | null>((row.thesis_result as ThesisResult) ?? null);
  const [exitReason, setExitReason] = useState<ExitReason | null>((row.exit_reason as ExitReason) ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = confidencePost !== null && thesisResult !== null && exitReason !== null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 rounded border border-caution/40 bg-caution/10 px-2.5 py-1 text-xs text-caution hover:bg-caution/20"
      >
        📓 Finish review — this trade is breaking your Journal Streak
      </button>
    );
  }

  return (
    <div className="mt-2">
      <ReviewFields
        invalidation={row.invalidation}
        confidencePost={confidencePost}
        setConfidencePost={setConfidencePost}
        thesisResult={thesisResult}
        setThesisResult={setThesisResult}
        exitReason={exitReason}
        setExitReason={setExitReason}
      />
      {error && <p className="mt-2 text-xs text-blocked">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={!ready || saving}
          onClick={async () => {
            setSaving(true);
            setError(null);
            const res = await saveTradeReview({ sessionId: row.session_id, confidencePost, thesisResult, exitReason });
            setSaving(false);
            if (!res.success) {
              setError(res.error ?? "Something went wrong.");
              return;
            }
            onSaved();
          }}
          className="rounded bg-accent px-3 py-1.5 text-xs font-bold text-black disabled:opacity-40"
        >
          {saving ? "Saving..." : ready ? "Save review" : "Answer all three"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-white/50 underline">
          Later
        </button>
      </div>
    </div>
  );
}

type Filter = "all" | "authorized" | "blocked" | "after";

export default function JournalClient({
  rows,
  userId,
  trims,
  screenshots,
}: {
  rows: SessionOutcomeRow[];
  userId: string;
  trims: TrimRow[];
  screenshots: ScreenshotRow[];
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<number | null>(null);
  const [cardId, setCardId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  if (rows.length === 0) {
    return (
      <div className="rounded border border-white/10 bg-white/5 p-6 text-center text-white/60">
        No XRILL sessions found yet. Complete a session first, then come back here to journal the result.
      </div>
    );
  }

  const authorizedCount = rows.filter((r) => r.trade_authorized).length;
  const afterCount = rows.filter((r) => r.logged_after).length;
  const blockedCount = rows.length - authorizedCount - afterCount;

  const filtered = rows.filter((r) => {
    if (filter === "authorized") return r.trade_authorized;
    if (filter === "blocked") return !r.trade_authorized && !r.logged_after;
    if (filter === "after") return r.logged_after;
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
            ...(afterCount > 0 ? ([["after", `Logged After (${afterCount})`]] as [Filter, string][]) : []),
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
            const executed = !!r.trade_authorized || r.logged_after;
            const label = structureLabel(r.structure, r.legs);
            const rowTrims = trims.filter((t) => t.session_id === r.session_id);
            const rowShots = screenshots.filter((x) => x.session_id === r.session_id);
            const trimmed = rowTrims.reduce((sum, t) => sum + t.contracts, 0);
            const trimPl = rowTrims.reduce((sum, t) => sum + t.profit_loss, 0);
            const remaining = r.contracts !== null ? r.contracts - trimmed : null;
            return (
              <div
                key={r.session_id}
                id={`session-${r.session_id}`}
                className={`scroll-mt-20 rounded border bg-surface p-4 ${r.logged_after ? "border-loss/40" : "border-white/10"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-white">#{r.session_id}</span>
                    <span className="text-white/80">
                      {r.ticker} <span className="text-white/50">{label ?? r.direction}</span>
                    </span>
                    <span className="text-xs text-white/40">
                      {r.session_date ?? new Date(r.created_at).toISOString().slice(0, 10)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.engine === "daytrade" && (
                      <span className="font-mono text-xs text-daytrade">⚡ Daytrade</span>
                    )}
                    {r.logged_after ? (
                      <span className="rounded-full border border-loss/50 bg-loss/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-loss">
                        🚨 Logged After
                      </span>
                    ) : (
                      <Badge tone={r.trade_authorized ? "good" : "blocked"}>{r.trade_authorized ? "AUTHORIZED" : "BLOCKED"}</Badge>
                    )}
                    {r.trade_score !== null && (
                      <span className="font-mono text-xs text-white/50">{r.trade_score}/100</span>
                    )}
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-white/50 sm:grid-cols-6">
                  <span>{label ? "Net debit" : "Entry premium"} ${r.entry ?? "—"}</span>
                  <span>Stop premium ${r.stop ?? "—"}</span>
                  <span>Target premium ${r.target ?? "—"}</span>
                  <span>Contracts {r.contracts ?? "—"}</span>
                  <span>R:R {r.rr ? r.rr.toFixed(2) : "—"}</span>
                  {!r.trade_authorized && !r.logged_after && r.rejection_reason && (
                    <span className="text-blocked">Blocked: {r.rejection_reason}</span>
                  )}
                </div>

                {r.logged_after && r.after_fact_reasons && r.after_fact_reasons.length > 0 && (
                  <p className="mt-2 text-[11px] text-loss/80">Logged after the fact: {r.after_fact_reasons.join(" · ")}</p>
                )}

                {executed && !hasOutcome && (r.thesis || r.invalidation || r.setup_type) && (
                  <div className="mt-3 rounded border border-primary/30 bg-primary/10 p-3 text-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                      Why you're in{r.setup_type ? ` · ${r.setup_type}` : ""}
                      {tradingStyleLabel(r.trading_style) ? ` · ${tradingStyleLabel(r.trading_style)}` : ""}
                    </p>
                    {r.thesis && <p className="mt-1 text-white/85">&ldquo;{r.thesis}&rdquo;</p>}
                    {r.invalidation && (
                      <p className="mt-1 text-xs text-white/60">
                        <span className="text-loss">Wrong if:</span> {r.invalidation}. Hasn't happened? Then it's still your trade.
                      </p>
                    )}
                  </div>
                )}

                {executed && openId !== r.session_id && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setCardId(cardId === r.session_id ? null : r.session_id)}
                      className="text-xs text-white/50 underline hover:text-white/80"
                    >
                      {cardId === r.session_id ? "Hide trade card" : hasOutcome ? "🃏 Planned vs what happened" : "🃏 Trade card"}
                    </button>
                    {cardId === r.session_id && (
                      <div className="mt-2">
                        <TradeCardStrip data={toCard(r)} />
                      </div>
                    )}
                  </div>
                )}

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
                    {(r.thesis_result || r.exit_reason || r.confidence_post) && (
                      <p className="mt-2 text-xs text-white/60">
                        {[
                          r.thesis_result && `Thesis: ${THESIS_RESULTS.find((x) => x.key === r.thesis_result)?.label ?? r.thesis_result}`,
                          r.exit_reason && `Exit: ${EXIT_REASONS.find((x) => x.key === r.exit_reason)?.label ?? r.exit_reason}`,
                          (r.confidence_pre || r.confidence_post) && `Confidence ${r.confidence_pre ?? "—"} → ${r.confidence_post ?? "—"}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    {countsForJournalStreak(r) && !isReviewed(r) && (
                      <FinishReview
                        row={r}
                        onSaved={() => router.refresh()}
                      />
                    )}
                    {r.emotion && <p className="mt-2 text-white/70">Emotion: {r.emotion}</p>}
                    {r.lesson && <p className="text-white/70">Lesson: {r.lesson}</p>}
                    {rowTrims.length > 0 && (
                      <p className="mt-1 text-xs text-white/50">
                        Includes {rowTrims.length} trim{rowTrims.length === 1 ? "" : "s"} ({money(trimPl)})
                      </p>
                    )}
                    {r.mishaps && r.mishaps.length > 0 && (
                      <p className="mt-1 text-xs text-caution">
                        Mishaps: {r.mishaps.join(" · ")}
                        {r.mishap_note ? ` — ${r.mishap_note}` : ""}
                      </p>
                    )}
                  </div>
                ) : !executed ? (
                  <p className="mt-3 text-xs text-white/40">
                    This session was blocked — there's no execution to journal an outcome for.
                  </p>
                ) : openId === r.session_id ? (
                  <OutcomeForm
                    sessionId={r.session_id}
                    remaining={remaining}
                    trimPl={trimPl}
                    card={<TradeCardStrip data={toCard(r)} />}
                    invalidation={r.invalidation}
                    screenshots={<ScreenshotStrip userId={userId} sessionId={r.session_id} shots={rowShots} />}
                    onSaved={() => {
                      setOpenId(null);
                      router.refresh();
                    }}
                  />
                ) : (
                  <div className="mt-3 flex flex-wrap items-start gap-2">
                    <button
                      onClick={() => setOpenId(r.session_id)}
                      className="rounded border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:border-accent hover:text-accent"
                    >
                      📈 Record Outcome (full close)
                    </button>
                  </div>
                )}

                {executed && !hasOutcome && openId !== r.session_id && (
                  <TrimPanel sessionId={r.session_id} opened={r.contracts} trims={rowTrims} />
                )}

                {executed && openId !== r.session_id && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <ScreenshotStrip userId={userId} sessionId={r.session_id} shots={rowShots} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
