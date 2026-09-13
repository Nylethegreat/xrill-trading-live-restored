"use client";

import { useState } from "react";
import { GATES } from "@/lib/data/gates";

export default function GatePipeline() {
  const [active, setActive] = useState(0);
  const gate = GATES[active];

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-5">
      {/* Horizontal rail of gate stations */}
      <div className="relative overflow-x-auto pb-2">
        <div className="flex min-w-[560px] items-center justify-between gap-1 px-1 sm:min-w-0">
          {GATES.map((g, i) => {
            const isActive = i === active;
            const isPast = i < active;
            return (
              <div key={g.n} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className="group flex flex-col items-center gap-1.5 focus:outline-none"
                  aria-current={isActive}
                >
                  <span
                    className={`flex h-9 w-9 flex-none items-center justify-center rounded-full border font-mono text-xs font-bold transition-all ${
                      isActive
                        ? "border-accent bg-accent text-black shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                        : isPast
                          ? "border-accent/50 bg-accent/15 text-accent"
                          : "border-white/20 bg-white/5 text-white/50 group-hover:border-white/40 group-hover:text-white"
                    }`}
                  >
                    {g.n}
                  </span>
                  <span
                    className={`hidden max-w-[80px] text-center text-[10px] leading-tight sm:block ${
                      isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                    }`}
                  >
                    {g.short}
                  </span>
                </button>
                {i < GATES.length - 1 && (
                  <div className={`mx-1 h-px flex-1 ${isPast ? "bg-accent/50" : "bg-white/10"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail card for the selected gate */}
      <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-accent">GATE {gate.n}/8</span>
          <span className="text-white/20">·</span>
          <h3 className="text-sm font-semibold text-white">{gate.name}</h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{gate.detail}</p>
        <p className="mt-2 border-t border-white/10 pt-2 text-xs italic leading-relaxed text-white/50">
          {gate.tagline}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-white/40">
        <button
          type="button"
          onClick={() => setActive((a) => Math.max(0, a - 1))}
          disabled={active === 0}
          className="rounded border border-white/10 px-2 py-1 hover:bg-white/10 disabled:opacity-30"
        >
          ← Prev
        </button>
        <span>Click any gate to jump to it</span>
        <button
          type="button"
          onClick={() => setActive((a) => Math.min(GATES.length - 1, a + 1))}
          disabled={active === GATES.length - 1}
          className="rounded border border-white/10 px-2 py-1 hover:bg-white/10 disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
