// The twelve stage relics — one per stage of the Playbook's $250 → $1M
// compound roadmap (app/playbook/page.tsx STAGES). A relic unlocks when the
// real account balance reaches that stage's END cap, i.e. the stage is
// cleared. Each relic stands for one of the eight realms the Mindset Check
// scores (physical, mental, financial, spiritual, social, emotional,
// behavior, self); the last four are "ascended" versions and the final
// one covers all of them. All artwork is original (components/visuals/RelicIcon.tsx).
import type { Realm } from "./mindsetQuestions";

export type RelicId =
  | "scroll"
  | "key"
  | "elixir"
  | "tablet"
  | "tome"
  | "hologram"
  | "scarab"
  | "sundisk"
  | "energy"
  | "timecapsule"
  | "jewel"
  | "anubis";

export interface Relic {
  id: RelicId;
  stage: number;
  unlockAt: number;
  name: string;
  realm: Realm | "all";
  color: string;
  lore: string;
}

export const RELICS: Relic[] = [
  { id: "scroll", stage: 1, unlockAt: 500, name: "Scroll of Exits", realm: "behavior", color: "#14b8a6", lore: "The rules, written before the trade. Stop, trim, runner — sealed." },
  { id: "key", stage: 2, unlockAt: 1_000, name: "Iron Key of Discipline", realm: "self", color: "#e879f9", lore: "Opens nothing on its own. You still have to turn it every day." },
  { id: "elixir", stage: 3, unlockAt: 2_000, name: "Elixir of Clear Blood", realm: "physical", color: "#f97316", lore: "Water, food, sleep, sunlight. The body funds the mind." },
  { id: "tablet", stage: 4, unlockAt: 4_000, name: "Codex Tablet", realm: "mental", color: "#a855f7", lore: "Every lesson carved in stone so it can't be rewritten by a bad day." },
  { id: "tome", stage: 5, unlockAt: 8_000, name: "Tome of Kinship", realm: "social", color: "#38bdf8", lore: "The people who knew you before the account had a comma in it." },
  { id: "hologram", stage: 6, unlockAt: 16_000, name: "Memory Hologram", realm: "emotional", color: "#f43f5e", lore: "A recording of how it really felt — before the result rewrote it." },
  { id: "scarab", stage: 7, unlockAt: 32_000, name: "Golden Scarab", realm: "financial", color: "#22c55e", lore: "Renewal. Capital that rolls forward, swept and protected." },
  { id: "sundisk", stage: 8, unlockAt: 64_000, name: "Winged Sun of Life", realm: "spiritual", color: "#facc15", lore: "The reason behind the reason. Gratitude, purpose, light." },
  { id: "energy", stage: 9, unlockAt: 128_000, name: "Energy Capsule", realm: "physical", color: "#fb923c", lore: "Stored power for long campaigns. Rested traders last." },
  { id: "timecapsule", stage: 10, unlockAt: 256_000, name: "Time Capsule", realm: "mental", color: "#c084fc", lore: "Patience made solid. Multi-week swings, sealed and left alone." },
  { id: "jewel", stage: 11, unlockAt: 532_000, name: "Prism Jewel", realm: "self", color: "#f0abfc", lore: "Every realm refracted into one clear self." },
  { id: "anubis", stage: 12, unlockAt: 1_000_000, name: "Golden Anubis", realm: "all", color: "#fbbf24", lore: "Guardian of the scales. Seven figures, weighed and earned." },
];
