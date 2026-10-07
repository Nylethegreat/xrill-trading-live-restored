import { MILESTONES, WARMUP_FLOOR } from "@/lib/data/milestones";

// Moved out of components/MilestoneTracker.tsx (a "use client" file) --
// calling a plain function exported from a client-component module
// directly (not rendered as JSX) from a Server Component is fragile in
// the App Router: it can throw at request time even though `tsc` and
// `next build` don't catch it, since dynamic routes aren't executed
// during build. This file has no directive, so it's safe to import from
// either side of the client/server boundary.
export function levelInfo(balance: number) {
  const floor = MILESTONES[0];
  const ceiling = MILESTONES[MILESTONES.length - 1];

  // Below $250 = Stage 0.5, the warm-up rung ($100 -> $250). Shown as
  // "LVL 0.5" so a $100 challenge account has a real bar to fill instead of
  // reading as LVL 1 of a stage it hasn't reached yet.
  if (balance < floor) {
    const stagePercent = Math.min(1, Math.max(0, balance / floor)) * 100;
    return { floor, ceiling, lower: WARMUP_FLOOR, upper: floor, stagePercent, lvl: "0.5", maxed: false, warmup: true };
  }

  let lowerIdx = 0;
  for (let i = 0; i < MILESTONES.length - 1; i++) {
    if (balance >= MILESTONES[i]) lowerIdx = i;
  }
  const lower = MILESTONES[lowerIdx];
  const upper = MILESTONES[Math.min(lowerIdx + 1, MILESTONES.length - 1)];
  // EXP-bar percent is balance-over-the-current-target (not the rung's own
  // span) so it reads like an RPG bar: "$510 / $1,000 [51%]" rather than a
  // percentage of the $500-$1,000 span.
  const stagePercent = Math.min(1, Math.max(0, balance / upper)) * 100;
  const lvl = String(lowerIdx + 1);
  const maxed = balance >= ceiling;

  return { floor, ceiling, lower, upper, stagePercent, lvl, maxed, warmup: false };
}
