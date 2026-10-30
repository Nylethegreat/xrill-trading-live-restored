import { explainGreeks, exitReasonLabel, thesisResultLabel } from "@/lib/thesis";
import { getStrategy } from "@/lib/data/strategies";
import { getTradingStyle } from "@/lib/data/tradingStyles";

// Everything about one trade in a single left-to-right swipe: the why,
// the score, the plan, the contract, the risk, and how sure you were.
// Used as the last look in both engines' Execution Check, pinned to the
// position in the Journal, and as the "planned vs happened" review once
// the trade is closed. Server- and client-safe (no hooks).

export interface TradeCardData {
  ticker: string | null;
  sideLabel: string | null; // "CALL", "PUT", or a spread label
  engine: "standard" | "daytrade" | string | null;
  strategy: string | null;
  tradingStyle?: string | null; // TRADING_STYLES key
  thesis: string | null;
  invalidation: string | null;
  confidencePre: number | null;
  setupScore: number | null;
  volumeState: string | null; // "confirming" | "absent"
  entry: number | null;
  stop: number | null;
  target: number | null;
  rr: number | null;
  contracts: number | null;
  delta: number | null;
  theta: number | null;
  tradeRisk: number | null;
  accountBalance?: number | null;
  // Filled in once the trade is closed
  confidencePost?: number | null;
  thesisResult?: string | null;
  exitReason?: string | null;
  profitLoss?: number | null;
}

const money = (v: number) => `$${v.toFixed(2)}`;

function Card({ title, icon, children, wide }: { title: string; icon: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className={`shrink-0 snap-start rounded-lg border border-white/10 bg-surface p-3 ${wide ? "w-64" : "w-48"}`}
    >
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/40">
        <span aria-hidden="true">{icon}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

function Line({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="flex justify-between py-0.5 text-xs">
      <span className="text-white/50">{label}</span>
      <span className={`font-mono ${tone === "good" ? "text-accent" : tone === "bad" ? "text-loss" : "text-white/90"}`}>
        {value}
      </span>
    </div>
  );
}

export default function TradeCardStrip({ data, title }: { data: TradeCardData; title?: string }) {
  const strat = getStrategy(data.strategy);
  const volumeRequired = strat?.volumeRequired ?? true;
  const greeks = explainGreeks({
    delta: data.delta,
    theta: data.theta,
    contracts: data.contracts ?? 1,
    entryPremium: data.entry,
    ticker: data.ticker ?? undefined,
  });
  const riskPct =
    data.tradeRisk !== null && data.accountBalance && data.accountBalance > 0
      ? (data.tradeRisk / data.accountBalance) * 100
      : null;
  const closed = data.profitLoss !== undefined && data.profitLoss !== null;
  const confShift =
    data.confidencePre && data.confidencePost ? data.confidencePost - data.confidencePre : null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-white/70">
          {title ?? `${data.ticker ?? "—"} ${data.sideLabel ?? ""}`}
          {data.engine === "daytrade" && <span className="ml-1.5 text-daytrade">⚡ Daytrade</span>}
        </span>
        <span className="text-white/35">swipe →</span>
      </div>
      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
        <Card title="Your thesis" icon="💡" wide>
          {data.thesis ? (
            <p className="text-sm leading-snug text-white/90">&ldquo;{data.thesis}&rdquo;</p>
          ) : (
            <p className="text-xs text-white/35">No thesis written for this one.</p>
          )}
          {data.invalidation && (
            <p className="mt-2 text-xs text-white/60">
              <span className="text-loss">Wrong if:</span> {data.invalidation}
            </p>
          )}
        </Card>

        <Card title="Strategy + score" icon="🎯">
          <p className="font-mono text-xl text-white">
            {data.setupScore !== null ? `${data.setupScore}/25` : "—"}
          </p>
          <p className="text-xs text-white/60">{data.strategy ?? "No strategy picked"}</p>
          {getTradingStyle(data.tradingStyle) && (
            <p className="text-[11px] text-white/45">
              {getTradingStyle(data.tradingStyle)!.name} · {getTradingStyle(data.tradingStyle)!.horizon}
            </p>
          )}
          {data.volumeState && (
            <span
              className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] ${
                data.volumeState === "confirming"
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : volumeRequired
                    ? "border-loss/40 bg-loss/10 text-loss"
                    : "border-caution/40 bg-caution/10 text-caution"
              }`}
            >
              {data.volumeState === "confirming"
                ? "Volume confirming"
                : volumeRequired
                  ? "Volume missing"
                  : "Volume quiet, not required"}
            </span>
          )}
        </Card>

        <Card title="Plan" icon="🧭">
          <Line label="Entry" value={data.entry !== null ? money(data.entry) : "—"} />
          <Line label="Stop" value={data.stop !== null ? money(data.stop) : "—"} tone="bad" />
          <Line label="Target" value={data.target !== null ? money(data.target) : "—"} tone="good" />
          <Line label="R:R" value={data.rr !== null ? data.rr.toFixed(2) : "—"} />
        </Card>

        <Card title="Contract" icon="📐">
          <Line label="Size" value={data.contracts !== null ? `${data.contracts}x` : "—"} />
          <Line label="Delta" value={data.delta !== null ? String(data.delta) : "—"} />
          <Line label="Theta" value={data.theta !== null ? String(data.theta) : "—"} />
          {(greeks.deltaLine || greeks.thetaLine) && (
            <p className={`mt-1.5 text-[11px] leading-snug ${greeks.thetaHeavy ? "text-caution" : "text-white/50"}`}>
              {[greeks.deltaLine, greeks.thetaLine].filter(Boolean).join(". ")}.
            </p>
          )}
        </Card>

        <Card title="Risk" icon="🛡️">
          <p className="font-mono text-xl text-loss">{data.tradeRisk !== null ? money(data.tradeRisk) : "—"}</p>
          <p className="text-xs text-white/50">
            {riskPct !== null ? `${riskPct.toFixed(1)}% of account` : "Max you can lose on this"}
          </p>
        </Card>

        <Card title="Confidence" icon="🧠">
          <div className="flex items-baseline gap-2">
            <p className="font-mono text-xl text-white">{data.confidencePre ?? "—"}</p>
            <span className="text-xs text-white/40">before</span>
            {closed && (
              <>
                <span className="text-white/30">→</span>
                <p className="font-mono text-xl text-white">{data.confidencePost ?? "—"}</p>
                <span className="text-xs text-white/40">after</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-white/50">
            {closed
              ? confShift === null
                ? "Rate both to see the shift."
                : confShift === 0
                  ? "Same conviction in and out."
                  : `${confShift > 0 ? "+" : ""}${confShift} from entry to exit.`
              : "You'll rate it again when you close."}
          </p>
        </Card>

        {closed && (
          <Card title="What happened" icon="📓" wide>
            <p className={`font-mono text-xl ${data.profitLoss! >= 0 ? "text-accent" : "text-loss"}`}>
              {data.profitLoss! >= 0 ? "+" : "-"}${Math.abs(data.profitLoss!).toFixed(2)}
            </p>
            <Line label="Thesis" value={thesisResultLabel(data.thesisResult) ?? "—"} />
            <Line
              label="Exit"
              value={exitReasonLabel(data.exitReason) ?? "—"}
              tone={data.exitReason === "emotional" ? "bad" : undefined}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
