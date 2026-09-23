import GreeksDashboard from "@/components/playbook/GreeksDashboard";

export default function OptionsPlaybookPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-mono text-xl font-bold tracking-widest text-white">OPTIONS FUNDAMENTALS & GREEKS</h1>
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
    </div>
  );
}
