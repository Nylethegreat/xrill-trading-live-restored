import { LATEST_AUDIT } from "@/lib/data/audit";

// Member-only "Weekly Performance Audit" — the write-up format nyle already
// produces by hand each week (see LATEST_AUDIT / lib/data/audit.ts), styled
// to match the rest of the dark terminal aesthetic. Update lib/data/audit.ts
// with each new week's numbers; a fully automated version that generates
// this write-up straight from xrill_outcomes rows is a real follow-on
// feature, not built here.
export default function WeeklyAuditCard() {
  const audit = LATEST_AUDIT;
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Weekly Performance Audit</h3>
        <span className="font-mono text-xs text-white/40">{audit.weekLabel}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {audit.metrics.map((m) => (
          <div key={m.label} className="rounded border border-white/10 bg-white/5 p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-white/40">{m.label}</div>
            <div className="mt-0.5 font-mono text-sm text-white">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-accent">What You Did Right</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-white/70">
            {audit.didRight.map((r, i) => (
              <li key={i} className="border-l-2 border-accent/40 pl-3">{r}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-loss">What You Did Wrong</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-white/70">
            {audit.didWrong.map((r, i) => (
              <li key={i} className="border-l-2 border-loss/40 pl-3">{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
