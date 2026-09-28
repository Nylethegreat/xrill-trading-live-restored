// The preset XRILL Status (dashboard) backgrounds -- one source of truth for
// the picker UI, the server action's validation, and the page's render
// switch, same pattern as lib/data/backgroundThemes.ts for /account. The DB
// column (profiles.dashboard_theme) has a matching CHECK constraint as the
// real backstop.
export type DashboardTheme = "classic" | "neon_arcade" | "deep_space" | "dark_neo";

export const DASHBOARD_THEMES: { key: DashboardTheme; label: string }[] = [
  { key: "classic", label: "Classic" },
  { key: "neon_arcade", label: "Neon Arcade" },
  { key: "deep_space", label: "Deep Space" },
  { key: "dark_neo", label: "Dark Neo" },
];

export function isDashboardTheme(value: string): value is DashboardTheme {
  return DASHBOARD_THEMES.some((t) => t.key === value);
}
