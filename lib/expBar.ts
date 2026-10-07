// EXP bar look options. Client-safe (no Supabase import) so both the
// dashboard picker and the homepage preview can use it.
//
// style:  "classic"   = one smooth, continuous gauge (old-school MMO EXP bar)
//         "segmented" = the original bar with 10% tick marks
// color:  saved per user on profiles.exp_bar_color. The homepage preview only
//         offers the first three; the dashboard offers all six.

export const EXP_STYLES = ["classic", "segmented"] as const;
export type ExpStyle = (typeof EXP_STYLES)[number];

export const EXP_COLORS = ["gold", "blue", "red", "rainbow", "cyan", "purple"] as const;
export type ExpColor = (typeof EXP_COLORS)[number];

export const HOMEPAGE_COLORS: ExpColor[] = ["gold", "blue", "red"];

export interface ExpTheme {
  label: string;
  fill: string; // CSS background for the fill
  glow: string; // "r g b" for the breathing glow (used as a CSS variable)
  text: string; // LVL label color
  swatch: string; // swatch background
}

export const EXP_THEMES: Record<ExpColor, ExpTheme> = {
  gold: {
    label: "Gold",
    fill: "linear-gradient(90deg, #a16207, #facc15 55%, #fef08a)",
    glow: "250 204 21",
    text: "#fde047",
    swatch: "linear-gradient(135deg, #a16207, #facc15, #fef08a)",
  },
  blue: {
    label: "Blue",
    fill: "linear-gradient(90deg, #1e40af, #3b82f6 55%, #93c5fd)",
    glow: "59 130 246",
    text: "#93c5fd",
    swatch: "linear-gradient(135deg, #1e40af, #3b82f6, #93c5fd)",
  },
  red: {
    label: "Red",
    fill: "linear-gradient(90deg, #991b1b, #ef4444 55%, #fca5a5)",
    glow: "239 68 68",
    text: "#fca5a5",
    swatch: "linear-gradient(135deg, #991b1b, #ef4444, #fca5a5)",
  },
  rainbow: {
    label: "Rainbow",
    fill: "linear-gradient(90deg, #ef4444, #f97316, #facc15, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)",
    glow: "217 70 239",
    text: "#f0abfc",
    swatch: "conic-gradient(#ef4444, #f97316, #facc15, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)",
  },
  cyan: {
    label: "Cyan",
    fill: "linear-gradient(90deg, #0e7490, #22d3ee 55%, #a5f3fc)",
    glow: "34 211 238",
    text: "#67e8f9",
    swatch: "linear-gradient(135deg, #0e7490, #22d3ee, #a5f3fc)",
  },
  purple: {
    label: "Purple",
    fill: "linear-gradient(90deg, #6b21a8, #a855f7 55%, #e9d5ff)",
    glow: "168 85 247",
    text: "#d8b4fe",
    swatch: "linear-gradient(135deg, #6b21a8, #a855f7, #e9d5ff)",
  },
};

export function isExpStyle(v: unknown): v is ExpStyle {
  return typeof v === "string" && (EXP_STYLES as readonly string[]).includes(v);
}
export function isExpColor(v: unknown): v is ExpColor {
  return typeof v === "string" && (EXP_COLORS as readonly string[]).includes(v);
}
