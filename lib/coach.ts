// Ported from the original XRILL Python coach.py (menu item "10. XRILL
// Coach" in the CLI). A quick pre-session mindset self-check — distinct
// from the Daily Check-In gate in the session wizard, which asks four
// yes/no questions. This is a 1-10 scale on four dimensions, unchanged
// from the original thresholds.

export interface CoachInput {
  confidence: number;
  discipline: number;
  emotionalControl: number;
  patience: number;
}

export type CoachStatus = "ELITE" | "READY" | "CAUTION" | "NOT READY";

export interface CoachResult {
  score: number;
  average: number;
  status: CoachStatus;
  headline: string;
  guidance: string;
}

export function scoreCoachCheckIn(input: CoachInput): CoachResult {
  const score = input.confidence + input.discipline + input.emotionalControl + input.patience;
  const average = score / 4;

  if (average >= 8.5) {
    return {
      score,
      average,
      status: "ELITE",
      headline: "You appear mentally prepared.",
      guidance: "Follow your plan and avoid unnecessary trades.",
    };
  }
  if (average >= 7) {
    return {
      score,
      average,
      status: "READY",
      headline: "Your mindset looks solid.",
      guidance: "Stay disciplined and execute your plan.",
    };
  }
  if (average >= 5) {
    return {
      score,
      average,
      status: "CAUTION",
      headline: "Your mindset may be inconsistent.",
      guidance: "Consider reducing risk and waiting for clarity.",
    };
  }
  return {
    score,
    average,
    status: "NOT READY",
    headline: "Do not force a trade.",
    guidance: "Step away and reset before participating.",
  };
}
