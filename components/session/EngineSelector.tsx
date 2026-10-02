"use client";

import { useState } from "react";
import Link from "next/link";
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
  stopPercent,
  initialEngine,
  openCount = 0,
  openLimit = 3,
  recommendedOpen = 2,
}: {
  accountBalance: number;
  riskPercent: number;
  stopPercent?: number;
  initialEngine?: Engine;
  openCount?: number;
  openLimit?: number;
  recommendedOpen?: number;
}) {
  const [engine, setEngine] = useState<Engine>(initialEngine ?? null);

  if (engine === "swing") {
    return <XrillWizard accountBalance={accountBalance} riskPercent={riskPercent} stopPercent={stopPercent} />;
  }

  if (engine === "daytrade") {
    return <XrillFastWizard accountBalance={accountBalance} riskPercent={riskPercent} stopPercent={stopPercent} />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-center font-mono text-xl font-bold tracking-widest text-white">CHOOSE YOUR ENGINE</h1>
      <p className="mt-2 text-center text-sm text-white/50">
        Same account, same risk limits — different pace for a different kind of trade.
      </p>

      {openCount >= recommendedOpen && openCount < openLimit && (
        <div className="mt-6 rounded border border-caution/40 bg-caution/10 p-3 text-center text-xs text-caution">
          ⚠️ You have {openCount} positions open. A new one would be #{openCount + 1} of {openLimit}: allowed, but XRILL doesn&apos;t
          recommend more than {recommendedOpen} at once. A spread counts as one position.
        </div>
      )}

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

      <div className="mt-8 rounded border border-loss/40 bg-loss/5 p-4 text-center">
        <p className="text-sm text-white/70">Already in a trade you didn&apos;t run through XRILL?</p>
        <Link
          href="/session?mode=after"
          className="mt-2 inline-block rounded bg-loss px-4 py-2 text-sm font-bold text-white shadow-[0_0_16px_-2px_rgba(239,68,68,0.7)] hover:opacity-90"
        >
          🚨 Emergency: Log a Trade After the Fact
        </Link>
        <p className="mt-2 text-[11px] text-white/40">Not a shortcut. Gets the trade on record so it&apos;s tracked and journaled.</p>
      </div>
    </div>
  );
}
