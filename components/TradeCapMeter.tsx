// Daily Trade Cap meter, next to the Daily Loss and Two-Loss meters on
// XRILL Status. One ticket per trade allowed today; a used ticket is a
// real trade (engine-authorized or logged after the fact). Server
// component: pure props in, static markup out.
export default function TradeCapMeter({
  taken,
  cap,
  skippedEngine,
  pendingCap,
  pendingFrom,
}: {
  taken: number;
  cap: number;
  skippedEngine: number;
  pendingCap: number | null;
  pendingFrom: string | null;
}) {
  const locked = taken >= cap;
  const left = Math.max(0, cap - taken);

  return (
    <div className="rounded border border-white/10 bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">Daily Trade Cap</h3>
        <span className={locked ? "text-loss" : left === 1 ? "text-caution" : "text-white/70"}>
          {taken}/{cap} trades today
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {Array.from({ length: Math.max(cap, taken) }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`text-xl ${i < taken ? (i >= cap ? "opacity-100 grayscale" : "opacity-20") : "opacity-100"}`}
          >
            🎟️
          </span>
        ))}
        <span className="ml-1 text-lg" aria-hidden="true">
          {locked ? "🔒" : "🔓"}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-white/40">
        {locked
          ? "No tickets left — the terminal is locked until tomorrow. This is the rule doing its job."
          : left === 1
            ? "Last ticket today. Spend it on an A+ setup or don't spend it."
            : "Each trade uses a ticket, whether it went through the engine or not. Blocked sessions are free."}
      </p>
      {skippedEngine > 0 && (
        <p className="mt-1 text-[11px] text-loss">
          {skippedEngine} trade{skippedEngine === 1 ? "" : "s"} today skipped the engine. Those still used a ticket.
        </p>
      )}
      {pendingCap && pendingFrom && (
        <p className="mt-1 text-[11px] text-white/40">Cap goes to {pendingCap} on {pendingFrom}.</p>
      )}
    </div>
  );
}
