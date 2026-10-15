"use client";

import { usePersistentChoice } from "@/lib/usePersistentChoice";
import { SCROLL_COLOR_IDS, type ScrollColorId } from "@/lib/data/scrollColors";
import BackdropChooser, { type BackdropOption } from "@/components/visuals/BackdropChooser";
import JellyfishTexture from "@/components/visuals/textures/JellyfishTexture";
import FogCityTexture from "@/components/visuals/textures/FogCityTexture";
import ScrollTexture from "@/components/visuals/textures/ScrollTexture";
import SunsetPalmsTexture from "@/components/visuals/textures/SunsetPalmsTexture";
import HometownTexture from "@/components/visuals/textures/HometownTexture";
import NeonSmokeTexture from "@/components/visuals/textures/NeonSmokeTexture";
import PenthouseTexture from "@/components/visuals/textures/PenthouseTexture";
import BambooRainTexture from "@/components/visuals/textures/BambooRainTexture";
import QuestMapTexture from "@/components/visuals/textures/QuestMapTexture";
import CoralReefTexture from "@/components/visuals/textures/CoralReefTexture";
import CampusPalmsTexture from "@/components/visuals/textures/CampusPalmsTexture";

// Per-visitor Playbook backdrop (remembered in this browser): the default
// star field, a moving jellyfish bloom, Fog City, Sunset Palms, Hometown,
// the dyed scroll, or the four studio sets: Neon Smoke, Penthouse,
// Bamboo Rain and the Quest Map save point, plus Coral Reef and Campus
// Palms (a Miami university plaza).
type PlaybookBg = "stars" | "jellyfish" | "fog_city" | "sunset_palms" | "hometown" | "scroll" | "neon_smoke" | "penthouse" | "bamboo_rain" | "quest_map" | "coral_reef" | "campus";
const IDS: readonly PlaybookBg[] = ["stars", "jellyfish", "fog_city", "sunset_palms", "hometown", "scroll", "neon_smoke", "penthouse", "bamboo_rain", "quest_map", "coral_reef", "campus"];

const OPTIONS: BackdropOption<PlaybookBg>[] = [
  { id: "stars", label: "Star Field", swatch: "radial-gradient(circle,#fde68a,#1e1b4b 70%)" },
  { id: "jellyfish", label: "Jellyfish Bloom", swatch: "radial-gradient(circle,#c4b5fd,#3b2a8a)" },
  { id: "fog_city", label: "Fog City", swatch: "linear-gradient(180deg,#0a1213,#2b3e3e 60%,#ef4444)" },
  { id: "sunset_palms", label: "Sunset Palms", swatch: "radial-gradient(circle at 50% 60%,#fffbea,#f59e42 35%,#7a2f1c 75%)" },
  { id: "hometown", label: "Hometown", swatch: "linear-gradient(160deg,#2a1e4a,#4b2a5e 45%,#a35a4c)" },
  { id: "scroll", label: "Ancient Scroll", swatch: "linear-gradient(135deg,#b88a4f,#2e2112)" },
  { id: "neon_smoke", label: "Neon Smoke", swatch: "radial-gradient(circle at 40% 60%,#d946ef,#2563eb 45%,#0a0518 80%)" },
  { id: "penthouse", label: "Penthouse", swatch: "linear-gradient(160deg,#ff3b3b 0 12%,#07070b 12% 55%,#1b2a66)" },
  { id: "bamboo_rain", label: "Bamboo Rain", swatch: "radial-gradient(circle at 50% 55%,#7fb89a,#2f6b4c 35%,#04110a 80%)" },
  { id: "quest_map", label: "Quest Map", swatch: "radial-gradient(circle,#bfdbfe 0 12%,#2563eb 30%,#0f172a 70%)" },
  { id: "coral_reef", label: "Coral Reef", swatch: "radial-gradient(circle at 65% 15%,#fffbe6,#4fa3b0 30%,#0d3b5c 65%,#6d4fd8)" },
  { id: "campus", label: "Campus Palms", swatch: "linear-gradient(180deg,#1e4fa8,#9cc7ea 55%,#e7a83a 56% 70%,#2f6b3c 71%)" },
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
          {bg === "neon_smoke" && <NeonSmokeTexture className="opacity-90" />}
          {bg === "penthouse" && <PenthouseTexture className="opacity-90" />}
          {bg === "bamboo_rain" && <BambooRainTexture className="opacity-85" />}
          {bg === "quest_map" && <QuestMapTexture className="opacity-90" />}
          {bg === "coral_reef" && <CoralReefTexture className="opacity-90" />}
          {bg === "campus" && <CampusPalmsTexture className="opacity-85" />}
          {/* keep text legible over the brighter backdrops */}
          {bg !== "scroll" && (
            <div
              className={`absolute inset-0 bg-gradient-to-b ${
                bg === "campus" ? "from-black/45 via-black/55 to-black/70" : "from-black/20 via-black/35 to-black/55"
              }`}
            />
          )}
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
