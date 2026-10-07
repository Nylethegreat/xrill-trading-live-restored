// "We suggest you…" cards for the Journal Codex. Client-safe, no Supabase.
//
// Built from three pools: the trader's own hobbies (profiles.hobbies, set on
// /account), body resets (move, water, food, sleep), and people/perspective
// resets. On a red day the deck leans on stepping away; on a normal day it
// is lighter. Picks are seeded by the date so the deck stays the same all
// day and changes tomorrow. Not therapy and not medical advice: plain,
// low-effort things that get you off the charts for a while.

export interface Suggestion {
  id: string;
  icon: string;
  title: string;
  body: string;
  tag: "Yours" | "Body" | "People" | "Mind" | "Trading";
  color: string;
}

const BODY: Suggestion[] = [
  { id: "walk", icon: "🌤️", title: "Go outside for 15 minutes", body: "Phone in your pocket, not your hand. Sunlight and walking settle your nervous system faster than another look at the chart.", tag: "Body", color: "#22c55e" },
  { id: "water", icon: "💧", title: "Drink a full glass of water and eat something real", body: "Hunger and dehydration feel exactly like frustration. Fix the easy part first.", tag: "Body", color: "#38bdf8" },
  { id: "move", icon: "💪", title: "Move for 10 minutes", body: "Push-ups, a quick lift, a jog around the block. Burn off the adrenaline the loss left behind.", tag: "Body", color: "#f97316" },
  { id: "shower", icon: "🚿", title: "Take a shower and change clothes", body: "A physical reset tells your brain the session is over.", tag: "Body", color: "#06b6d4" },
  { id: "sleep", icon: "🌙", title: "Protect tonight's sleep", body: "No charts in bed. Tomorrow's trades are decided by tonight's sleep more than today's P&L.", tag: "Body", color: "#a78bfa" },
];

const PEOPLE: Suggestion[] = [
  { id: "text", icon: "📱", title: "Text one real person", body: "Not a trading chat. Someone who knows you outside of this. Tell them how today actually went.", tag: "People", color: "#f472b6" },
  { id: "help", icon: "🤝", title: "Do one small thing for someone else", body: "Help with dinner, call your grandparents, hold a door. Getting outside your own head works.", tag: "People", color: "#fb7185" },
];

const MIND: Suggestion[] = [
  { id: "close", icon: "🔒", title: "Close the charts until tomorrow", body: "The market opens again tomorrow. Your only job right now is to not make today worse.", tag: "Trading", color: "#ef4444" },
  { id: "lesson", icon: "✍️", title: "Write the lesson in one sentence, then let it go", body: "Use a prompt below. One sentence is enough. The loss pays for itself once it becomes a rule.", tag: "Trading", color: "#facc15" },
  { id: "memory", icon: "⚓", title: "Recall one good day in detail", body: "A clean trade, a great workout, a quiet morning. Today's loss doesn't erase the evidence of what you can do.", tag: "Mind", color: "#fbbf24" },
  { id: "breathe", icon: "🫁", title: "Breathe slowly for 2 minutes", body: "In for 4, hold for 4, out for 6. It's the fastest way to step off the gas.", tag: "Mind", color: "#2dd4bf" },
];

const HOBBY_COLORS = ["#a855f7", "#22d3ee", "#f59e0b", "#ec4899", "#84cc16", "#60a5fa", "#f97316", "#14b8a6"];

function hobbyCards(hobbies: string[]): Suggestion[] {
  return hobbies.map((h, i) => ({
    id: `hobby-${i}`,
    icon: "✨",
    title: `Take a ${h} break`,
    body: "Give it 30 minutes with the charts closed. You told XRILL this resets you, so use it.",
    tag: "Yours" as const,
    color: HOBBY_COLORS[i % HOBBY_COLORS.length],
  }));
}

// Small deterministic shuffle so the deck is stable for the whole day.
function seeded<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Returns an even number of cards (6, or 5 when there are no hobbies so the
// "Add your hobbies" tile fills the last slot) so the 2-column grid is full.
export function buildSuggestions({ hobbies, redDay, seed }: { hobbies: string[]; redDay: boolean; seed: string }): Suggestion[] {
  const limit = hobbies.length > 0 ? 6 : 5;
  const yours = seeded(hobbyCards(hobbies), seed).slice(0, 2);
  // Red days always include going outside, plus one more body reset.
  const body = redDay ? [BODY[0], ...seeded(BODY.slice(1), seed).slice(0, 1)] : seeded(BODY, seed).slice(0, 1);
  const people = seeded(PEOPLE, seed).slice(0, 1);
  const mind = redDay
    ? [MIND[0], ...seeded(MIND.slice(1), seed).slice(0, 1)] // red day always leads with "close the charts"
    : seeded(MIND.slice(1), seed).slice(0, 1);

  const deck = redDay ? [...mind.slice(0, 1), ...yours, ...body, ...people, ...mind.slice(1)] : [...yours, ...body, ...people, ...mind];
  // Top up from the remaining pools if the trader listed few hobbies.
  const rest = seeded([...BODY, ...PEOPLE, ...MIND.slice(1)], `${seed}-fill`).filter((c) => !deck.some((d) => d.id === c.id));
  return [...deck, ...rest].slice(0, limit);
}
