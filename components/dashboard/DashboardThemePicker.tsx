import { saveDashboardTheme } from "@/app/dashboard/actions";
import { DASHBOARD_THEMES, type DashboardTheme } from "@/lib/data/dashboardThemes";
import NeonArcadeTexture from "@/components/visuals/textures/NeonArcadeTexture";
import DeepSpaceTexture from "@/components/visuals/textures/DeepSpaceTexture";
import DarkNeoTexture from "@/components/visuals/textures/DarkNeoTexture";
import NightDriveTexture from "@/components/visuals/textures/NightDriveTexture";
import TraderDeskTexture from "@/components/visuals/textures/TraderDeskTexture";
import SummerHazeTexture from "@/components/visuals/textures/SummerHazeTexture";
import MarketPulseTexture from "@/components/visuals/textures/MarketPulseTexture";
import RetroRoomTexture from "@/components/visuals/textures/RetroRoomTexture";
import BearBullTexture from "@/components/visuals/textures/BearBullTexture";

// Same one-form-per-swatch, works-without-JS pattern as the Account page's
// BackgroundThemePicker. Each preview gets its own SVG id prefix so its
// gradients never collide with the full-page background's.
function Preview({ theme }: { theme: DashboardTheme }) {
  switch (theme) {
    case "neon_arcade":
      return <NeonArcadeTexture idPrefix="arc-swatch" />;
    case "deep_space":
      return <DeepSpaceTexture idPrefix="space-swatch" />;
    case "dark_neo":
      return <DarkNeoTexture />;
    case "night_drive":
      return <NightDriveTexture idPrefix="drive-swatch" />;
    case "trader_desk":
      return <TraderDeskTexture idPrefix="desk-swatch" />;
    case "summer_haze":
      return <SummerHazeTexture idPrefix="haze-swatch" />;
    case "market_pulse":
      return <MarketPulseTexture idPrefix="pulse-swatch" />;
    case "retro_room":
      return <RetroRoomTexture idPrefix="room-swatch" />;
    case "bear_bull":
      return <BearBullTexture idPrefix="bb-swatch" still />;
    default:
      return (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold tracking-widest text-accent [text-shadow:0_0_6px_currentColor]">
          XRILL
        </div>
      );
  }
}

export default function DashboardThemePicker({ current }: { current: DashboardTheme }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {DASHBOARD_THEMES.map((theme) => {
        const isActive = theme.key === current;
        return (
          <form key={theme.key} action={saveDashboardTheme}>
            <input type="hidden" name="dashboard_theme" value={theme.key} />
            <button
              type="submit"
              className={`relative block w-full overflow-hidden rounded border text-left transition-colors ${
                isActive ? "border-accent shadow-[0_0_10px_rgba(34,197,94,0.35)]" : "border-white/10 hover:border-white/30"
              }`}
            >
              <div className="relative h-16 w-full bg-background">
                <Preview theme={theme.key} />
              </div>
              <div
                className={`px-2 py-1.5 text-[11px] font-medium ${
                  isActive ? "bg-accent/15 text-accent" : "bg-white/5 text-white/60"
                }`}
              >
                {isActive ? "✓ " : ""}
                {theme.label}
              </div>
            </button>
          </form>
        );
      })}
    </div>
  );
}
