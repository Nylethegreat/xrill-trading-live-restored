import StrategyGrid from "@/components/playbook/StrategyGrid";
import PreTradeScorecard from "@/components/playbook/PreTradeScorecard";
import HeaderText from "@/components/HeaderText";

export default function StrategiesPlaybookPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <HeaderText className="font-mono text-xl font-bold tracking-widest">20 STRATEGIES REFRESHER</HeaderText>
      <p className="mt-1 text-sm text-white/50">Search or filter the setup library, then score a live idea against the scorecard.</p>

      <div className="mt-6">
        <StrategyGrid />
      </div>

      <div className="mt-10">
        <PreTradeScorecard />
      </div>
    </div>
  );
}
