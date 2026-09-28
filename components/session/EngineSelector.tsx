"use client";

import { useState } from "react";
import XrillWizard from "@/components/XrillWizard";
import XrillFastWizard from "@/components/XrillFastWizard";

type Engine = "swing" | "daytrade" | null;

// The picker shown before either wizard starts -- lets someone choose the
// traditional 8-gate pipeline (Swing Trade) or the 4-step fast pass
// (Daytrade Engine, neon cyan). `initialEngine` lets a direct link (the
// dashboard's Pre-Trade Checklist) skip straight to one or the other.
export default function EngineSelector({
  accountBalance,
  riskPercent,
  initialEngine,
}: {
  accountBalance: number;
  riskPercent: number;
  initialEngine?: Engine;
}) {
  const [engine, setEngine] = useState<Engine>(initialEngine ?? null);

  if (engine === "swing") {
    return <XrillWizard accountBalance={accountBalance} riskPercent={riskPercent} />;
  }

  if (engine === "daytrade") {
    return <XrillFastWizard accountBalance={accountBalance} riskPercent={riskPercent} />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-center font-mono text-xl font-bold tracking-widest text-white">CHOOSE YOUR ENGINE</h1>
      <p className="mt-2 text-center text-sm text-white/50">
        Same account, same risk limits — different pace for a different kind of trade.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setEngine("swing")}
          className="group rounded-lg border border-accent/50 bg-surface p-5 text-left transition-colors hover:border-accent motion-safe:animate-perf-glow-accent"
        >
          <p className="text-2xl">🟢</p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-accent motion-safe:animate-neon-flicker [text-shadow:0_0_4px_currentColor,0_0_11px_currentColor,0_0_19px_currentColor]">Swing Trade</p>
          <p className="mt-1 text-xs text-white/50">
            The full 8-gate pipeline — Daily Check-In through Authorization. Slower, more scrutiny, the standard
            engine.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setEngine("daytrade")}
          className="group rounded-lg border border-daytrade/50 bg-surface p-5 text-left transition-colors hover:border-daytrade motion-safe:animate-daytrade-glow"
        >
          <p className="text-2xl">⚡</p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-daytrade motion-safe:animate-neon-flicker [text-shadow:0_0_4px_currentColor,0_0_11px_currentColor,0_0_19px_currentColor]">Daytrade Engine</p>
          <p className="mt-1 text-xs text-white/50">
            A 4-step fast pass for faster-moving daytrades — fewer questions, same hard risk limits. Higher risk by
            design.
          </p>
        </button>
      </div>
    </div>
  );
}
