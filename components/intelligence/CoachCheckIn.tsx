"use client";

import { useState } from "react";
import Badge from "@/components/Badge";
import { scoreCoachCheckIn, type CoachResult } from "@/lib/coach";

const DIMENSIONS: { key: "confidence" | "discipline" | "emotionalControl" | "patience"; label: string }[] = [
  { key: "confidence", label: "Confidence" },
  { key: "discipline", label: "Discipline" },
  { key: "emotionalControl", label: "Emotional control" },
  { key: "patience", label: "Patience" },
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
    <div className="rounded border border-white/10 bg-surface p-4">
      <p className="mb-4 text-xs text-white/50">
        Rate yourself 1–10 on each dimension before you trade. This is a quick mindset gut-check — separate from the
        Daily Check-In gate in the session wizard.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DIMENSIONS.map((d) => (
          <label key={d.key} className="block text-sm">
            <div className="mb-1 flex items-center justify-between text-white/70">
              <span>{d.label}</span>
              <span className="font-mono text-white/50">{values[d.key]}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={values[d.key]}
              onChange={(e) => setValues((v) => ({ ...v, [d.key]: Number(e.target.value) }))}
              className="w-full accent-primary"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setResult(scoreCoachCheckIn(values))}
        className="mt-4 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
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
