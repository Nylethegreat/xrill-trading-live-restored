// The preset XRILL Status (dashboard) backgrounds -- one source of truth for
// the picker UI, the server action's validation, and the page's render
// switch, same pattern as lib/data/backgroundThemes.ts for /account. The DB
// column (profiles.dashboard_theme) has a matching CHECK constraint as the
// real backstop. ("synthwave" was retired from the dashboard -- it lives on
// as a Pricing backdrop -- so a stored "synthwave" now falls back to Classic.)
export type DashboardTheme =
  | "classic"
  | "neon_arcade"
  | "deep_space"
  | "dark_neo"
  | "night_drive"
  | "trader_desk"
  | "retro_room"
  | "summer_haze"
  | "market_pulse";

export const DASHBOARD_THEMES: { key: DashboardTheme; label: string }[] = [
  { key: "classic", label: "Classic" },
  { key: "neon_arcade", label: "Neon Arcade" },
  { key: "deep_space", label: "Deep Space" },
  { key: "dark_neo", label: "Dark Neo" },
  { key: "night_drive", label: "Night Drive" },
  { key: "trader_desk", label: "Trader Desk" },
  { key: "retro_room", label: "Retro Room" },
  { key: "summer_haze", label: "Summer Haze" },
  { key: "market_pulse", label: "Market Pulse" },
];

export function isDashboardTheme(value: string): value is DashboardTheme {
  return DASHBOARD_THEMES.some((t) => t.key === value);
}
