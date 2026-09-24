// Dynamic Risk Tiering Matrix -- replaces the old static "2-5% max risk"
// rule. Max per-trade account risk scales with how aggressively you're
// compounding: a 10-50% weekly pace can tolerate calmer position sizing,
// a 100-150%+ weekly sprint needs a bigger risk-per-trade to actually hit
// those milestone curves in the time available. All three tiers still sit
// on top of the same 60% deployable / 40% idle allocation wall -- this
// only changes how much of that 60% goes into any ONE trade, never the
// wall itself.
export interface RiskTier {
  key: "conservative" | "moderate" | "aggressive";
  label: string;
  shortLabel: string;
  weeklyMin: number;
  weeklyMax: number | null; // null = open-ended ("150%+")
  riskMin: number;
  riskMax: number;
  exampleWeeklyRate: number; // representative rate used in worked examples
  structureNote: string;
  tone: "primary" | "secondary" | "caution";
}

export const RISK_TIERS: RiskTier[] = [
  {
    key: "conservative",
    label: "Conservative Pace",
    shortLabel: "Conservative",
    weeklyMin: 10,
    weeklyMax: 50,
    riskMin: 2,
    riskMax: 5,
    exampleWeeklyRate: 30,
    structureNote: "Optimized for 30–45 DTE swing structures.",
    tone: "primary",
  },
  {
    key: "moderate",
    label: "Moderate Pace",
    shortLabel: "Moderate",
    weeklyMin: 50,
    weeklyMax: 100,
    riskMin: 8,
    riskMax: 12,
    exampleWeeklyRate: 75,
    structureNote: "Balances growth velocity while safeguarding the 40% cash idle buffer.",
    tone: "secondary",
  },
  {
    key: "aggressive",
    label: "Aggressive Sprint Pace",
    shortLabel: "Aggressive",
    weeklyMin: 100,
    weeklyMax: null,
    riskMin: 15,
    riskMax: 22,
    exampleWeeklyRate: 125,
    structureNote: "Built for high-velocity weekly options to hit exponential milestone curves.",
    tone: "caution",
  },
];

export function tierForWeeklyRate(rate: number): RiskTier {
  if (rate < RISK_TIERS[0].weeklyMax!) return RISK_TIERS[0];
  if (rate < RISK_TIERS[1].weeklyMax!) return RISK_TIERS[1];
  return RISK_TIERS[2];
}

// Linear-interpolate a risk % within the active tier's range, based on
// where the weekly rate sits inside that tier's band. The open-ended
// Aggressive tier clamps its upper input at 150% for interpolation
// purposes -- everything past that is treated as "max risk, 22%".
export function riskPercentForWeeklyRate(rate: number): number {
  const tier = tierForWeeklyRate(rate);
  const bandMax = tier.weeklyMax ?? 150;
  const clamped = Math.min(Math.max(rate, tier.weeklyMin), bandMax);
  const t = bandMax === tier.weeklyMin ? 1 : (clamped - tier.weeklyMin) / (bandMax - tier.weeklyMin);
  return tier.riskMin + t * (tier.riskMax - tier.riskMin);
}
