// The 3 preset account-page backgrounds -- kept in one place so the picker
// UI, the server action's validation, and the page's own render switch all
// read from the same source instead of three separately-typed string
// unions drifting apart.
export type BackgroundTheme = "mossy_forest" | "rock_wall" | "dark_neo";

export const BACKGROUND_THEMES: { key: BackgroundTheme; label: string }[] = [
  { key: "mossy_forest", label: "Mossy Forest" },
  { key: "rock_wall", label: "Rock Wall" },
  { key: "dark_neo", label: "Dark Neo" },
];

export function isBackgroundTheme(value: string): value is BackgroundTheme {
  return BACKGROUND_THEMES.some((t) => t.key === value);
}
