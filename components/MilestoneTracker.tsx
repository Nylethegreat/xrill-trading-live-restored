"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBalance } from "@/app/dashboard/actions";
import { levelInfo } from "@/lib/levelInfo";
import { MILESTONES, WARMUP_FLOOR } from "@/lib/data/milestones";
import RelicRoll from "@/components/RelicRoll";
import { StarRow } from "@/components/playbook/StarUnlocks";

// Which (if any) milestone thresholds were newly crossed going from `from`
// to `to` — drives the transient "LEVEL UP" flash on save.
function crossedMilestones(from: number, to: number) {
  return MILESTONES.filter((m) => from < m && to >= m);
}

function shortMoney(v: number) {
  if (v >= 1_000_000) return `$${v / 1_000_000}M`;
  if (v >= 1_000) return `$${v / 1_000}K`;
  return `$${v}`;
}

function ExpBar({ balance, compact = false }: { balance: number; compact?: boolean }) {
  const { lower, upper, stagePercent, lvl, maxed, warmup } = levelInfo(balance);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`font-mono font-bold text-yellow-300 ${compact ? "text-xs" : "text-sm"}`}>
          LVL {lvl}
          {warmup && <span className="ml-2 font-normal text-yellow-200/60">Warm-up</span>}
        </span>
        {maxed && (
          <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-300">
            🏆 Ladder complete
          </span>
        )}
      </div>

      {/* Recessed EXP track. The gold breathing glow (animate-exp-glow) lives on
          an OUTER wrapper, not on the overflow-hidden track itself: animating
          box-shadow on a rounded overflow-hidden element made some browsers
          (Safari especially) skip painting the fill, so the bar looked empty
          on some machines/accounts and full on others. `isolate` +
          `transform-gpu` give the track its own layer so the fill always paints. */}
      <div className={`mt-1 rounded-sm motion-safe:animate-exp-glow ${compact ? "h-3" : "h-4"}`}>
        <div className="relative isolate h-full w-full transform-gpu overflow-hidden rounded-sm border-2 border-black/60 bg-black/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
          {/* Fill — never narrower than a sliver once there's any balance, so a
              fresh account still shows a lit bar */}
          <div
            className="relative h-full bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-200 transition-[width] duration-700 ease-out"
            style={{ width: `${balance > 0 ? Math.max(2, stagePercent) : 0}%` }}
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
      </div>

      <p className={`mt-1 font-mono text-white/60 ${compact ? "text-[10px]" : "text-xs"}`}>
        LVL {lvl} [Stage{warmup ? " 0.5" : ""}: ${lower.toLocaleString()} → ${upper.toLocaleString()}] — EXP: $
        {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $
        {upper.toLocaleString()}.00 [{stagePercent.toFixed(2)}%]
      </p>
    </div>
  );
}

// 14 checkpoints: the $100 warm-up floor (Stage 0.5) + the 13 ladder
// milestones. Short labels so they fit on a phone.
const CHECKPOINTS = [WARMUP_FLOOR, ...MILESTONES];

function Checkpoints({ balance }: { balance: number }) {
  return (
    <div className="mt-3 grid grid-cols-7 gap-y-2 sm:grid-cols-14">
      {CHECKPOINTS.map((m) => {
        const reached = balance >= m;
        return (
          <div key={m} className="flex flex-col items-center gap-1">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] ${
                reached ? "border-yellow-400 bg-yellow-400/20 text-yellow-300" : "border-white/20 text-white/40"
              }`}
            >
              {reached ? "✓" : ""}
            </div>
            <span className={`font-mono text-[9px] ${reached ? "text-yellow-300" : "text-white/40"}`}>{shortMoney(m)}</span>
          </div>
        );
      })}
    </div>
  );
}

// Trader name pill on the ladder card (profiles.display_name). Hidden when
// the trader turned "Show my name on my ladder" off on /account.
function NamePill({ name }: { name: string }) {
  return (
    <span className="inline-flex max-w-[60%] items-center gap-1.5 truncate rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-yellow-200">
      <span className="text-yellow-300/70">●</span>
      <span className="truncate">{name}</span>
    </span>
  );
}

export default function MilestoneTracker({
  initialBalance,
  displayName = null,
}: {
  initialBalance: number;
  displayName?: string | null;
}) {
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
        {displayName && <NamePill name={displayName} />}
      </div>

      {error && <p className="mt-2 text-sm text-blocked">{error}</p>}

      <div className="mt-4">
        <ExpBar balance={balance} />
        <Checkpoints balance={balance} />
        <div className="mt-4 border-t border-white/10 pt-3">
          <RelicRoll balance={balance} />
        </div>
        <div className="mt-3 border-t border-white/10 pt-3">
          <StarRow balance={balance} />
        </div>
      </div>
    </div>
  );
}

// Read-only ladder for the landing page. Same card as the dashboard's
// Double-Up Ladder (balance, EXP bar, checkpoints, rolling relics) so the
// homepage and the app look like one product. No account required: it's an
// illustrative balance, clearly labeled EXAMPLE. $700 sits mid-way through
// LVL 2 so visitors see a lit, glowing bar rather than an empty one.
export function MilestoneTrackerPreview({ balance = 700 }: { balance?: number }) {
  return (
    <div className="rounded border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Double-Up Ladder</div>
          <div className="mt-0.5 font-mono text-[10px] text-white/35">$100 → $250 → $500 → … → $1M</div>
        </div>
        <span className="rounded-full border border-white/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/40">
          Example
        </span>
      </div>

      <div className="mt-3 text-xs text-white/50">Current balance</div>
      <div className="font-mono text-lg font-semibold text-white">
        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      <div className="mt-3">
        <ExpBar balance={balance} />
        <Checkpoints balance={balance} />
        <div className="mt-4 border-t border-white/10 pt-3">
          <RelicRoll balance={balance} compact />
        </div>
      </div>
    </div>
  );
}
