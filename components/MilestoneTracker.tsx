"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { updateBalance } from "@/app/dashboard/actions";
import { levelInfo } from "@/lib/levelInfo";
import { MILESTONES, WARMUP_FLOOR } from "@/lib/data/milestones";
import RelicRoll from "@/components/RelicRoll";
import { StarRow } from "@/components/playbook/StarUnlocks";
import { updateExpBarLook } from "@/app/dashboard/actions";
import { EXP_COLORS, EXP_STYLES, EXP_THEMES, HOMEPAGE_COLORS, type ExpColor, type ExpStyle, type ExpTheme } from "@/lib/expBar";

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

function Fill({ width, theme, color }: { width: number; theme: ExpTheme; color: ExpColor }) {
  return (
    <div
      className={`relative h-full transition-[width] duration-700 ease-out ${color === "rainbow" ? "motion-safe:animate-exp-shimmer" : ""}`}
      style={{ width: `${width}%`, background: theme.fill, backgroundSize: color === "rainbow" ? "200% 100%" : undefined }}
    >
      {/* Glossy highlight */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent" />
    </div>
  );
}

function ExpBar({
  balance,
  compact = false,
  barStyle = "classic",
  color = "gold",
}: {
  balance: number;
  compact?: boolean;
  barStyle?: ExpStyle;
  color?: ExpColor;
}) {
  const { lower, upper, stagePercent, lvl, maxed, warmup } = levelInfo(balance);
  const theme = EXP_THEMES[color];
  // Never narrower than a sliver once there's any balance, so a fresh
  // account still shows a lit bar.
  const width = balance > 0 ? Math.max(2, stagePercent) : 0;
  const money = balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const glowVar = { "--exp-glow": theme.glow } as CSSProperties;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`font-mono font-bold ${compact ? "text-xs" : "text-sm"}`} style={{ color: theme.text }}>
          LVL {lvl}
          {warmup && <span className="ml-2 font-normal opacity-60">Warm-up</span>}
        </span>
        {maxed && (
          <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-300">
            🏆 Ladder complete
          </span>
        )}
      </div>

      {/* The breathing glow (animate-exp-glow, colored via --exp-glow) lives on
          an OUTER wrapper, not on the overflow-hidden track: animating
          box-shadow on a rounded overflow-hidden element made some browsers
          (Safari especially) skip painting the fill. `isolate` +
          `transform-gpu` give the track its own layer so the fill always paints. */}
      {barStyle === "classic" ? (
        // Classic: one smooth, continuous gauge with the EXP readout printed
        // inside it and a faint dashed line along the bottom edge.
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-[11px] font-extrabold italic tracking-wider" style={{ color: theme.text }}>
            EXP
          </span>
          <div className={`flex-1 rounded-full motion-safe:animate-exp-glow ${compact ? "h-4" : "h-5"}`} style={glowVar}>
            <div className="relative isolate h-full w-full transform-gpu overflow-hidden rounded-full border border-black/70 bg-gradient-to-b from-zinc-800 to-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
              <Fill width={width} theme={theme} color={color} />
              <div
                className="pointer-events-none absolute inset-x-2 bottom-[2px] h-px opacity-40"
                style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 4px, transparent 4px 8px)" }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_4px_rgba(0,0,0,0.8)]">
                ${money} [{stagePercent.toFixed(2)}%]
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className={`mt-1 rounded-sm motion-safe:animate-exp-glow ${compact ? "h-3" : "h-4"}`} style={glowVar}>
          <div className="relative isolate h-full w-full transform-gpu overflow-hidden rounded-sm border-2 border-black/60 bg-black/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
            <Fill width={width} theme={theme} color={color} />
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
      )}

      <p className={`mt-1 font-mono text-white/60 ${compact ? "text-[10px]" : "text-xs"}`}>
        LVL {lvl} [Stage{warmup ? " 0.5" : ""}: ${lower.toLocaleString()} → ${upper.toLocaleString()}] — EXP: ${money} / $
        {upper.toLocaleString()}.00 [{stagePercent.toFixed(2)}%]
      </p>
    </div>
  );
}

// Color swatches (+ optional style toggle) for the EXP bar.
function ExpLookPicker({
  colors,
  color,
  onColor,
  barStyle,
  onStyle,
}: {
  colors: readonly ExpColor[];
  color: ExpColor;
  onColor: (c: ExpColor) => void;
  barStyle?: ExpStyle;
  onStyle?: (s: ExpStyle) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {barStyle && onStyle && (
        <div className="inline-flex overflow-hidden rounded-full border border-white/15 text-[10px] font-semibold uppercase tracking-wide">
          {EXP_STYLES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStyle(st)}
              aria-pressed={barStyle === st}
              className={`min-h-[28px] px-3 transition-colors ${barStyle === st ? "bg-white/15 text-white" : "text-white/45 hover:text-white/80"}`}
            >
              {st === "classic" ? "Classic" : "Segmented"}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2" role="radiogroup" aria-label="EXP bar color">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={color === c}
            aria-label={EXP_THEMES[c].label}
            title={EXP_THEMES[c].label}
            onClick={() => onColor(c)}
            className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
              color === c ? "scale-110 border-white" : "border-white/20"
            }`}
            style={{ background: EXP_THEMES[c].swatch, boxShadow: color === c ? `0 0 10px rgb(${EXP_THEMES[c].glow} / 0.8)` : undefined }}
          />
        ))}
      </div>
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
  initialStyle = "classic",
  initialColor = "gold",
}: {
  initialBalance: number;
  displayName?: string | null;
  initialStyle?: ExpStyle;
  initialColor?: ExpColor;
}) {
  const [barStyle, setBarStyle] = useState<ExpStyle>(initialStyle);
  const [barColor, setBarColor] = useState<ExpColor>(initialColor);

  // Optimistic: the bar changes instantly, the choice saves in the background.
  function chooseLook(next: { style?: ExpStyle; color?: ExpColor }) {
    const style = next.style ?? barStyle;
    const color = next.color ?? barColor;
    setBarStyle(style);
    setBarColor(color);
    void updateExpBarLook({ style, color });
  }

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
        <ExpBar balance={balance} barStyle={barStyle} color={barColor} />
        <Checkpoints balance={balance} />
        <div className="mt-4 border-t border-white/10 pt-3">
          <RelicRoll balance={balance} />
        </div>
        <div className="mt-3 border-t border-white/10 pt-3">
          <StarRow balance={balance} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
          <span className="text-[10px] uppercase tracking-wide text-white/40">EXP bar look</span>
          <ExpLookPicker
            colors={EXP_COLORS}
            color={barColor}
            onColor={(c) => chooseLook({ color: c })}
            barStyle={barStyle}
            onStyle={(st) => chooseLook({ style: st })}
          />
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
  const [color, setColor] = useState<ExpColor>("gold");
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

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-xs text-white/50">Current balance</div>
          <div className="font-mono text-lg font-semibold text-white">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <ExpLookPicker colors={HOMEPAGE_COLORS} color={color} onColor={setColor} />
      </div>

      <div className="mt-3">
        <ExpBar balance={balance} color={color} />
        <Checkpoints balance={balance} />
        <div className="mt-4 border-t border-white/10 pt-3">
          <RelicRoll balance={balance} compact />
        </div>
      </div>
    </div>
  );
}
