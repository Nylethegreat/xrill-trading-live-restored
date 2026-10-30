"use client";

import { useState } from "react";
import Link from "next/link";
import { TRADER_INTELLIGENCES } from "@/lib/data/traderIntelligences";

// The 9 Intelligences of a Trader: tap a slice to see what the skill is,
// how it shows up when it's missing, and where XRILL trains it.
const S = 1000, C = 500, R = 470, R0 = 165;

function wedge(i: number, n: number, grow = 0) {
  const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
  const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
  const rr = R + grow;
  const p = (a: number, d: number) => `${(C + Math.cos(a) * d).toFixed(1)} ${(C + Math.sin(a) * d).toFixed(1)}`;
  return `M${p(a0, R0)} L${p(a0, rr)} A${rr} ${rr} 0 0 1 ${p(a1, rr)} L${p(a1, R0)} A${R0} ${R0} 0 0 0 ${p(a0, R0)}Z`;
}

export default function TraderWheel() {
  const [active, setActive] = useState(TRADER_INTELLIGENCES[0].key);
  const n = TRADER_INTELLIGENCES.length;
  const sel = TRADER_INTELLIGENCES.find((t) => t.key === active)!;

  return (
    <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox={`-10 -10 ${S + 20} ${S + 20}`} className="w-full" role="list" aria-label="The 9 Intelligences of a Trader">
        {TRADER_INTELLIGENCES.map((t, i) => {
          const mid = ((i + 0.5) / n) * 2 * Math.PI - Math.PI / 2;
          const on = t.key === active;
          const words = t.name.replace("-", "- ").split(" ");
          const tx = C + Math.cos(mid) * 320;
          const ty = C + Math.sin(mid) * 320;
          return (
            <g
              key={t.key}
              role="listitem"
              tabIndex={0}
              aria-label={t.name}
              aria-pressed={on}
              onClick={() => setActive(t.key)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActive(t.key)}
              className="cursor-pointer outline-none"
            >
              <path
                d={wedge(i, n, on ? 10 : 0)}
                fill={t.color}
                opacity={on ? 1 : 0.72}
                stroke="#0b0f14"
                strokeWidth="8"
                className="transition-opacity hover:opacity-100"
              />
              {words.map((w, k) => (
                <text
                  key={k}
                  x={tx}
                  y={ty + (k - (words.length - 1) / 2) * 38 + 11}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="33"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {w}
                </text>
              ))}
            </g>
          );
        })}
        <circle cx={C} cy={C} r={R0 - 8} fill="#eef1f5" />
        <text x={C} y={C - 44} textAnchor="middle" fill="#5b6472" fontSize="21" letterSpacing="1.5">9 INTELLIGENCES</text>
        <text x={C} y={C + 10} textAnchor="middle" fill="#1b2230" fontSize="52" fontWeight="bold">OF A</text>
        <text x={C} y={C + 64} textAnchor="middle" fill="#1b2230" fontSize="52" fontWeight="bold">TRADER</text>
      </svg>

      <div className="rounded-lg border p-4" style={{ borderColor: `${sel.color}99`, background: `${sel.color}1f` }}>
        <p className="text-lg font-bold text-white">
          {sel.name}
        </p>
        <p className="mt-1 text-sm text-white/80">{sel.line}</p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-white/45">When it&apos;s missing</p>
        <p className="mt-0.5 text-sm text-white/70">{sel.missing}</p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-white/45">Train it</p>
        <ul className="mt-1 space-y-1.5 text-sm text-white/80">
          {sel.train.map((t) => (
            <li key={t.text}>
              • {t.text}
              {t.href && (
                <>
                  {" "}
                  <Link href={t.href} className="text-accent underline">
                    Go →
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-white/40">Tap any slice to switch.</p>
      </div>
    </div>
  );
}
