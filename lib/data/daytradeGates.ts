// Public-facing copy for the Daytrade Engine's pipeline — the cyan/blue
// sibling of lib/data/gates.ts's GATES array, shown on the homepage's
// pipeline preview when a visitor toggles to the "fast pass" view. Mirrors
// the real stages implemented in lib/xrill.ts (scoreFastTradeGate, scoreSetup,
// evaluateTradePlan, evaluateRisk, scoreExecution, evaluateFastAuthorization)
// and app/session/actions.ts's submitFastSession, so this can never drift
// from what the wizard actually enforces.
//
// Same Gate shape as the standard engine's GATES so GatePipeline.tsx can
// render either array through one component. `auto: true` marks
// Authorization here the same way it marks XRILL Score/Authorization on the
// standard engine — no interactive questions, just a calculated verdict from
// the steps above it. Unlike the standard engine there's no separate
// composite-score step: evaluateFastAuthorization returns a plain
// authorized/blocked call directly.
import type { Gate } from "@/lib/data/gates";

export const DAYTRADE_GATES: Gate[] = [
  {
    n: 1,
    name: "Trade Gate (Fast)",
    short: "Psych + liquidity",
    detail: "Two questions, both required: psychologically clear to trade, and liquidity acceptable. Low liquidity can be dangerous here unless you're careful — this engine trades higher risk with less confluence.",
    tagline: "Beware — you're opting into a faster, higher-risk pass. Only the two checks that matter most at speed.",
  },
  {
    n: 2,
    name: "Setup Read",
    short: "Confluence (informational)",
    detail: "The same five-point setup checklist as the standard engine — trend, key level, momentum/volume, news clear, risk/reward — but here it's informational only and never blocks the trade.",
    tagline: "Know your confluence going in, even if you're not required to have all of it.",
  },
  {
    n: 3,
    name: "Trade Plan",
    short: "Plan lock",
    detail: "Ticker, Call/Put, entry premium, stop or full-premium-at-risk, target premium, contracts. R:R must clear 2.0 — same rule as the standard engine.",
    tagline: "Directional Bias — mapped explicitly before a contract is picked, no matter how fast the pass.",
  },
  {
    n: 4,
    name: "Risk Manager",
    short: "Risk sizing 2–22%",
    detail: "Same dynamic cap as the standard engine — your account balance and risk % (2–22% on the Dynamic Risk Tiering Matrix) size the position, and contracts are also capped by what the account can actually afford to buy, not just stop distance.",
    tagline: "Fast doesn't mean unsized — the affordability and risk caps still apply in full.",
  },
  {
    n: 5,
    name: "Execution Check",
    short: "Execution discipline",
    detail: "Confirmation, planned entry, stop already placed, inside daily loss limit, trading the plan not emotions. Needs 4/5 — identical to the standard engine.",
    tagline: "The same discipline check either engine runs — speed never skips this one.",
  },
  {
    n: 6,
    name: "Authorization",
    short: "Final sign-off",
    detail: "A plain authorized/blocked verdict from the Trade Gate, Risk Manager, and Execution Check above — re-checked server-side. No composite 0–100 score here; inventing new weights for a trimmed flow would be arbitrary.",
    tagline: "Trade taken, logged, and locked into the record either way — same as the standard engine.",
    auto: true,
  },
];
