// The eight dyes for the scroll backdrop (Playbook + Journal). Five are
// classic, steady inks; three are "dipped in an alien lake" — their
// gradient slowly shifts and they breathe an outer glow. All are kept dark
// enough that the site's white text stays readable on top.
export type ScrollColorId =
  | "sepia"
  | "crimson"
  | "jade"
  | "indigo"
  | "obsidian"
  | "alien_lake"
  | "nebula"
  | "solar_flare";

export interface ScrollColor {
  id: ScrollColorId;
  label: string;
  /** body dye stops (dark → mid → dark) */
  body: string[];
  /** roll cylinder: highlight, shadow */
  roll: [string, string];
  /** swatch for the picker */
  swatch: string;
  /** glowing, color-shifting dye */
  animated?: boolean;
  glow?: string;
}

export const SCROLL_COLORS: ScrollColor[] = [
  { id: "sepia", label: "Ancient Sepia", body: ["#2e2112", "#4f3a1f", "#2a1d10"], roll: ["#b88a4f", "#4a3115"], swatch: "linear-gradient(135deg,#6b4f2a,#2e2112)" },
  { id: "crimson", label: "Crimson Seal", body: ["#2a0c10", "#4d1520", "#24090d"], roll: ["#c2414f", "#4a0f18"], swatch: "linear-gradient(135deg,#7f1d2d,#2a0c10)" },
  { id: "jade", label: "Jade Temple", body: ["#0b2219", "#164433", "#0a1d15"], roll: ["#4fb38a", "#0f3a2a"], swatch: "linear-gradient(135deg,#1f6b4f,#0b2219)" },
  { id: "indigo", label: "Royal Indigo", body: ["#120f33", "#24205e", "#0f0c2b"], roll: ["#7c74e0", "#1d1850"], swatch: "linear-gradient(135deg,#3b33a0,#120f33)" },
  { id: "obsidian", label: "Obsidian Gold", body: ["#0c0c0e", "#1c1a17", "#09090b"], roll: ["#d4a83a", "#3a2c0c"], swatch: "linear-gradient(135deg,#2a2620,#0c0c0e 60%,#b8902e)" },
  {
    id: "alien_lake",
    label: "Alien Lake",
    body: ["#06302c", "#0f5c3a", "#2a1a5e", "#063f4a", "#06302c"],
    roll: ["#7cf5c9", "#0d4a40"],
    swatch: "linear-gradient(135deg,#14b8a6,#84cc16,#7c3aed)",
    animated: true,
    glow: "#2dd4bf",
  },
  {
    id: "nebula",
    label: "Nebula Dip",
    body: ["#2a0a3d", "#4a0f5c", "#0f2a5e", "#3d0a4a", "#2a0a3d"],
    roll: ["#f0abfc", "#3b0a4f"],
    swatch: "linear-gradient(135deg,#d946ef,#3b82f6,#22d3ee)",
    animated: true,
    glow: "#e879f9",
  },
  {
    id: "solar_flare",
    label: "Solar Flare",
    body: ["#3d1a06", "#5c1530", "#3a0f4a", "#4a2a06", "#3d1a06"],
    roll: ["#fdba74", "#5a2008"],
    swatch: "linear-gradient(135deg,#f59e0b,#f43f5e,#a855f7)",
    animated: true,
    glow: "#fb923c",
  },
];

export const SCROLL_COLOR_IDS = SCROLL_COLORS.map((c) => c.id);
export const scrollColor = (id: ScrollColorId) => SCROLL_COLORS.find((c) => c.id === id) ?? SCROLL_COLORS[0];
