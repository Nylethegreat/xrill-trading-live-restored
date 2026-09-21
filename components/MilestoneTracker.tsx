"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBalance } from "@/app/dashboard/actions";
import { levelInfo } from "@/lib/levelInfo";
import { MILESTONES } from "@/lib/data/milestones";

// Which (if any) milestone thresholds were newly crossed going from `from`
// to `to` — drives the transient "LEVEL UP" flash on save.
function crossedMilestones(from: number, to: number) {
  return MILESTONES.filter((m) => from < m && to >= m);
}

function ExpBar({ balance, compact = false }: { balance: number; compact?: boolean }) {
  const { lower, upper, stagePercent, lvl, maxed } = levelInfo(balance);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`font-mono font-bold text-yellow-300 ${compact ? "text-xs" : "text-sm"}`}>
          LVL {lvl}
        </span>
        {maxed && (
          <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-300">
            🏆 Ladder complete
          </span>
        )}
      </div>

      {/* Recessed EXP track — wrapped in a pulsing gold glow (animate-exp-glow,
          tailwind.config.ts) purely for retention/reward feel. The
          stagePercent math driving the fill width above is untouched. */}
      <div
        className={`relative mt-1 w-full overflow-hidden rounded-sm border-2 border-black/60 bg-black/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] motion-safe:animate-exp-glow ${
          compact ? "h-3" : "h-4"
        }`}
      >
        {/* Fill */}
        <div
          className="relative h-full bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-200 transition-all duration-700 ease-out"
          style={{ width: `${stagePercent}%` }}
        >
          {/* Glossy highlight */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
        {/* Segment ticks */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.35) 0, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 10%)",
          }}
        />
      </div>

      <p className={`mt-1 font-mono text-white/60 ${compact ? "text-[10px]" : "text-xs"}`}>
        LVL {lvl} [Stage: ${lower.toLocaleString()} → ${upper.toLocaleString()}] — EXP: $
        {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $
        {upper.toLocaleString()}.00 [{stagePercent.toFixed(2)}%]
      </p>
    </div>
  );
}

export default function MilestoneTracker({ initialBalance }: { initialBalance: number }) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(initialBalance));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [levelUpLabel, setLevelUpLabel] = useState<string | null>(null);

  async function handleSave() {
    const next = parseFloat(inputValue);
    if (!Number.isFinite(next) || next < 0) {
      setError("Enter a valid balance.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await updateBalance(next);
    setSubmitting(false);
    if (!res.success) {
      setError(res.error ?? "Something went wrong.");
      return;
    }

    const crossed = crossedMilestones(balance, next);
    setBalance(next);
    setEditing(false);
    router.refresh();

    if (crossed.length > 0) {
      setLevelUpLabel(`$${crossed[crossed.length - 1].toLocaleString()}`);
      window.setTimeout(() => setLevelUpLabel(null), 3200);
    }
  }

  return (
    <div className="relative overflow-hidden rounded border border-white/10 bg-white/5 p-4">
      {/* Pulsing LEVEL UP overlay flash */}
      {levelUpLabel && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="animate-pulse text-center">
            <p className="font-mono text-lg font-extrabold tracking-widest text-yellow-300 [text-shadow:0_0_16px_rgba(250,204,21,0.9)]">
              ⚡ LEVEL UP ⚡
            </p>
            <p className="mt-0.5 font-mono text-xs font-bold tracking-wide text-yellow-200/80">
              DOUBLE UP — {levelUpLabel} reached
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-white/50">Current balance</div>
          {editing ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-32 rounded border border-white/20 bg-transparent px-2 py-1 text-sm outline-none focus:border-accent"
                autoFocus
              />
              <button
                type="button"
                disabled={submitting}
                onClick={handleSave}
                className="rounded bg-accent px-2.5 py-1 text-xs font-medium text-black hover:opacity-90 disabled:opacity-40"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setInputValue(String(balance));
                  setError(null);
                }}
                className="rounded border border-white/20 px-2.5 py-1 text-xs text-white/60"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-1 block font-mono text-lg font-semibold text-white hover:text-accent"
              title="Click to log a new balance"
            >
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-blocked">{error}</p>}

      <div className="mt-4">
        <ExpBar balance={balance} />
        <div className="mt-3 flex justify-between">
          {MILESTONES.map((m) => {
            const reached = balance >= m;
            return (
              <div key={m} className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                    reached ? "border-yellow-400 bg-yellow-400/20 text-yellow-300" : "border-white/20 text-white/40"
                  }`}
                >
                  {reached ? "✓" : ""}
                </div>
                <span className={`text-[10px] ${reached ? "text-yellow-300" : "text-white/40"}`}>
                  ${m.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Compact, read-only EXP bar for the landing-page hero — no account
// required, so it renders an illustrative example rather than real user
// data (clearly labeled as such).
export function MilestoneTrackerPreview({ balance = 510 }: { balance?: number }) {
  return (
    <div className="rounded border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-white/40">Double-Up Ladder (example)</span>
      </div>
      <div className="mt-1.5">
        <ExpBar balance={balance} compact />
      </div>
    </div>
  );
}
