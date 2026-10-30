import { ZERO_DTE_CLOSE_WARNINGS, ZERO_DTE_GREEKS } from "@/lib/data/greeks";

const COLOR: Record<string, { border: string; text: string }> = {
  primary: { border: "border-primary/30", text: "text-primary" },
  secondary: { border: "border-secondary/30", text: "text-secondary" },
  loss: { border: "border-loss/30", text: "text-loss" },
  caution: { border: "border-caution/30", text: "text-caution" },
};

// What each Greek does on expiration day, especially the last hour.
// Shared by /playbook/options and /playbook/zero-dte.
export default function ZeroDteGreeks() {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {ZERO_DTE_GREEKS.map((g) => {
          const c = COLOR[g.color];
          return (
            <div key={g.name} className={`rounded-xl border ${c.border} bg-surface p-4`}>
              <p className={`font-mono text-sm font-bold ${c.text}`}>
                {g.symbol} {g.name} on 0DTE
              </p>
              <p className="mt-2 text-sm text-white/85">{g.headline}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-white/40">The last hour</p>
              <p className="mt-0.5 text-sm leading-relaxed text-white/70">{g.lastHour}</p>
              <div className="mt-3 rounded border border-white/10 bg-white/5 p-2.5 text-xs leading-relaxed text-white/60">
                {g.example}
              </div>
              <p className={`mt-3 border-t border-white/10 pt-2 text-xs ${c.text}`}>{g.rule}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-xl border border-loss/30 bg-loss/10 p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-loss">Into the close</p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-white/80">
          {ZERO_DTE_CLOSE_WARNINGS.map((w) => (
            <li key={w}>• {w}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
