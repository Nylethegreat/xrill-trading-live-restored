"use client";

import { useEffect, useRef } from "react";

export interface TickerRow {
  key: string;
  date: string;
  ticker: string;
  setup: string;
  gainPct: number;
}

// Auto-scrolls via scrollTop on a rAF loop rather than a CSS transform, so
// the element stays a REAL scrollable container the visitor can grab and
// drag through by hand at any time -- a transform-based loop (like
// CandlestickGlow/EkgPulse use) can't be manually scrolled. Content is
// duplicated end-to-end by the caller; once scrollTop passes the first
// copy's height, we silently jump back by that same height, so the loop
// never visibly resets.
export default function WinsTickerScroller({ rows, singleSetHeight }: { rows: TickerRow[]; singleSetHeight: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || singleSetHeight <= 0) return;

    let raf: number;
    const pxPerFrame = 0.4; // ~24px/s at 60fps -- slow, ambient, still readable

    function tick() {
      if (el && !pausedRef.current) {
        el.scrollTop += pxPerFrame;
        if (el.scrollTop >= singleSetHeight) {
          el.scrollTop -= singleSetHeight;
        }
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [singleSetHeight]);

  return (
    <div
      ref={containerRef}
      onPointerEnter={() => (pausedRef.current = true)}
      onPointerLeave={() => (pausedRef.current = false)}
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
      className="pointer-events-auto h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {rows.map((w, i) => (
        <div
          key={`${w.key}-${i}`}
          className="flex items-center justify-between gap-3 whitespace-nowrap px-3 py-2 font-mono text-xs"
        >
          <span className="text-white/30">{w.date}</span>
          <span className="font-semibold text-white/55">
            {w.ticker} <span className="text-white/25">{w.setup}</span>
          </span>
          <span className="font-bold text-accent [text-shadow:0_0_8px_rgba(34,197,94,0.65)]">
            +{w.gainPct}%
          </span>
        </div>
      ))}
    </div>
  );
}
