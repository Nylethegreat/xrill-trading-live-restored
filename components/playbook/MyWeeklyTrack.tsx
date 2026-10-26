"use client";

import { useEffect, useMemo, useState } from "react";
import { MILESTONE_PACES, SCALING_PRINCIPAL, SCALING_TARGET } from "@/lib/data/scaling";

// "My Track": log each real week's result (green or red) and see where the
// account actually stands against the plan pace you picked -- plus the real
// average pace and what a red week takes to recover. Saved in this browser
// only (a per-visitor convenience; nothing here is shared or synced).

const KEY = "xrill-my-weekly-track";

type Saved = { start: string; weeks: string[]; pace: number };

function money(v: number) {
  return `$${Math.round(v).toLocaleString()}`;
}

function pct(v: number, digits = 1) {
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

function parsePct(s: string) {
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return 0;
  return Math.max(-100, Math.min(1000, n));
}

export default function MyWeeklyTrack() {
  const [start, setStart] = useState(String(SCALING_PRINCIPAL));
  const [weeks, setWeeks] = useState<string[]>([]);
  const [pace, setPace] = useState<number>(50);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Saved>;
        if (typeof saved.start === "string") setStart(saved.start);
        if (Array.isArray(saved.weeks)) setWeeks(saved.weeks.filter((w) => typeof w === "string").slice(0, 104));
        if (typeof saved.pace === "number" && (MILESTONE_PACES as readonly number[]).includes(saved.pace)) setPace(saved.pace);
      }
    } catch {
      // private mode / blocked storage -- start fresh
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ start, weeks, pace } satisfies Saved));
    } catch {
      // best-effort
    }
  }, [start, weeks, pace, hydrated]);

  const startBal = Math.max(1, parseFloat(start) || SCALING_PRINCIPAL);

  const rows = useMemo(() => {
    let bal = startBal;
    return weeks.map((w, i) => {
      const p = parsePct(w);
      bal = bal * (1 + p / 100);
      const plan = startBal * Math.pow(1 + pace / 100, i + 1);
      return { week: i + 1, pct: p, balance: bal, plan, diff: bal - plan };
    });
  }, [weeks, startBal, pace]);

  const current = rows.length ? rows[rows.length - 1].balance : startBal;
  const n = rows.length;
  const avg = n ? (Math.pow(current / startBal, 1 / n) - 1) * 100 : 0;
  const green = rows.filter((r) => r.pct > 0).length;
  const red = rows.filter((r) => r.pct < 0).length;
  const last = rows[rows.length - 1];
  const recoverNeed = last && last.pct < 0 && last.pct > -100 ? (1 / (1 + last.pct / 100) - 1) * 100 : null;
  const weeksLeft =
    n && avg > 0 && current < SCALING_TARGET ? Math.ceil(Math.log(SCALING_TARGET / current) / Math.log(1 + avg / 100)) : null;

  function setWeek(i: number, v: string) {
    setWeeks((prev) => prev.map((w, j) => (j === i ? v : w)));
  }

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">📈 My Track</h3>
          <p className="mt-0.5 text-xs text-white/45">
            Log your real weekly result — red weeks included. Saved in this browser only.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-white/50">
            Starting balance
            <input
              inputMode="decimal"
              value={start}
              onChange={(e) => setStart(e.target.value.replace(/[^0-9.]/g, ""))}
              className="mt-1 block w-28 rounded border border-white/15 bg-black/30 px-2 py-1.5 font-mono text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <label className="text-xs text-white/50">
            Compare to plan
            <select
              value={pace}
              onChange={(e) => setPace(Number(e.target.value))}
              className="mt-1 block rounded border border-white/15 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-accent"
            >
              {MILESTONE_PACES.map((p) => (
                <option key={p} value={p}>
                  {p}% weekly
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {n > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Current balance" value={money(current)} tone={current >= startBal ? "good" : "bad"} />
          <Stat label="Real avg / week" value={pct(avg)} tone={avg >= 0 ? "good" : "bad"} />
          <Stat label="Green / red weeks" value={`${green} / ${red}`} />
          <Stat
            label="$100K at your real pace"
            value={current >= SCALING_TARGET ? "Reached 🎉" : weeksLeft ? `~${weeksLeft} more wks` : "Pace below 0%"}
            tone={current >= SCALING_TARGET || weeksLeft ? "good" : "bad"}
          />
        </div>
      )}

      {recoverNeed !== null && (
        <p className="mt-3 rounded border border-loss/30 bg-loss/10 p-3 text-xs leading-relaxed text-white/70">
          Red week logged ({pct(last!.pct, 0)}). Getting back to even takes{" "}
          <span className="font-mono font-semibold text-white">{pct(recoverNeed)}</span> — losses cost more to undo
          than they took. That&apos;s not a reason to size up next week; it&apos;s the reason the −40% stop and the
          two-loss rule exist. The plan didn&apos;t break, the finish line just moved.
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded border border-white/10">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-black/30 text-white/50">
            <tr>
              <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Week</th>
              <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Result %</th>
              <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">My balance</th>
              <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Plan @ {pace}%</th>
              <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">vs. plan</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-white/10">
              <td className="px-3 py-2 font-mono text-white/50">Start</td>
              <td className="px-3 py-2 text-white/30">—</td>
              <td className="px-3 py-2 font-mono text-white">{money(startBal)}</td>
              <td className="px-3 py-2 font-mono text-white/60">{money(startBal)}</td>
              <td className="px-3 py-2 text-white/30">—</td>
            </tr>
            {rows.map((r, i) => (
              <tr key={i} className={`border-t border-white/10 ${r.pct < 0 ? "bg-loss/[0.06]" : ""}`}>
                <td className="px-3 py-2 font-mono text-white/70">Wk {r.week}</td>
                <td className="px-3 py-2">
                  <label className="sr-only" htmlFor={`track-wk-${i}`}>
                    Week {r.week} result percent
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      id={`track-wk-${i}`}
                      inputMode="decimal"
                      value={weeks[i]}
                      onChange={(e) => setWeek(i, e.target.value.replace(/[^0-9.\-]/g, ""))}
                      placeholder="0"
                      className={`w-20 rounded border bg-black/30 px-2 py-1 font-mono text-sm outline-none focus:border-accent ${
                        r.pct < 0 ? "border-loss/50 text-loss" : r.pct > 0 ? "border-accent/40 text-accent" : "border-white/15 text-white"
                      }`}
                    />
                    <span className="text-xs text-white/40">%</span>
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-white">{money(r.balance)}</td>
                <td className="px-3 py-2 font-mono text-white/60">{money(r.plan)}</td>
                <td className={`px-3 py-2 font-mono text-xs ${r.diff >= 0 ? "text-accent" : "text-loss"}`}>
                  {r.diff >= 0 ? "+" : "−"}
                  {money(Math.abs(r.diff))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setWeeks((prev) => (prev.length < 104 ? [...prev, ""] : prev))}
          className="rounded border border-accent/50 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
        >
          + Log a week
        </button>
        {n > 0 && (
          <button
            type="button"
            onClick={() => setWeeks((prev) => prev.slice(0, -1))}
            className="rounded border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:border-white/35 hover:text-white"
          >
            Remove last week
          </button>
        )}
      </div>
      {n === 0 && (
        <p className="mt-2 text-xs text-white/40">
          Tap “Log a week” and enter that week&apos;s % — e.g. 35 for a green week, −20 for a red one.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded border border-white/10 bg-black/25 p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-white/45">{label}</div>
      <div className={`mt-0.5 font-mono text-sm font-semibold ${tone === "good" ? "text-accent" : tone === "bad" ? "text-loss" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}
