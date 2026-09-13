"use client";

import { useState } from "react";
import type { EquityPoint } from "@/lib/analytics";

// A minimal line chart: thin 2px stroke, rounded data-ends, recessive
// gridlines, single series (no legend needed — the title names it),
// crosshair + tooltip on hover per the dataviz interaction pattern.
export default function EquityCurve({ points }: { points: EquityPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  if (points.length === 0) {
    return <p className="text-sm text-white/50">No completed trades yet.</p>;
  }

  const width = 640;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 24, left: 56 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const equities = points.map((p) => p.equity);
  const minY = Math.min(0, ...equities);
  const maxY = Math.max(0, ...equities);
  const yRange = maxY - minY || 1;

  const x = (i: number) =>
    padding.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => padding.top + innerH - ((v - minY) / yRange) * innerH;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.equity)}`).join(" ");
  const zeroY = y(0);
  const areaPath = `${linePath} L ${x(points.length - 1)} ${zeroY} L ${x(0)} ${zeroY} Z`;

  const activePoint = hover !== null ? points[hover] : null;
  const isUp = points[points.length - 1].equity >= 0;
  const strokeColor = isUp ? "#22c55e" : "#ef4444";

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Equity curve across completed trades"
        onMouseLeave={() => setHover(null)}
      >
        {/* recessive gridline at zero */}
        <line x1={padding.left} x2={width - padding.right} y1={zeroY} y2={zeroY} stroke="#ffffff1a" strokeWidth={1} />
        <text x={padding.left - 8} y={zeroY} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#ffffff66">
          $0
        </text>
        <text x={padding.left - 8} y={padding.top} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#ffffff66">
          {Math.round(maxY).toLocaleString()}
        </text>
        <text x={padding.left - 8} y={height - padding.bottom} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#ffffff66">
          {Math.round(minY).toLocaleString()}
        </text>

        <path d={areaPath} fill={strokeColor} fillOpacity={0.12} stroke="none" />
        <path d={linePath} fill="none" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle
            key={p.sessionId}
            cx={x(i)}
            cy={y(p.equity)}
            r={hover === i ? 4 : 2.5}
            fill={strokeColor}
            stroke="#07080f"
            strokeWidth={1}
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {/* wide invisible hit targets, per-point */}
        {points.map((p, i) => (
          <rect
            key={`hit-${p.sessionId}`}
            x={x(i) - (innerW / Math.max(points.length - 1, 1)) / 2}
            y={padding.top}
            width={innerW / Math.max(points.length - 1, 1) || innerW}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {activePoint && (
          <line
            x1={x(hover!)}
            x2={x(hover!)}
            y1={padding.top}
            y2={height - padding.bottom}
            stroke="#ffffff33"
            strokeWidth={1}
          />
        )}
      </svg>

      {activePoint && (
        <div className="pointer-events-none absolute top-0 rounded border border-white/10 bg-surface px-2 py-1 text-xs shadow-lg" style={{ left: `calc(${(x(hover!) / width) * 100}% + 8px)` }}>
          <div className="text-white/50">Trade #{activePoint.tradeNumber}</div>
          <div className={activePoint.profitLoss >= 0 ? "text-accent" : "text-loss"}>
            {activePoint.profitLoss >= 0 ? "+" : ""}
            {activePoint.profitLoss.toLocaleString(undefined, { style: "currency", currency: "USD" })}
          </div>
          <div className="text-white/70">
            Equity: {activePoint.equity.toLocaleString(undefined, { style: "currency", currency: "USD" })}
          </div>
        </div>
      )}
    </div>
  );
}
