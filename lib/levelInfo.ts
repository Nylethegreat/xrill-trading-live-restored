import { MILESTONES } from "@/lib/data/milestones";

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
  const lvl = lowerIdx + 1;
  const maxed = balance >= ceiling;

  return { floor, ceiling, lower, upper, stagePercent, lvl, maxed };
}
