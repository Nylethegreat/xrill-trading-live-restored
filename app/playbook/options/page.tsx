import GreeksDashboard from "@/components/playbook/GreeksDashboard";

export default function OptionsPlaybookPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-mono text-xl font-bold tracking-widest text-white">OPTIONS FUNDAMENTALS & GREEKS</h1>
      <p className="mt-1 text-sm text-white/50">
        The dashboard dials for every contract — direction, acceleration, decay, and volatility, at a glance.
      </p>

      <div className="mt-6">
        <GreeksDashboard />
      </div>
    </div>
  );
}
