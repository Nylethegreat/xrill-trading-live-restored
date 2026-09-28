"use client";

import { useState } from "react";
import GatePipeline from "@/components/GatePipeline";
import { GATES } from "@/lib/data/gates";
import { DAYTRADE_GATES } from "@/lib/data/daytradeGates";

// Homepage toggle between the two live engines -- the standard 8-gate
// engine (green) and the Daytrade Engine's fast pass (cyan/blue). Both
// pipelines pull from the same lib/data/*Gates.ts files the wizards
// themselves are copy-checked against, so switching views never shows a
// system that doesn't actually exist in the app.
export default function EngineGatePipeline() {
  const [engine, setEngine] = useState<"standard" | "daytrade">("standard");

  return (
    <div>
      <div className="mb-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setEngine("standard")}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
            engine === "standard"
              ? "border-accent bg-accent/15 text-accent shadow-[0_0_16px_3px_rgba(34,197,94,0.5)] [text-shadow:0_0_4px_currentColor,0_0_11px_currentColor,0_0_19px_currentColor]"
              : "border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"
          }`}
        >
          🟢 8-Gate Engine
        </button>
        <button
          type="button"
          onClick={() => setEngine("daytrade")}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
            engine === "daytrade"
              ? "border-daytrade bg-daytrade/15 text-daytrade shadow-[0_0_16px_3px_rgba(34,211,238,0.5)] [text-shadow:0_0_4px_currentColor,0_0_11px_currentColor,0_0_19px_currentColor]"
              : "border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"
          }`}
        >
          ⚡ Daytrade Engine
        </button>
      </div>

      {engine === "standard" ? (
        <>
          {/* key="standard" forces a fresh GatePipeline instance on switch --
              without it, React reuses the same component instance across the
              engine toggle (same type, same position), so its internal
              `active` gate index carried over unchanged. Clicking through to
              gate 7 or 8 on the 8-gate pipeline (index 6/7), then switching
              to the 6-step Daytrade Engine, left `active` pointing past the
              end of the shorter gates array -- gates[active] came back
              undefined and the render crashed ("Application error: a
              client-side exception has occurred"). A fresh key remounts with
              active reset to 0 every time. */}
          <GatePipeline key="standard" gates={GATES} theme="green" />
          <p className="mt-3 text-center text-[11px] leading-relaxed text-white/40">
            The last two steps, XRILL Score and Authorization, aren't questions — they're calculated automatically
            from everything above once the first six gates clear.
          </p>
        </>
      ) : (
        <>
          <GatePipeline key="daytrade" gates={DAYTRADE_GATES} theme="blue" />
          <p className="mt-3 text-center text-[11px] leading-relaxed text-white/40">
            A faster pass for higher-risk daytrading — fewer questions, same Risk Manager and Execution Check as the
            8-gate engine. Authorization is calculated automatically from the steps above, no composite score.
          </p>
        </>
      )}
    </div>
  );
}
