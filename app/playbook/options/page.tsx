import GreeksDashboard from "@/components/playbook/GreeksDashboard";
import HeaderText from "@/components/HeaderText";
import Link from "next/link";
import ZeroDteGreeks from "@/components/playbook/ZeroDteGreeks";

export default function OptionsPlaybookPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <HeaderText className="font-mono text-xl font-bold tracking-widest">OPTIONS FUNDAMENTALS & GREEKS</HeaderText>
      <p className="mt-1 text-sm text-white/50">
        The dashboard dials for every contract — direction, acceleration, decay, and volatility, at a glance.
      </p>

      <div className="mt-6 rounded-lg border border-white/10 bg-surface p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">What Is an Option?</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          A contract that gives you the <em>right</em> (not the obligation) to buy or sell 100 shares of a stock at
          a set price (the <strong>strike</strong>) by a set date (<strong>expiration</strong>). A{" "}
          <strong>call</strong> is the right to buy — you want the stock to go up. A <strong>put</strong> is the
          right to sell — you want the stock to go down. You pay a price for that right, called the{" "}
          <strong>premium</strong>, and that premium is the entire dollar figure the Greeks below are describing
          the behavior of.
        </p>
      </div>

      <div className="mt-6">
        <GreeksDashboard />
      </div>

      <div className="mt-10">
        <h2 className="font-mono text-sm font-bold tracking-widest text-white">0DTE: THE GREEKS ON EXPIRATION DAY</h2>
        <p className="mt-1 text-sm text-white/50">
          Same dials, turned all the way up. This is why 0DTE gets its own rules.{" "}
          <Link href="/playbook/zero-dte" className="text-accent underline">
            See the 0DTE lane →
          </Link>
        </p>
        <div className="mt-4">
          <ZeroDteGreeks />
        </div>
      </div>
    </div>
  );
}
