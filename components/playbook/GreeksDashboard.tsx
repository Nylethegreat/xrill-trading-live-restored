import { GREEKS, GREEKS_CORE_IDEA, type GreekDial } from "@/lib/data/greeks";

const COLOR_CLASSES: Record<string, { border: string; bg: string; text: string }> = {
  primary: { border: "border-primary/30", bg: "bg-primary/10", text: "text-primary" },
  secondary: { border: "border-secondary/30", bg: "bg-secondary/10", text: "text-secondary" },
  loss: { border: "border-loss/30", bg: "bg-loss/10", text: "text-loss" },
  caution: { border: "border-caution/30", bg: "bg-caution/10", text: "text-caution" },
  blocked: { border: "border-blocked/30", bg: "bg-blocked/10", text: "text-blocked" },
};

function GreekCard({ g }: { g: GreekDial }) {
  const c = COLOR_CLASSES[g.color];
  return (
    <div className={`rounded-xl border ${c.border} bg-surface p-4`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-full border ${c.border} ${c.bg} font-mono text-xl font-bold ${c.text}`}>
          {g.symbol}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-white">{g.name}</h3>
          <p className={`text-xs ${c.text}`}>{g.tagline}</p>
        </div>
      </div>

      <p className="mt-3 text-xs uppercase tracking-wide text-white/40">Range</p>
      <p className="mt-0.5 font-mono text-xs text-white/70">{g.range}</p>

      <p className="mt-3 text-sm leading-relaxed text-white/80">{g.definition}</p>

      <div className="mt-3 rounded border border-white/10 bg-white/5 p-2.5 text-xs leading-relaxed text-white/60">
        <span className="font-semibold text-white/80">Example: </span>
        {g.example}
      </div>

      <p className="mt-3 border-t border-white/10 pt-2 text-xs italic leading-relaxed text-white/50">
        {g.takeaway}
      </p>
    </div>
  );
}

export default function GreeksDashboard() {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {GREEKS.map((g) => (
          <GreekCard key={g.key} g={g} />
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-accent/30 bg-accent/10 p-5 text-center">
        <p className="text-sm font-semibold leading-relaxed text-white sm:text-base">"{GREEKS_CORE_IDEA}"</p>
      </div>
    </div>
  );
}
