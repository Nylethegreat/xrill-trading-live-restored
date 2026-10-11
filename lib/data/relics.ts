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

// Relic Codex (/playbook/relics): a dictionary-style entry per relic --
// what it is, what it means on the deeper (metaphysical) layer, and the
// one-line vow you carry out of the stage that earned it.
export interface RelicCodexEntry {
  kind: string;
  essence: string;
  vow: string;
}

export const RELIC_CODEX: Record<RelicId, RelicCodexEntry> = {
  scroll: {
    kind: "n. · artifact of intention",
    essence: "The first law of any path is that it is written before it is walked. The Scroll holds the exits you chose while calm, so the panicked self has nothing left to decide. Intention sealed in advance becomes protection in the moment.",
    vow: "I decide my exit before I enter.",
  },
  key: {
    kind: "n. · instrument of will",
    essence: "Discipline is not a door that opens once; it is a key that must be turned daily. Its iron is forged from small, repeated choices. The lock does not care how motivated you feel, only whether you turned it.",
    vow: "I turn the key even when no one is watching.",
  },
  elixir: {
    kind: "n. · vessel of the body",
    essence: "Spirit rides in a body, and a starved vessel cannot carry clear sight. Water, rest, food and light are the ingredients of this Elixir. Every decision you make is first metabolized through your blood.",
    vow: "I fuel the vessel before I ask it to fight.",
  },
  tablet: {
    kind: "n. · record of the mind",
    essence: "Memory is soft clay and a bad day presses hard. The Codex Tablet fires each lesson into stone, so the mind cannot quietly rewrite what it already paid to learn. Truth recorded is truth kept.",
    vow: "I carve the lesson so I never pay for it twice.",
  },
  tome: {
    kind: "n. · bond of the tribe",
    essence: "No one ascends alone. The Tome of Kinship holds the names of those who knew you before the numbers changed. They are your mirror when success distorts the view and your anchor when loss pulls you under.",
    vow: "I keep my people closer than my profits.",
  },
  hologram: {
    kind: "n. · echo of the heart",
    essence: "Outcomes are liars; they repaint the feeling after the fact. The Memory Hologram stores how the moment truly felt — the fear, the greed, the calm — so the heart can be studied instead of judged.",
    vow: "I honor what I felt, not just what I made.",
  },
  scarab: {
    kind: "n. · emblem of renewal",
    essence: "The scarab rolls the sun across the sky each dawn: endless return, endless rebirth. Capital that is swept, protected and rolled forward becomes a living cycle instead of a single bet. Wealth is a rhythm, not a jackpot.",
    vow: "I protect the seed so the harvest can return.",
  },
  sundisk: {
    kind: "n. · seal of purpose",
    essence: "Wings carry the sun so it can travel; purpose carries effort so it doesn't burn out. The Winged Sun is the reason behind the reason — gratitude and meaning that make every red day survivable.",
    vow: "I remember why I started, and I bless where I am.",
  },
  energy: {
    kind: "n. · reservoir of vitality",
    essence: "Long campaigns are won by stored power, not bursts. The Energy Capsule holds the rest you took, the walks you didn't skip, the sleep you defended. Patience is impossible without a full reservoir.",
    vow: "I rest so I can last.",
  },
  timecapsule: {
    kind: "n. · keeper of patience",
    essence: "Some seeds only open after you stop checking on them. The Time Capsule is patience made solid — the swing left alone, the plan given room to unfold. Time is the multiplier the impatient never collect.",
    vow: "I let the plan breathe.",
  },
  jewel: {
    kind: "n. · lens of the whole self",
    essence: "One beam enters the prism; every color leaves it. The Prism Jewel is integration — body, mind, money, spirit, people and heart refracted into one coherent self. Clarity is the light you get when nothing inside is at war.",
    vow: "I become one person in every room.",
  },
  anubis: {
    kind: "n. · guardian of the scales",
    essence: "At the end of the journey the heart is weighed against a feather. Golden Anubis guards that judgment: wealth earned with integrity stays light; wealth taken carelessly grows heavy. Seven figures, weighed and earned.",
    vow: "I stay worthy of what I've built.",
  },
};

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
  { id: "jewel", stage: 11, unlockAt: 512_000, name: "Prism Jewel", realm: "self", color: "#f0abfc", lore: "Every realm refracted into one clear self." },
  { id: "anubis", stage: 12, unlockAt: 1_000_000, name: "Golden Anubis", realm: "all", color: "#fbbf24", lore: "Guardian of the scales. Seven figures, weighed and earned." },
];
