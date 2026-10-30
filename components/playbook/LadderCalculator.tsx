"use client";

import { useState } from "react";
import { exitLadder } from "@/lib/zeroDte";

// Try the 0DTE exit ladder with your own numbers: premium and how many
// contracts your risk budget allows. Same math the engine shows.
export default function LadderCalculator() {
  const [premium, setPremium] = useState("0.30");
  const [contracts, setContracts] = useState("3");
  const [stopPct, setStopPct] = useState("50");

  const entry = parseFloat(premium);
  const n = parseInt(contracts, 10);
  const stop = Math.min(100, Math.max(1, parseFloat(stopPct) || 50));
  const ladder = exitLadder(entry, n);
  const riskPerContract = entry > 0 ? entry * 100 * (stop / 100) : null;

  const input = "w-full rounded border border-white/20 bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-accent";

  return (
    <div className="rounded-xl border border-accent/30 bg-surface p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">Ladder calculator</p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <label className="text-xs text-white/60">
          Premium ($)
          <input className={input} type="number" step="0.01" min="0.01" value={premium} onChange={(e) => setPremium(e.target.value)} />
        </label>
        <label className="text-xs text-white/60">
          Contracts
          <input className={input} type="number" step="1" min="1" max="20" value={contracts} onChange={(e) => setContracts(e.target.value)} />
        </label>
        <label className="text-xs text-white/60">
          Stop (% of premium)
          <input className={input} type="number" step="5" min="10" max="100" value={stopPct} onChange={(e) => setStopPct(e.target.value)} />
        </label>
      </div>

      {riskPerContract !== null && n >= 1 && (
        <p className="mt-3 text-xs text-white/60">
          Risk if stopped: ${riskPerContract.toFixed(2)} per contract · ${(riskPerContract * n).toFixed(2)} total. That total
          has to fit inside your max trade risk, or the engine will cut your contract count.
        </p>
      )}

      {ladder ? (
        <ol className="mt-3 space-y-1.5">
          {ladder.steps.map((s, i) => (
            <li key={i} className="rounded bg-white/5 px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/85">
                  {i + 1}. {s.label} — sell {s.contracts}
                </span>
                <span className="font-mono text-white/80">
                  {s.sellAt === null ? "trail it" : `@ $${s.sellAt.toFixed(2)} (+${s.gainPct}%)`}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/45">{s.note}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-xs text-white/40">Enter a premium above $0 and a whole number of contracts.</p>
      )}
      {ladder?.canTrim && (
        <p className="mt-2 text-xs text-white/50">
          Cost ${ladder.totalCost.toFixed(2)} · step 1 returns ${ladder.step1Proceeds.toFixed(2)}
          {ladder.costCoveredAfterStep1 ? " — after that fill, the trade is paid for." : "."}
        </p>
      )}
    </div>
  );
}
