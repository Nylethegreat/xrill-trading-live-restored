import Link from "next/link";

// One strip, shown at the bottom of the planning/working pages, that ties
// the sectors together in the order a trade actually flows: plan it, study
// it, run it through the engine, record it, measure it, review it. The
// current page is highlighted and the next stop gets the CTA.
export type Sector = "blueprint" | "playbook" | "session" | "journal" | "analytics" | "intelligence";

const SECTORS: { key: Sector; href: string; icon: string; label: string; verb: string }[] = [
  { key: "blueprint", href: "/blueprint", icon: "🧭", label: "Blueprint", verb: "Plan" },
  { key: "playbook", href: "/playbook", icon: "📘", label: "Playbook", verb: "Study" },
  { key: "session", href: "/session", icon: "⚡", label: "Trade Engine", verb: "Execute" },
  { key: "journal", href: "/journal", icon: "📓", label: "Journal", verb: "Record" },
  { key: "analytics", href: "/analytics", icon: "📈", label: "Analytics", verb: "Measure" },
  { key: "intelligence", href: "/intelligence", icon: "🧠", label: "Intelligence", verb: "Review" },
];

export default function SectorLinks({ current, className = "" }: { current: Sector; className?: string }) {
  const i = SECTORS.findIndex((s) => s.key === current);
  const next = SECTORS[(i + 1) % SECTORS.length];
  return (
    <nav aria-label="XRILL sectors" className={`rounded-xl border border-white/10 bg-black/50 p-3 backdrop-blur-sm ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        {SECTORS.map((s, k) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <Link
              href={s.href}
              aria-current={s.key === current ? "page" : undefined}
              className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                s.key === current ? "bg-accent/20 text-white ring-1 ring-accent/50" : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="mr-1">{s.icon}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">{s.verb}</span> {s.label}
            </Link>
            {k < SECTORS.length - 1 && <span className="text-white/20">→</span>}
          </span>
        ))}
        <Link
          href={next.href}
          className="ml-auto rounded-lg border border-accent/40 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10"
        >
          Next: {next.verb} → {next.label}
        </Link>
      </div>
    </nav>
  );
}
