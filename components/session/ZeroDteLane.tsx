"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ZERO_DTE_DAILY_MAX,
  ZERO_DTE_ENTRY_CUTOFF_MIN,
  ZERO_DTE_FLAT_BY_MIN,
  etDate,
  etMinutes,
  exitLadder,
  formatEtMinutes,
  isZeroDte,
  zeroDteClock,
} from "@/lib/zeroDte";

// Shown in both engines' Trade Plan step. When the expiration is today it
// becomes the 0DTE lane: the clock rules, today's 0DTE count, and the exit
// ladder for the contracts you're sizing. The server (app/session/
// actions.ts) re-checks the cutoff and the count before authorizing.
export default function ZeroDteLane({
  expiration,
  entry,
  contracts,
  zeroDteTaken,
  onPickToday,
  tone = "accent",
}: {
  expiration: string;
  entry: number | null;
  contracts: number;
  zeroDteTaken: number;
  onPickToday: (date: string) => void;
  tone?: "accent" | "daytrade";
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;
  const today = etDate(now);
  const border = tone === "daytrade" ? "border-daytrade/40" : "border-accent/40";
  const text = tone === "daytrade" ? "text-daytrade" : "text-accent";

  if (!isZeroDte(expiration, today)) {
    return (
      <button
        type="button"
        onClick={() => onPickToday(today)}
        className={`w-full rounded border border-dashed ${border} px-3 py-2 text-left text-xs text-white/60 hover:bg-white/5`}
      >
        <span className={text}>⏱ Trading 0DTE?</span> Set expiration to today to open the 0DTE lane: exit ladder, clock
        rules, and sizing for multiple contracts.
      </button>
    );
  }

  const min = etMinutes(now);
  const clock = zeroDteClock(min);
  const ladder = entry ? exitLadder(entry, contracts || 0) : null;
  const atDailyMax = zeroDteTaken >= ZERO_DTE_DAILY_MAX;

  const clockLine =
    clock.state === "premarket"
      ? { cls: "text-white/60", msg: `Market's not open yet. 0DTE entries close at ${formatEtMinutes(ZERO_DTE_ENTRY_CUTOFF_MIN)} ET.` }
      : clock.state === "open"
        ? clock.minutesToCutoff <= 30
          ? { cls: "text-caution", msg: `${clock.minutesToCutoff} min until the 0DTE entry cutoff (${formatEtMinutes(ZERO_DTE_ENTRY_CUTOFF_MIN)} ET).` }
          : { cls: "text-white/60", msg: `0DTE entries open until ${formatEtMinutes(ZERO_DTE_ENTRY_CUTOFF_MIN)} ET. Flat by ${formatEtMinutes(ZERO_DTE_FLAT_BY_MIN)}.` }
        : clock.state === "cutoff"
          ? { cls: "text-loss", msg: `Past the ${formatEtMinutes(ZERO_DTE_ENTRY_CUTOFF_MIN)} ET cutoff. XRILL won't authorize a new 0DTE entry. Manage what's open and be flat by ${formatEtMinutes(ZERO_DTE_FLAT_BY_MIN)}.` }
          : { cls: "text-loss", msg: `It's past ${formatEtMinutes(ZERO_DTE_FLAT_BY_MIN)} ET. Anything 0DTE still open should be closed now.` };

  return (
    <div className={`rounded border ${border} bg-black/30 p-3`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`font-mono text-xs font-bold tracking-widest ${text}`}>⏱ 0DTE LANE</p>
        <span className={`font-mono text-[11px] ${atDailyMax ? "text-loss" : "text-white/50"}`}>
          {zeroDteTaken}/{ZERO_DTE_DAILY_MAX} 0DTE today
        </span>
      </div>
      <p className={`mt-1 text-xs ${clockLine.cls}`}>{clockLine.msg}</p>
      {atDailyMax && <p className="mt-1 text-xs text-loss">You've hit today's 0DTE limit. XRILL won't authorize another one.</p>}

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Exit ladder</p>
        {!ladder ? (
          <p className="mt-1 text-xs text-white/40">Enter a premium and contract count to see your ladder.</p>
        ) : (
          <>
            <ol className="mt-1 space-y-1.5">
              {ladder.steps.map((s, i) => (
                <li key={i} className="rounded bg-white/5 px-2 py-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white/85">
                      {i + 1}. {s.label} — sell {s.contracts}
                    </span>
                    <span className={`font-mono ${s.sellAt === null ? text : "text-white/80"}`}>
                      {s.sellAt === null ? "trail it" : `@ $${s.sellAt.toFixed(2)} (+${s.gainPct}%)`}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-white/45">{s.note}</p>
                </li>
              ))}
            </ol>
            {ladder.canTrim && (
              <p className="mt-2 text-[11px] text-white/50">
                Cost ${ladder.totalCost.toFixed(2)} · step 1 returns ${ladder.step1Proceeds.toFixed(2)}
                {ladder.costCoveredAfterStep1 ? " — the trade is paid for." : "."}
              </p>
            )}
          </>
        )}
      </div>

      <ul className="mt-3 space-y-0.5 text-[11px] text-white/45">
        <li>• SPY/QQQ, strikes near the money (~0.20–0.35 delta), not 0.05-delta lottos.</li>
        <li>• Contracts come from your risk budget below. Cheaper premium = more contracts = a real ladder.</li>
        <li>• Max {ZERO_DTE_DAILY_MAX} 0DTE trades a day, and they count toward your Daily Trade Cap.</li>
      </ul>
      <Link href="/playbook/zero-dte" className={`mt-2 inline-block text-[11px] underline ${text}`}>
        Full 0DTE playbook →
      </Link>
    </div>
  );
}
