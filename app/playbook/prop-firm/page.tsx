import PropFirmTiers from "@/components/playbook/PropFirmTiers";

export default function PropFirmPlaybookPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-mono text-xl font-bold tracking-widest text-white">TOPSTEP COMBINE & PROP BLUEPRINT</h1>
      <p className="mt-1 text-sm text-white/50">
        Combine → Express Funded Account → Payout — the same hard parameters that govern the live $50K account.
      </p>

      <div className="mt-6">
        <PropFirmTiers />
      </div>
    </div>
  );
}
