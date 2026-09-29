"use client";

import NeuronField, { type NeuronIntensity } from "@/components/visuals/NeuronField";
import FallingLeaves, { type LeafDensity } from "@/components/visuals/FallingLeaves";
import SegmentedToggle from "@/components/visuals/SegmentedToggle";
import { usePersistentChoice } from "@/lib/usePersistentChoice";

const NEURON_OPTIONS = ["off", "subtle", "strong"] as const;
type NeuronChoice = (typeof NEURON_OPTIONS)[number];

// Intelligence page: fluorescent neuron network behind everything, with a
// per-visitor Off / Subtle / Strong setting. Subtle by default so the page
// never looks empty, but stays readable.
export function NeuronBackdropControl({ className = "" }: { className?: string }) {
  const [choice, setChoice, hydrated] = usePersistentChoice<NeuronChoice>("xrill-neurons", NEURON_OPTIONS, "subtle");
  return (
    <>
      {hydrated && choice !== "off" && <NeuronField intensity={choice as NeuronIntensity} />}
      <SegmentedToggle
        label="🧠 Neurons"
        value={choice}
        onChange={setChoice}
        className={className}
        activeClass="bg-gradient-to-r from-cyan-400/25 via-lime-300/20 to-orange-400/25 text-white [text-shadow:0_0_8px_rgba(34,211,238,0.8)]"
        options={[
          { key: "off", label: "Off" },
          { key: "subtle", label: "Subtle" },
          { key: "strong", label: "Strong" },
        ]}
      />
    </>
  );
}

const LEAF_OPTIONS = ["off", "light", "flurry"] as const;
type LeafChoice = (typeof LEAF_OPTIONS)[number];

// Analytics page: autumn leaves drifting down -- the numbers change like
// the seasons. Per-visitor Off / Light / Flurry.
export function LeavesBackdropControl({ className = "" }: { className?: string }) {
  const [choice, setChoice, hydrated] = usePersistentChoice<LeafChoice>("xrill-leaves", LEAF_OPTIONS, "light");
  return (
    <>
      {hydrated && choice !== "off" && <FallingLeaves density={choice as LeafDensity} />}
      <SegmentedToggle
        label="🍂 Leaves"
        value={choice}
        onChange={setChoice}
        className={className}
        activeClass="bg-orange-500/20 text-orange-200 [text-shadow:0_0_8px_rgba(251,146,60,0.7)]"
        options={[
          { key: "off", label: "Off" },
          { key: "light", label: "Light" },
          { key: "flurry", label: "Flurry" },
        ]}
      />
    </>
  );
}
