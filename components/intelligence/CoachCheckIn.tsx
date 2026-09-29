"use client";

import { useState } from "react";
import Badge from "@/components/Badge";
import { scoreCoachCheckIn, type CoachResult } from "@/lib/coach";

// Each trait gets its own neuron-palette color so the four read as
// distinct, "hardcore" pillars -- a soft glow, nothing loud.
const DIMENSIONS: {
  key: "confidence" | "discipline" | "emotionalControl" | "patience";
  label: string;
  rgb: string;
}[] = [
  { key: "confidence", label: "Confidence", rgb: "250 204 21" }, // yellow
  { key: "discipline", label: "Discipline", rgb: "34 197 94" }, // green
  { key: "emotionalControl", label: "Emotional control", rgb: "34 211 238" }, // cyan
  { key: "patience", label: "Patience", rgb: "251 146 60" }, // orange
];

const STATUS_TONE: Record<CoachResult["status"], "good" | "info" | "caution" | "blocked"> = {
  ELITE: "good",
  READY: "info",
  CAUTION: "caution",
  "NOT READY": "blocked",
};

export default function CoachCheckIn() {
  const [values, setValues] = useState({ confidence: 5, discipline: 5, emotionalControl: 5, patience: 5 });
  const [result, setResult] = useState<CoachResult | null>(null);

  return (
    <div className="rounded border border-cyan-400/25 bg-surface p-4 shadow-[0_0_22px_-8px_rgba(34,211,238,0.45)]">
      <p className="mb-4 text-xs text-white/50">
        Rate yourself 1–10 on each dimension before you trade. This is a quick mindset gut-check — separate from the
        Daily Check-In gate in the session wizard.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DIMENSIONS.map((d) => (
          <label
            key={d.key}
            style={{ "--trait": d.rgb } as React.CSSProperties}
            className="block rounded border border-[rgb(var(--trait)/0.2)] bg-[rgb(var(--trait)/0.04)] p-3 text-sm transition-shadow hover:shadow-[0_0_16px_-6px_rgb(var(--trait)/0.7)]"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wide text-[rgb(var(--trait))] [text-shadow:0_0_8px_rgb(var(--trait)/0.55)]">
                {d.label}
              </span>
              <span className="font-mono text-white/80 [text-shadow:0_0_6px_rgb(var(--trait)/0.5)]">{values[d.key]}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={values[d.key]}
              onChange={(e) => setValues((v) => ({ ...v, [d.key]: Number(e.target.value) }))}
              style={{ accentColor: `rgb(${d.rgb})` }}
              className="w-full"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setResult(scoreCoachCheckIn(values))}
        className="mt-4 rounded bg-primary px-4 py-2 text-sm font-medium text-white shadow-[0_0_14px_-3px_rgba(59,130,246,0.8)] transition-shadow hover:opacity-90 hover:shadow-[0_0_20px_-2px_rgba(59,130,246,0.95)]"
      >
        Run Coach Check-In
      </button>

      {result && (
        <div className="mt-4 rounded border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <Badge tone={STATUS_TONE[result.status]}>{result.status}</Badge>
            <span className="font-mono text-sm text-white/70">
              {result.score}/40 · {result.average.toFixed(1)}/10
            </span>
          </div>
          <p className="mt-2 text-sm text-white">{result.headline}</p>
          <p className="text-sm text-white/60">{result.guidance}</p>
        </div>
      )}
    </div>
  );
}
