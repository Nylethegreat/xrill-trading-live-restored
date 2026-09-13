// Shared "Double-Up Ladder" stage math — single source of truth for
// MilestoneTracker (dashboard, member-only) and StageStatusBadge (public
// homepage hero pill), so the two can never show different stage labels
// for the same balance.
export const MILESTONES = [250, 500, 1000, 2000, 5000] as const;

export interface StageInfo {
  stage: number;
  lower: number;
  upper: number;
  maxed: boolean;
}

export function stageInfo(balance: number): StageInfo {
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
