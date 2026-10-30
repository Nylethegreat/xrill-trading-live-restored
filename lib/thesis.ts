// Trade thesis: the "why" behind a trade, captured in the engine and
// carried all the way to the journal so a position never outlives the
// reason it was opened. Everything here is optional -- none of it gates
// a trade. Shared by both wizards, the server actions, the journal and
// XRILL Intelligence.

import { isKnownStrategyChoice, strategyNeedsVolume } from "@/lib/data/strategies";
import { isTradingStyleKey } from "@/lib/data/tradingStyles";

export interface ThesisInput {
  strategy?: string | null; // a STRATEGIES name or OTHER_STRATEGY
  tradingStyle?: string | null; // a TRADING_STYLES key (holding horizon)
  thesis?: string | null; // what you think happens / how it plays out
  invalidation?: string | null; // "I'm wrong if..."
  confidencePre?: number | null; // 1-10, before entry
}

export interface GreeksInput {
  delta?: number | null; // -1..1 (puts negative)
  theta?: number | null; // per day, per share (e.g. -0.18)
}

export const THESIS_MAX = 500;
export const INVALIDATION_MAX = 300;

export type ThesisResult = "played_out" | "partial" | "failed";
export type ExitReason = "target" | "stop" | "invalidation" | "emotional" | "time" | "other";

export const THESIS_RESULTS: { key: ThesisResult; label: string }[] = [
  { key: "played_out", label: "Played out" },
  { key: "partial", label: "Partly" },
  { key: "failed", label: "Didn't happen" },
];

export const EXIT_REASONS: { key: ExitReason; label: string; hint: string }[] = [
  { key: "target", label: "Hit target", hint: "Took profit at the planned level" },
  { key: "stop", label: "Hit stop", hint: "Planned stop got taken out" },
  { key: "invalidation", label: "Wrong-if happened", hint: "Your invalidation triggered, so you got out" },
  { key: "emotional", label: "Emotional / nerves", hint: "Got out on a feeling, not a rule" },
  { key: "time", label: "Ran out of time", hint: "Theta, end of day, or expiry forced it" },
  { key: "other", label: "Other", hint: "Something else" },
];

export function thesisResultLabel(v: string | null | undefined) {
  return THESIS_RESULTS.find((r) => r.key === v)?.label ?? null;
}

export function exitReasonLabel(v: string | null | undefined) {
  return EXIT_REASONS.find((r) => r.key === v)?.label ?? null;
}

const cleanText = (v: unknown, max: number) => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
};

const cleanRating = (v: unknown) =>
  typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 10 ? v : null;

// Server-side: never trust the client, drop anything malformed rather
// than failing the session (these are optional extras).
export function cleanThesis(t: ThesisInput | null | undefined) {
  return {
    setup_type: isKnownStrategyChoice(t?.strategy) ? t!.strategy! : null,
    trading_style: isTradingStyleKey(t?.tradingStyle) ? t!.tradingStyle! : null,
    thesis: cleanText(t?.thesis, THESIS_MAX),
    invalidation: cleanText(t?.invalidation, INVALIDATION_MAX),
    confidence_pre: cleanRating(t?.confidencePre),
  };
}

export function cleanGreeks(g: GreeksInput | null | undefined) {
  const d = g?.delta;
  const th = g?.theta;
  return {
    delta: typeof d === "number" && Number.isFinite(d) && d >= -1 && d <= 1 ? d : null,
    theta: typeof th === "number" && Number.isFinite(th) && th >= -100 && th <= 100 ? th : null,
  };
}

export function cleanReview(r: { confidencePost?: number | null; thesisResult?: string | null; exitReason?: string | null }) {
  return {
    confidence_post: cleanRating(r.confidencePost),
    thesis_result: THESIS_RESULTS.some((x) => x.key === r.thesisResult) ? (r.thesisResult as ThesisResult) : null,
    exit_reason: EXIT_REASONS.some((x) => x.key === r.exitReason) ? (r.exitReason as ExitReason) : null,
  };
}

export { strategyNeedsVolume };

// Plain-dollar translation of the greeks for the whole position. One
// contract = 100 shares, so delta 0.42 means ~$42 per $1 move in the
// stock, and theta -0.18 means ~$18/day lost to time if nothing moves.
export function explainGreeks(opts: {
  delta: number | null;
  theta: number | null;
  contracts: number;
  entryPremium: number | null;
  ticker?: string;
}) {
  const n = Math.max(1, opts.contracts || 1);
  const name = opts.ticker?.trim() || "the stock";
  const out: { deltaLine: string | null; thetaLine: string | null; thetaPctPerDay: number | null; thetaHeavy: boolean } = {
    deltaLine: null,
    thetaLine: null,
    thetaPctPerDay: null,
    thetaHeavy: false,
  };

  if (opts.delta !== null && Number.isFinite(opts.delta) && opts.delta !== 0) {
    const perDollar = Math.round(Math.abs(opts.delta) * 100 * n);
    const move = opts.delta > 0 ? "up" : "down";
    out.deltaLine = `${name} $1 ${move} ≈ +$${perDollar} for you`;
  }

  if (opts.theta !== null && Number.isFinite(opts.theta) && opts.theta !== 0) {
    const perDay = Math.round(Math.abs(opts.theta) * 100 * n);
    // Typed as a positive number by habit? A long option still loses time
    // value, so treat the magnitude as decay unless it's clearly a net
    // short-premium position (we only trade long premium in XRILL).
    out.thetaLine = `Sitting still costs ~$${perDay}/day`;
    if (opts.entryPremium && opts.entryPremium > 0) {
      const pct = (Math.abs(opts.theta) / opts.entryPremium) * 100;
      out.thetaPctPerDay = Math.round(pct * 10) / 10;
      out.thetaHeavy = pct >= 10;
    }
  }

  return out;
}
