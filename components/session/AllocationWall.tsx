// Persistent "allocation wall" shown alongside every Start Session step --
// the real 60% trade-allocation / 40% idle-cash-buffer split your
// playbook actually enforces (see app/playbook/page.tsx's Twelve-Stage
// roadmap and its "$150 alloc / $100 idle out of a $250 cap" example),
// computed live from the account balance passed into the wizard. This is
// NOT the same thing as the 2-5% "risk per trade" field on /account --
// that's how much of the account you're willing to lose on one trade;
// this is how much of the account is allowed to be deployed across ALL
// open positions at once. Both are real, both matter, they're just
// different rules.
export default function AllocationWall({ balance }: { balance: number }) {
  const tradeAllocation = balance * 0.6;
  const idleCash = balance * 0.4;

  return (
    <div className="rounded-lg border border-white/10 bg-surface p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">Capital Allocation</h3>
      <p className="mt-1 text-[11px] text-white/40">60% deployable / 40% idle, per the compounding playbook</p>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-black/40">
        <div className="flex h-full">
          <div className="h-full bg-accent" style={{ width: "60%" }} />
          <div className="h-full bg-white/15" style={{ width: "40%" }} />
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-white/60">
            <span className="h-2 w-2 rounded-full bg-accent" /> Trade allocation (60%)
          </span>
          <span className="font-mono text-white">${tradeAllocation.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-white/60">
            <span className="h-2 w-2 rounded-full bg-white/30" /> Idle cash buffer (40%)
          </span>
          <span className="font-mono text-white">${idleCash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      <p className="mt-3 border-t border-white/10 pt-2 text-[11px] leading-relaxed text-white/40">
        The 40% buffer stays untouched no matter how this session goes — it's what keeps a losing streak from
        impairing the account. This is separate from your 2–5% per-trade risk setting on Account Settings.
      </p>
    </div>
  );
}
