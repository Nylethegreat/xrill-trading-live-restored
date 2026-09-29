"use client";

import NeuronPulse from "@/components/visuals/NeuronPulse";
import PurpleOrbs, { type OrbPalette } from "@/components/visuals/PurpleOrbs";
import FallingLeaves, { type LeafDensity } from "@/components/visuals/FallingLeaves";
import SegmentedToggle from "@/components/visuals/SegmentedToggle";
import NightDriveTexture from "@/components/visuals/textures/NightDriveTexture";
import SynthwaveTexture from "@/components/visuals/textures/SynthwaveTexture";
import { usePersistentChoice } from "@/lib/usePersistentChoice";

const NEURON_OPTIONS = ["off", "slight", "normal"] as const;
type NeuronChoice = (typeof NEURON_OPTIONS)[number];

// Intelligence page: the original lightweight SVG neuron network, recolored
// in microscopy colors with slow pulses (no canvas -- the canvas version
// was too heavy). Slight = the header band only; Normal = the band plus a
// second, larger network filling the rest of the page.
export function NeuronBackdropControl({ className = "" }: { className?: string }) {
  const [choice, setChoice, hydrated] = usePersistentChoice<NeuronChoice>("xrill-neurons-v2", NEURON_OPTIONS, "slight");
  return (
    <>
      {hydrated && choice !== "off" && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-4 -z-10 h-[420px]">
          <NeuronPulse spectrum idPrefix="neuron-top" className={`h-full w-full ${choice === "normal" ? "opacity-60" : "opacity-35"}`} />
        </div>
      )}
      {hydrated && choice === "normal" && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-[70vh] opacity-40">
          <NeuronPulse spectrum idPrefix="neuron-bottom" className="h-full w-full -scale-x-100" />
        </div>
      )}
      <SegmentedToggle
        label="🧠 Neurons"
        value={choice}
        onChange={setChoice}
        className={className}
        activeClass="bg-gradient-to-r from-cyan-400/25 via-lime-300/20 to-orange-400/25 text-white [text-shadow:0_0_8px_rgba(34,211,238,0.8)]"
        options={[
          { key: "off", label: "Off" },
          { key: "slight", label: "Slight" },
          { key: "normal", label: "Normal" },
        ]}
      />
    </>
  );
}

const ORB_OPTIONS = ["purple", "sunset"] as const;

// Analytics page: the floating orbs, now with a color choice.
export function OrbsBackdropControl({ className = "" }: { className?: string }) {
  const [palette, setPalette] = usePersistentChoice<OrbPalette>("xrill-orbs", ORB_OPTIONS, "purple");
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <PurpleOrbs palette={palette} />
      </div>
      <SegmentedToggle
        label="🔮 Orbs"
        value={palette}
        onChange={setPalette}
        className={className}
        activeClass={
          palette === "purple"
            ? "bg-blocked/25 text-purple-200 [text-shadow:0_0_8px_rgba(168,85,247,0.8)]"
            : "bg-rose-500/20 text-rose-200 [text-shadow:0_0_8px_rgba(244,63,94,0.7)]"
        }
        options={[
          { key: "purple", label: "Purple" },
          { key: "sunset", label: "Sunset" },
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

const PRICING_OPTIONS = ["off", "night_drive", "synthwave"] as const;
type PricingChoice = (typeof PRICING_OPTIONS)[number];

// Pricing page: optional retro backdrop behind the plan cards. Off by
// default so first-time visitors see the plans clean; remembered per visitor.
export function PricingBackdropControl({ className = "" }: { className?: string }) {
  const [choice, setChoice, hydrated] = usePersistentChoice<PricingChoice>("xrill-pricing-bg", PRICING_OPTIONS, "off");
  return (
    <>
      {hydrated && choice !== "off" && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
          {choice === "night_drive" ? (
            <NightDriveTexture idPrefix="drive-pricing" className="opacity-60" />
          ) : (
            <SynthwaveTexture idPrefix="synth-pricing" className="opacity-55" />
          )}
        </div>
      )}
      <SegmentedToggle
        label="🌆 Backdrop"
        value={choice}
        onChange={setChoice}
        className={className}
        activeClass="bg-gradient-to-r from-pink-500/25 to-sky-400/25 text-white [text-shadow:0_0_8px_rgba(255,62,165,0.8)]"
        options={[
          { key: "off", label: "Off" },
          { key: "night_drive", label: "Night Drive" },
          { key: "synthwave", label: "Synthwave" },
        ]}
      />
    </>
  );
}
