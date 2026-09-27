import { saveHeaderStyle } from "@/app/account/actions";
import { HEADER_STYLES, HEADER_STYLE_CLASS, type HeaderStyle } from "@/lib/data/headerStyles";

// Same progressive-enhancement pattern as BackgroundThemePicker.tsx --
// each swatch is its own <form> posting straight to the saveHeaderStyle
// server action, no client JS required. Every swatch renders the literal
// "XRILL" sample with the real HEADER_STYLE_CLASS for that style, so
// there's never a mismatch between what's previewed here and what a real
// page header looks like once picked.
export default function HeaderStylePicker({ current }: { current: HeaderStyle }) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Header Style</h2>
      <p className="mt-0.5 text-xs text-white/40">
        Decorative treatment for the big page titles (homepage, About, Analytics, etc). White is the default —
        everything else is optional.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {HEADER_STYLES.map((s) => {
          const isActive = s.key === current;
          return (
            <form key={s.key} action={saveHeaderStyle}>
              <input type="hidden" name="header_style" value={s.key} />
              <button
                type="submit"
                className={`block w-full rounded border p-3 text-left transition-colors ${
                  isActive ? "border-accent bg-accent/10" : "border-white/10 hover:border-white/30 bg-surface"
                }`}
              >
                <span className={`block font-mono text-lg font-bold tracking-widest ${HEADER_STYLE_CLASS[s.key]}`}>
                  XRILL
                </span>
                <span className={`mt-1.5 block text-[11px] font-medium ${isActive ? "text-accent" : "text-white/60"}`}>
                  {isActive ? "✓ " : ""}
                  {s.label}
                </span>
                <span className="mt-0.5 block text-[10px] leading-snug text-white/40">{s.description}</span>
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
