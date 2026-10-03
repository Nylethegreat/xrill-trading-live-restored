"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import {
  AFTER_GUIDANCE,
  compareCheckIns,
  scoreCoachCheckIn,
  type CheckInPhase,
  type CoachInput,
  type CoachResult,
} from "@/lib/coach";
import { savePositionCheckIn } from "@/app/intelligence/actions";

// Each trait keeps its own neuron-palette color, same as the original
// Coach card, so the four read as distinct pillars.
const DIMENSIONS: { key: keyof CoachInput; label: string; rgb: string }[] = [
  { key: "confidence", label: "Confidence", rgb: "250 204 21" }, // yellow
  { key: "discipline", label: "Discipline", rgb: "34 197 94" }, // green
  { key: "emotionalControl", label: "Emotional control", rgb: "34 211 238" }, // cyan
  { key: "patience", label: "Patience", rgb: "251 146 60" }, // orange
];

const STATUS_TONE: Record<CoachResult["status"], "good" | "info" | "caution" | "blocked"> = {
  ELITE: "good",
  READY: "info",
  CAUTION: "caution",
  "NOT READY": "blocked",
};

export interface CheckInPosition {
  id: number;
  label: string;
  status: "open" | "closed";
}

export type CheckInsBySession = Record<number, Partial<Record<CheckInPhase, CoachInput & { note: string | null }>>>;

const DEFAULT_VALUES: CoachInput = { confidence: 5, discipline: 5, emotionalControl: 5, patience: 5 };

export default function PositionCheckIn({
  positions,
  checkIns,
  initialPositionId,
}: {
  positions: CheckInPosition[];
  checkIns: CheckInsBySession;
  initialPositionId: number | null;
}) {
  const router = useRouter();
  const firstId =
    initialPositionId && positions.some((p) => p.id === initialPositionId) ? initialPositionId : positions[0]?.id ?? null;
  const [positionId, setPositionId] = useState<number | null>(firstId);

  const position = positions.find((p) => p.id === positionId) ?? null;
  const existing = positionId ? checkIns[positionId] ?? {} : {};

  // Default phase: no "before" yet -> capture that first; otherwise "after".
  const defaultPhase: CheckInPhase = existing.before ? "after" : "before";
  const [phase, setPhase] = useState<CheckInPhase>(defaultPhase);
  const [values, setValues] = useState<CoachInput>(DEFAULT_VALUES);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<CoachResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Switching position resets the form to that position's next phase.
  useEffect(() => {
    const ex = positionId ? checkIns[positionId] ?? {} : {};
    setPhase(ex.before ? "after" : "before");
    setResult(null);
    setError(null);
    setValues(DEFAULT_VALUES);
    setNote("");
    // Only on position change -- not when a save refreshes checkIns, or the
    // result the student just got would be wiped.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionId]);

  const comparison = useMemo(
    () => (existing.before && existing.after ? compareCheckIns(existing.before, existing.after) : null),
    [existing.before, existing.after]
  );

  if (positions.length === 0) {
    return (
      <div className="rounded border border-cyan-400/25 bg-surface p-5 text-sm text-white/70">
        <p>
          You have no open positions to check in on. The check-in runs <span className="text-white">per position</span>:
          clear the gate in a{" "}
          <Link href="/session" className="text-primary underline">
            XRILL session
          </Link>
          , then come back here to log how you feel going into the trade — and again once you're out.
        </p>
      </div>
    );
  }

  const run = async () => {
    if (!positionId) return;
    const r = scoreCoachCheckIn(values);
    setResult(r);
    setSaving(true);
    setError(null);
    const res = await savePositionCheckIn({ sessionId: positionId, phase, ...values, note });
    setSaving(false);
    if (!res.success) {
      setError(res.error ?? "Couldn't save the check-in.");
      return;
    }
    router.refresh();
  };

  const copy = result ? (phase === "after" ? AFTER_GUIDANCE[result.status] : result) : null;
  const open = positions.filter((p) => p.status === "open");
  const closed = positions.filter((p) => p.status === "closed");

  return (
    <div className="rounded border border-cyan-400/25 bg-surface p-4 shadow-[0_0_22px_-8px_rgba(34,211,238,0.45)]">
      <label className="block text-sm text-white/70">
        Run this check-in for
        <select
          value={positionId ?? ""}
          onChange={(e) => setPositionId(Number(e.target.value))}
          className="mt-1 block w-full rounded border border-white/20 bg-[#0b0e1a] px-3 py-2 text-sm text-white outline-none focus:border-accent"
        >
          {open.length > 0 && (
            <optgroup label="Open positions">
              {open.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </optgroup>
          )}
          {closed.length > 0 && (
            <optgroup label="Closed in the last 7 days">
              {closed.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </label>

      <div className="mt-4 flex gap-2" role="group" aria-label="Check-in phase">
        {(["before", "after"] as const).map((ph) => (
          <button
            key={ph}
            type="button"
            aria-pressed={phase === ph}
            onClick={() => {
              setPhase(ph);
              setResult(null);
            }}
            className={`flex-1 rounded border px-3 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
              phase === ph ? "border-accent bg-accent/15 text-accent" : "border-white/15 text-white/50 hover:text-white/80"
            }`}
          >
            {ph === "before" ? "Before · at entry" : "After · coming out"}
            {existing[ph] && <span className="ml-1.5 text-white/40">✓</span>}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-white/50">
        {phase === "before"
          ? "Rate how you feel right now, as you go into this trade. Capture it before the trade can change your memory of it."
          : `Rate how you feel now that ${position?.status === "closed" ? "the trade is closed" : "you're in it"}. Be honest — this gets compared against your entry snapshot.`}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DIMENSIONS.map((d) => (
          <label
            key={d.key}
            style={{ "--trait": d.rgb } as React.CSSProperties}
            className="block rounded border border-[rgb(var(--trait)/0.2)] bg-[rgb(var(--trait)/0.04)] p-3 text-sm transition-shadow hover:shadow-[0_0_16px_-6px_rgb(var(--trait)/0.7)]"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wide text-[rgb(var(--trait))] [text-shadow:0_0_8px_rgb(var(--trait)/0.55)]">
                {d.label}
              </span>
              <span className="font-mono text-white/80 [text-shadow:0_0_6px_rgb(var(--trait)/0.5)]">{values[d.key]}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={values[d.key]}
              onChange={(e) => setValues((v) => ({ ...v, [d.key]: Number(e.target.value) }))}
              style={{ accentColor: `rgb(${d.rgb})` }}
              className="w-full"
            />
          </label>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        rows={2}
        placeholder={phase === "before" ? "One line: why this trade, and what are you feeling?" : "One line: what did the trade do to you?"}
        className="mt-4 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
      />

      <button
        type="button"
        onClick={run}
        disabled={saving}
        className="mt-3 rounded bg-primary px-4 py-2 text-sm font-medium text-white shadow-[0_0_14px_-3px_rgba(59,130,246,0.8)] transition-shadow hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving…" : `Run ${phase === "before" ? "entry" : "exit"} check-in${position ? ` for ${position.label.split(" · ")[0]}` : ""}`}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {result && copy && (
        <div className="mt-4 rounded border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <Badge tone={STATUS_TONE[result.status]}>{result.status}</Badge>
            <span className="font-mono text-sm text-white/70">
              {result.score}/40 · {result.average.toFixed(1)}/10
            </span>
          </div>
          <p className="mt-2 text-sm text-white">{copy.headline}</p>
          <p className="text-sm text-white/60">{copy.guidance}</p>
        </div>
      )}

      <div className="mt-5 border-t border-white/10 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">Before vs after</h3>
        {comparison ? (
          <>
            <div className="mt-3 space-y-1.5">
              {comparison.deltas.map((d) => (
                <div key={d.key} className="flex items-center justify-between font-mono text-sm">
                  <span className="text-white/70">{d.label}</span>
                  <span>
                    <span className="text-white/50">{d.before}</span>
                    <span className="mx-1.5 text-white/30">→</span>
                    <span className="text-white">{d.after}</span>
                    <span
                      className={`ml-2 inline-block w-8 text-right ${
                        d.delta > 0 ? "text-accent" : d.delta < 0 ? "text-red-400" : "text-white/40"
                      }`}
                    >
                      {d.delta > 0 ? `+${d.delta}` : d.delta}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-white/80">{comparison.summary}</p>
            {(existing.before?.note || existing.after?.note) && (
              <div className="mt-3 space-y-1 text-xs text-white/50">
                {existing.before?.note && <p>Going in: “{existing.before.note}”</p>}
                {existing.after?.note && <p>Coming out: “{existing.after.note}”</p>}
              </div>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-white/50">
            {existing.before
              ? "Entry snapshot saved. Run the “After” check-in once you're out of the trade to see how it moved you."
              : "Start with the “Before” check-in at entry. The comparison shows up once you've logged both."}
          </p>
        )}
      </div>
    </div>
  );
}
