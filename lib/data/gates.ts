// Single source of truth for the public-facing "8 Gates" copy — used by the
// detailed list on /about and the interactive horizontal pipeline on /.
// Mirrors the real stages implemented in lib/xrill.ts (scoreDailyCheckIn,
// scoreTradeGate, scoreSetup, evaluateTradePlan, evaluateRisk, scoreExecution,
// calculateTradeScore, evaluateAuthorization) so marketing copy never drifts
// from what the wizard actually enforces.
//
// `tagline` is the richer, tactical one-liner used only on the public
// landing-page pipeline preview (Part 1 spec) — real gate names/details stay
// authoritative and unchanged so the wizard and the marketing copy can never
// describe two different systems.
export interface Gate {
  n: number;
  name: string;
  short: string;
  detail: string;
  tagline: string;
}

export const GATES: Gate[] = [
  {
    n: 1,
    name: "Daily Check-In",
    short: "Emotional check",
    detail: "Sleep, focus, emotional state, discipline. Score below 3/4 and the session stops here.",
    tagline: "Market Condition — confirm you (and the tape) are in the right state before hunting setups.",
  },
  {
    n: 2,
    name: "Trade Gate",
    short: "Lockout window",
    detail: "Market open, inside trading hours, liquidity, news risk clear, mentally allowed. Needs 4/5.",
    tagline: "Setup Recognition — the ticker has to pattern-match one of the 20 core strategies.",
  },
  {
    n: 3,
    name: "Setup Score",
    short: "Confluence",
    detail: "Five plain-language checks — trend, key level, momentum/volume, news clear, risk/reward — 5 points each. Needs 20/25 to continue.",
    tagline: "Multi-Timeframe Confirmation — higher-timeframe bias has to align with the lower-timeframe trigger.",
  },
  {
    n: 4,
    name: "Trade Plan",
    short: "Plan lock",
    detail: "Ticker, Call/Put, entry premium, stop or full-premium-at-risk, target premium, contracts. R:R must clear 2.0.",
    tagline: "Directional Bias — long or short, mapped explicitly to structure before a contract is picked.",
  },
  {
    n: 5,
    name: "Risk Manager",
    short: "Risk sizing ≤ 2–5%",
    detail: "Your account balance and risk % dynamically cap position size — never a fixed number.",
    tagline: "Contract/Instrument Fit — a Greeks check confirms the right contract for the setup and timeframe.",
  },
  {
    n: 6,
    name: "Execution Check",
    short: "Execution discipline",
    detail: "Confirmation, planned entry, stop already placed, inside daily loss limit, trading the plan not emotions.",
    tagline: "Risk Invalidation & Hard Stop — the exact level that proves you wrong, set before entry.",
  },
  {
    n: 7,
    name: "XRILL Score",
    short: "Composite score",
    detail: "A weighted 0–100 composite of every gate above. Needs 80+ to authorize.",
    tagline: "Pre-Trade Gate Score — the minimum composite score required to fire, no exceptions.",
  },
  {
    n: 8,
    name: "Authorization",
    short: "Final sign-off",
    detail: "Every gate re-checked server-side. One failure anywhere blocks the trade and logs why.",
    tagline: "Execution & Journal Lock — trade taken, logged, and locked into the record either way.",
  },
];
