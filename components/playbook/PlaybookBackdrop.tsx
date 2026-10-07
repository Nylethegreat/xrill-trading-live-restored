"use client";

import { usePersistentChoice } from "@/lib/usePersistentChoice";
import { SCROLL_COLOR_IDS, type ScrollColorId } from "@/lib/data/scrollColors";
import BackdropChooser, { type BackdropOption } from "@/components/visuals/BackdropChooser";
import JellyfishTexture from "@/components/visuals/textures/JellyfishTexture";
import FogCityTexture from "@/components/visuals/textures/FogCityTexture";
import ScrollTexture from "@/components/visuals/textures/ScrollTexture";
import SunsetPalmsTexture from "@/components/visuals/textures/SunsetPalmsTexture";
import HometownTexture from "@/components/visuals/textures/HometownTexture";

// Per-visitor Playbook backdrop (remembered in this browser): the default
// star field, a moving jellyfish bloom, Fog City, Sunset Palms, Hometown,
// or the dyed scroll.
type PlaybookBg = "stars" | "jellyfish" | "fog_city" | "sunset_palms" | "hometown" | "scroll";
const IDS: readonly PlaybookBg[] = ["stars", "jellyfish", "fog_city", "sunset_palms", "hometown", "scroll"];

const OPTIONS: BackdropOption<PlaybookBg>[] = [
  { id: "stars", label: "Star Field", swatch: "radial-gradient(circle,#fde68a,#1e1b4b 70%)" },
  { id: "jellyfish", label: "Jellyfish Bloom", swatch: "radial-gradient(circle,#c4b5fd,#3b2a8a)" },
  { id: "fog_city", label: "Fog City", swatch: "linear-gradient(180deg,#0a1213,#2b3e3e 60%,#ef4444)" },
  { id: "sunset_palms", label: "Sunset Palms", swatch: "radial-gradient(circle at 50% 60%,#fffbea,#f59e42 35%,#7a2f1c 75%)" },
  { id: "hometown", label: "Hometown", swatch: "linear-gradient(160deg,#2a1e4a,#4b2a5e 45%,#a35a4c)" },
  { id: "scroll", label: "Ancient Scroll", swatch: "linear-gradient(135deg,#b88a4f,#2e2112)" },
];

export default function PlaybookBackdrop() {
  const [bg, setBg, hydrated] = usePersistentChoice<PlaybookBg>("xrill-playbook-bg", IDS, "stars");
  const [dye, setDye] = usePersistentChoice<ScrollColorId>("xrill-playbook-scroll", SCROLL_COLOR_IDS, "sepia");

  return (
    <>
      {hydrated && bg !== "stars" && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20">
          {bg === "jellyfish" && <JellyfishTexture className="opacity-80" />}
          {bg === "fog_city" && <FogCityTexture className="opacity-85" />}
          {bg === "sunset_palms" && <SunsetPalmsTexture className="opacity-80" />}
          {bg === "hometown" && <HometownTexture className="opacity-90" />}
          {bg === "scroll" && <ScrollTexture colorId={dye} />}
          {/* keep text legible over the brighter backdrops */}
          {bg !== "scroll" && <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/55" />}
        </div>
      )}
      <BackdropChooser
        label="Backdrop"
        options={OPTIONS}
        value={bg}
        onChange={setBg}
        scrollValue={dye}
        onScrollChange={setDye}
        scrollId="scroll"
      />
    </>
  );
}
