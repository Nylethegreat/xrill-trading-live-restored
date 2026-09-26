import { saveBackgroundTheme } from "@/app/account/actions";
import type { BackgroundTheme } from "@/lib/data/backgroundThemes";
import { BACKGROUND_THEMES } from "@/lib/data/backgroundThemes";
import MossyForestTexture from "@/components/visuals/textures/MossyForestTexture";
import RockWallTexture from "@/components/visuals/textures/RockWallTexture";
import DarkNeoTexture from "@/components/visuals/textures/DarkNeoTexture";

// Each swatch is its own tiny <form> posting straight to the
// saveBackgroundTheme server action -- no client JS required, works even
// with JS disabled, same progressive-enhancement pattern as the rest of
// this page's forms (saveAccountSettings, the Stripe checkout buttons).
const PREVIEW: Record<BackgroundTheme, React.ComponentType<{ className?: string }>> = {
  mossy_forest: MossyForestTexture,
  rock_wall: RockWallTexture,
  dark_neo: DarkNeoTexture,
};

export default function BackgroundThemePicker({ current }: { current: BackgroundTheme }) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Account Background</h2>
      <p className="mt-0.5 text-xs text-white/40">Pick the backdrop for this page. Only affects your own view.</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {BACKGROUND_THEMES.map((theme) => {
          const Preview = PREVIEW[theme.key];
          const isActive = theme.key === current;
          return (
            <form key={theme.key} action={saveBackgroundTheme}>
              <input type="hidden" name="background_theme" value={theme.key} />
              <button
                type="submit"
                className={`relative block w-full overflow-hidden rounded border text-left transition-colors ${
                  isActive ? "border-accent" : "border-white/10 hover:border-white/30"
                }`}
              >
                <div className="relative h-16 w-full bg-background">
                  <Preview className="opacity-100" />
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
    </div>
  );
}
