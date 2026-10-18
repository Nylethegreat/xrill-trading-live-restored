"use client";

import { explainGreeks } from "@/lib/thesis";

const FOCUS = { accent: "focus:border-accent", daytrade: "focus:border-daytrade" } as const;

// Optional delta/theta on the Trade Plan. Pure information: they never
// change the score or block a trade. When filled in they're translated
// into plain dollars for the whole position so the numbers mean something
// in the moment.
export default function GreeksFields({
  delta,
  theta,
  onChange,
  contracts,
  entryPremium,
  ticker,
  multiLeg,
  tone = "accent",
}: {
  delta: string;
  theta: string;
  onChange: (next: { delta: string; theta: string }) => void;
  contracts: number;
  entryPremium: number | null;
  ticker: string;
  multiLeg: boolean;
  tone?: keyof typeof FOCUS;
}) {
  const d = delta.trim() === "" ? null : parseFloat(delta);
  const th = theta.trim() === "" ? null : parseFloat(theta);
  const deltaBad = d !== null && (Number.isNaN(d) || d < -1 || d > 1);
  const thetaBad = th !== null && (Number.isNaN(th) || th < -100 || th > 100);
  const info = explainGreeks({
    delta: deltaBad ? null : d,
    theta: thetaBad ? null : th,
    contracts,
    entryPremium,
    ticker,
  });

  const input = `w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none ${FOCUS[tone]}`;

  return (
    <div className="rounded border border-white/10 bg-white/5 p-3">
      <p className="mb-2 text-sm text-white/70">
        Greeks <span className="text-xs text-white/35">(optional{multiLeg ? ", use the net numbers for the spread" : ""})</span>
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs text-white/50">Delta</span>
          <input
            type="number"
            step="any"
            value={delta}
            onChange={(e) => onChange({ delta: e.target.value, theta })}
            placeholder="0.42"
            className={input}
          />
          {deltaBad && <span className="mt-1 block text-xs text-loss">Delta is between -1 and 1.</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-white/50">Theta (per day)</span>
          <input
            type="number"
            step="any"
            value={theta}
            onChange={(e) => onChange({ delta, theta: e.target.value })}
            placeholder="-0.18"
            className={input}
          />
          {thetaBad && <span className="mt-1 block text-xs text-loss">That theta looks off. Check your broker.</span>}
        </label>
      </div>
      {(info.deltaLine || info.thetaLine) && (
        <div className="mt-2 space-y-0.5 text-xs text-white/60">
          {info.deltaLine && <p>{info.deltaLine}</p>}
          {info.thetaLine && (
            <p className={info.thetaHeavy ? "text-caution" : undefined}>
              {info.thetaLine}
              {info.thetaPctPerDay !== null && ` (${info.thetaPctPerDay}% of your premium a day)`}
              {info.thetaHeavy && ". Time is expensive on this one, so the move needs to come soon."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
