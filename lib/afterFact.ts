// Reasons a trade gets logged after the fact instead of through the gates.
// Shared by the emergency-log form and its server action.
export const AFTER_FACT_REASONS = [
  "Not on time",
  "No set stops",
  "No set alerts",
  "No available charts",
  "Outside trading hours",
] as const;
