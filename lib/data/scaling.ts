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

// n = ln(400) / ln(r)  where r = 1 + weeklyRate  (400 = SCALING_MULTIPLE,
// $100,000 / $250 -- this comment used to say 500, stale from an earlier
// version of the model; the math below always used SCALING_MULTIPLE
// directly so the rendered numbers were never wrong, only this comment).
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

// ---------------------------------------------------------------------------
// Realistic variant: red weeks. Nobody wins every week, so the milestone
// table can model a losing week every `redEvery` weeks (week numbers that
// are a multiple of redEvery) at `redPercent` (e.g. 25 = a -25% week).
// redEvery = 0 means "never" -- the original every-week-green model.
// ---------------------------------------------------------------------------
export const RED_EVERY_OPTIONS = [
  { every: 0, label: "Never (ideal)" },
  { every: 4, label: "1 in 4 weeks" },
  { every: 3, label: "1 in 3 weeks" },
  { every: 2, label: "1 in 2 weeks" },
] as const;

export function isRedWeek(week: number, redEvery: number): boolean {
  return redEvery > 0 && week > 0 && week % redEvery === 0;
}

export function balanceWithRedWeeks(
  week: number,
  greenPercent: number,
  redPercent: number,
  redEvery: number,
  principal = SCALING_PRINCIPAL
): number {
  let bal = principal;
  for (let w = 1; w <= week; w++) {
    bal *= isRedWeek(w, redEvery) ? 1 - redPercent / 100 : 1 + greenPercent / 100;
  }
  return bal;
}

// Average weekly growth once red weeks are mixed in (geometric mean of one
// full green/red cycle), as a percent. Can be negative.
export function effectiveWeeklyPercent(greenPercent: number, redPercent: number, redEvery: number): number {
  if (redEvery <= 0) return greenPercent;
  const cycle = Math.pow(1 + greenPercent / 100, redEvery - 1) * (1 - redPercent / 100);
  return (Math.pow(cycle, 1 / redEvery) - 1) * 100;
}

// First whole week the balance reaches `target`, or null if it never does
// (effective growth <= 0) within `cap` weeks.
export function weeksToTarget(
  greenPercent: number,
  redPercent: number,
  redEvery: number,
  target = SCALING_TARGET,
  principal = SCALING_PRINCIPAL,
  cap = 520
): number | null {
  if (effectiveWeeklyPercent(greenPercent, redPercent, redEvery) <= 0) return null;
  let bal = principal;
  for (let w = 1; w <= cap; w++) {
    bal *= isRedWeek(w, redEvery) ? 1 - redPercent / 100 : 1 + greenPercent / 100;
    if (bal >= target) return w;
  }
  return null;
}

// Paces shown in the realistic milestone table: the original three plus a
// steadier 25% pace.
export const MILESTONE_PACES = [100, 75, 50, 25] as const;
