"use client";

import { SCROLL_COLORS, type ScrollColorId } from "@/lib/data/scrollColors";

// Shared picker UI: a row of backdrop chips and, when the scroll is the
// active backdrop, its eight dye swatches (the glowing ones marked ✦).
export interface BackdropOption<T extends string> {
  id: T;
  label: string;
  swatch: string; // CSS background for the chip's color dot
}

export default function BackdropChooser<T extends string>({
  label,
  options,
  value,
  onChange,
  scrollValue,
  onScrollChange,
  scrollId,
}: {
  label: string;
  options: BackdropOption<T>[];
  value: T;
  onChange: (v: T) => void;
  scrollValue: ScrollColorId;
  onScrollChange: (v: ScrollColorId) => void;
  /** which option id is the scroll (shows the dye row) */
  scrollId: T;
}) {
  return (
    <div className="relative rounded-lg border border-white/10 bg-black/40 p-2.5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">{label}</span>
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition ${
                active ? "border-white/60 bg-white/15 text-white" : "border-white/15 text-white/60 hover:border-white/35"
              }`}
            >
              <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: o.swatch }} />
              {o.label}
            </button>
          );
        })}
      </div>
      {value === scrollId && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Scroll dye</span>
          {SCROLL_COLORS.map((c) => {
            const active = c.id === scrollValue;
            return (
              <button
                key={c.id}
                type="button"
                title={c.label + (c.animated ? " — glowing" : "")}
                aria-label={c.label}
                onClick={() => onScrollChange(c.id)}
                className={`relative h-6 w-6 rounded-full border-2 transition ${active ? "scale-110 border-white" : "border-white/20 hover:border-white/50"}`}
                style={{ background: c.swatch, boxShadow: c.animated ? `0 0 10px ${c.glow}` : undefined }}
              >
                {c.animated && <span className="absolute -right-1 -top-1 text-[9px] text-white">✦</span>}
              </button>
            );
          })}
          <span className="ml-1 text-[10px] text-white/40">{SCROLL_COLORS.find((c) => c.id === scrollValue)?.label}</span>
        </div>
      )}
    </div>
  );
}
