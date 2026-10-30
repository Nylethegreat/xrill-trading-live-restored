"use client";

import { OTHER_STRATEGY, STRATEGIES, STRATEGY_CATEGORIES, getStrategy } from "@/lib/data/strategies";
import { INVALIDATION_MAX, THESIS_MAX } from "@/lib/thesis";
import { TRADING_STYLES, getTradingStyle } from "@/lib/data/tradingStyles";

export interface ThesisState {
  strategy: string;
  tradingStyle: string;
  thesis: string;
  invalidation: string;
  confidencePre: number | null;
}

export const EMPTY_THESIS: ThesisState = { strategy: "", tradingStyle: "", thesis: "", invalidation: "", confidencePre: null };

// Literal class strings so Tailwind's JIT picks them up.
const TONE = {
  accent: { focus: "focus:border-accent", on: "border-accent bg-accent text-black", text: "text-accent" },
  daytrade: { focus: "focus:border-daytrade", on: "border-daytrade bg-daytrade text-black", text: "text-daytrade" },
} as const;

// Strategy picker + the optional "why" behind the trade. Shown at the
// top of the Setup Score step in both engines. Nothing here is required:
// a blank thesis never blocks a trade, it just leaves the journal with
// less to show you later.
export default function ThesisFields({
  value,
  onChange,
  tone = "accent",
}: {
  value: ThesisState;
  onChange: (next: ThesisState) => void;
  tone?: keyof typeof TONE;
}) {
  const t = TONE[tone];
  const picked = getStrategy(value.strategy);
  const style = getTradingStyle(value.tradingStyle);

  return (
    <div className="mb-5 space-y-3 rounded border border-white/10 bg-white/5 p-3">
      <div>
        <label className="mb-1 block text-sm text-white/70">Strategy</label>
        <select
          value={value.strategy}
          onChange={(e) => onChange({ ...value, strategy: e.target.value })}
          className={`w-full rounded border border-white/20 bg-surface px-3 py-2 text-sm outline-none ${t.focus}`}
        >
          <option value="">Pick the play you're running…</option>
          {STRATEGY_CATEGORIES.map((cat) => (
            <optgroup key={cat} label={cat}>
              {STRATEGIES.filter((s) => s.category === cat).map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={OTHER_STRATEGY}>Other / not listed</option>
        </select>
        {picked && (
          <p className="mt-1 text-xs text-white/45">
            {picked.definition}{" "}
            <span className={picked.volumeRequired ? "text-caution" : t.text}>
              {picked.volumeRequired ? "Needs volume to confirm." : "Volume is a bonus here, not a requirement."}
            </span>
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">
          Trading style <span className="text-xs text-white/35">(optional, how long you plan to hold)</span>
        </label>
        <select
          value={value.tradingStyle}
          onChange={(e) => onChange({ ...value, tradingStyle: e.target.value })}
          className={`w-full rounded border border-white/20 bg-surface px-3 py-2 text-sm outline-none ${t.focus}`}
        >
          <option value="">Pick your holding horizon…</option>
          {TRADING_STYLES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.name} · {s.horizon}
            </option>
          ))}
        </select>
        {style && (
          <p className="mt-1 text-xs text-white/45">
            <span className={t.text}>{style.horizon}.</span> {style.definition}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">
          What do you think happens? <span className="text-xs text-white/35">(optional)</span>
        </label>
        <textarea
          value={value.thesis}
          maxLength={THESIS_MAX}
          rows={2}
          onChange={(e) => onChange({ ...value, thesis: e.target.value })}
          placeholder="Reclaims VWAP after the morning flush, squeezes to yesterday's high"
          className={`w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm outline-none ${t.focus}`}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">
          I'm wrong if… <span className="text-xs text-white/35">(optional, but this is the one that saves you)</span>
        </label>
        <input
          value={value.invalidation}
          maxLength={INVALIDATION_MAX}
          onChange={(e) => onChange({ ...value, invalidation: e.target.value })}
          placeholder="Loses VWAP on a 5-minute close"
          className={`w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm outline-none ${t.focus}`}
        />
        <p className="mt-1 text-xs text-white/35">
          When you're itching to exit, check this instead of your feelings. If it hasn't happened, the trade is still
          your trade.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">
          Confidence before entry <span className="text-xs text-white/35">(optional, tap again to clear)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...value, confidencePre: value.confidencePre === n ? null : n })}
              className={`h-8 w-8 rounded border text-sm font-mono ${
                value.confidencePre === n ? t.on : "border-white/20 text-white/60 hover:border-white/40"
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
