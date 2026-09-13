"use client";

import { useMemo, useState } from "react";
import { SCORECARD_CRITERIA, SCORECARD_MAX, scorecardGrade } from "@/lib/data/strategies";
import Badge from "@/components/Badge";

export default function PreTradeScorecard() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const score = useMemo(
    () => SCORECARD_CRITERIA.reduce((sum, c) => sum + (checked[c.key] ? c.points : 0), 0),
    [checked]
  );
  const { grade, tone } = scorecardGrade(score);

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">10-Point Pre-Trade Scorecard</h3>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-white">
            {score}/{SCORECARD_MAX}
          </span>
          <Badge tone={tone}>{grade}</Badge>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {SCORECARD_CRITERIA.map((c) => (
          <label
            key={c.key}
            className="flex cursor-pointer items-center justify-between gap-3 rounded border border-white/10 bg-white/5 px-3 py-2 hover:border-white/20"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!checked[c.key]}
                onChange={(e) => setChecked((prev) => ({ ...prev, [c.key]: e.target.checked }))}
                className="h-4 w-4 accent-accent"
              />
              <div>
                <span className="text-sm text-white">{c.label}</span>
                <p className="text-xs text-white/40">{c.hint}</p>
              </div>
            </div>
            <span className="font-mono text-xs text-white/50">+{c.points}</span>
          </label>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1.5 text-center text-[10px] text-white/50">
        <div className="rounded bg-accent/15 py-1 text-accent">9–10 Very Strong</div>
        <div className="rounded bg-primary/15 py-1 text-primary">7–8 Strong</div>
        <div className="rounded bg-caution/15 py-1 text-caution">5–6 Mixed</div>
        <div className="rounded bg-blocked/15 py-1 text-blocked">&lt;5 Hard Pass</div>
      </div>
    </div>
  );
}
