import PropFirmTiers from "@/components/playbook/PropFirmTiers";
import HeaderText from "@/components/HeaderText";

export default function PropFirmPlaybookPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <HeaderText className="font-mono text-xl font-bold tracking-widest">TOPSTEP COMBINE & PROP BLUEPRINT</HeaderText>
      <p className="mt-1 text-sm text-white/50">
        Combine → Express Funded Account → Payout — the same hard parameters that govern the live $50K account.
      </p>

      <div className="mt-6">
        <PropFirmTiers />
      </div>
    </div>
  );
}
