// Shared "Double-Up Ladder" stage math — single source of truth for
// MilestoneTracker (dashboard, member-only) and StageStatusBadge (public
// homepage hero pill), so the two can never show different stage labels
// for the same balance.
// The full 12-stage $250 -> $1M roadmap (same caps as the Playbook's
// STAGES table and the stage relics in lib/data/relics.ts). 13 points =
// 12 levels: LVL n spans MILESTONES[n-1] -> MILESTONES[n]; $1M = LVL 12 maxed.
// Stage 0.5 ("warm-up", $100 -> $250) sits BELOW the ladder for small
// challenge accounts. It isn't one of the 12 relic stages, so it lives here
// as its own floor instead of being added to MILESTONES (which would shift
// every LVL number and relic index).
export const WARMUP_FLOOR = 100;

export const MILESTONES = [
  250, 500, 1_000, 2_000, 4_000, 8_000, 16_000, 32_000, 64_000, 128_000, 256_000, 512_000, 1_000_000,
] as const;

export interface StageInfo {
  stage: number; // 0.5 = warm-up stage below $250
  lower: number;
  upper: number;
  maxed: boolean;
}

export function stageInfo(balance: number): StageInfo {
  if (balance < MILESTONES[0]) return { stage: 0.5, lower: WARMUP_FLOOR, upper: MILESTONES[0], maxed: false };
  const ceiling = MILESTONES[MILESTONES.length - 1];
  let lowerIdx = 0;
  for (let i = 0; i < MILESTONES.length - 1; i++) {
    if (balance >= MILESTONES[i]) lowerIdx = i;
  }
  const lower = MILESTONES[lowerIdx];
  const upper = MILESTONES[Math.min(lowerIdx + 1, MILESTONES.length - 1)];
  return { stage: lowerIdx + 1, lower, upper, maxed: balance >= ceiling };
}

// "$500 → $1,000 (Stage 2)" / "LADDER COMPLETE — $5,000+" once maxed.
export function stageLabel(balance: number): string {
  const { stage, lower, upper, maxed } = stageInfo(balance);
  if (maxed) return `LADDER COMPLETE — $${lower.toLocaleString()}+`;
  return `$${lower.toLocaleString()} → $${upper.toLocaleString()} (Stage ${stage})`;
}
