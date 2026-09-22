// Data + math for the public Playbook's "Compound Scaling Roadmap"
// ($200 -> $100,000 illustrative weekly-compounding model). This is a
// separate, simplified narrative from the execution-based Twelve-Stage
// roadmap on the same page (60%-allocation position sizing) — that one is
// what the system actually enforces trade-by-trade; this one is a
// pedagogical "power of compounding" illustration. Keep both, but never
// blur them together in copy.
export const SCALING_PRINCIPAL = 250;
export const SCALING_TARGET = 100_000;
export const SCALING_MULTIPLE = SCALING_TARGET / SCALING_PRINCIPAL; // 500

export interface WeeklyRatePlan {
  ratePercent: number; // e.g. 100 for "100% weekly"
  weeks: number; // whole weeks until the target is crossed
  finalBalance: number; // balance at that whole week (overshoots the target —
  // you can't stop mid-week, so the crossing week ends above $100K)
}

// n = ln(500) / ln(r)  where r = 1 + weeklyRate.
// Whole weeks required (rounded up, since the target is only realized
// crossing week n, not part-way through it).
export function weeksToMultiply(multiple: number, ratePercent: number): number {
  const r = 1 + ratePercent / 100;
  return Math.log(multiple) / Math.log(r);
}

export function balanceAtWeek(week: number, ratePercent: number, principal = SCALING_PRINCIPAL): number {
  return principal * Math.pow(1 + ratePercent / 100, week);
}

function buildPlan(ratePercent: number): WeeklyRatePlan {
  const weeks = Math.ceil(weeksToMultiply(SCALING_MULTIPLE, ratePercent));
  return { ratePercent, weeks, finalBalance: Math.round(balanceAtWeek(weeks, ratePercent)) };
}

// 100% / 75% / 50% weekly, matching the exact 9 / 12 / 16-week, $102,400 /
// $160,932 / $131,368 figures from the blueprint (computed, not hardcoded,
// so they stay correct if the model ever changes).
export const WEEKLY_RATE_PLANS: WeeklyRatePlan[] = [100, 75, 50].map(buildPlan);

export const SCALING_MILESTONE_WEEKS = [0, 3, 6, 9, 12, 15, 16] as const;
