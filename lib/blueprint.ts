// The member's Blueprint: one JSON document per user (public.blueprints)
// plus manual snapshots (public.blueprint_savepoints). normalizeBlueprint
// is the single gate both the client editor and the server actions run
// data through, so nothing malformed or oversized ever reaches the table.
export type GoalArea = "trading" | "school" | "health" | "social" | "life";
export const GOAL_AREAS: { key: GoalArea; label: string; icon: string }[] = [
  { key: "trading", label: "Trading", icon: "📈" },
  { key: "school", label: "School", icon: "🎓" },
  { key: "health", label: "Health", icon: "💪" },
  { key: "social", label: "Social", icon: "🤝" },
  { key: "life", label: "Life", icon: "🌅" },
];

export interface BlueprintGoal { id: string; title: string; area: GoalArea; due: string; done: boolean }
export interface RoadmapStep { id: string; title: string; when: string; done: boolean }
export interface ChecklistItem { id: string; text: string }
export interface TradeChecklist { id: string; name: string; items: ChecklistItem[] }
export interface Blueprint {
  northStar: string;
  targetStage: number; // 0 = not set, 1..12 = relic stage being chased
  targetDate: string;
  goals: BlueprintGoal[];
  roadmap: RoadmapStep[];
  checklists: TradeChecklist[];
  rules: string[];
}

export const LIMITS = { goals: 30, roadmap: 30, checklists: 6, items: 15, rules: 15, text: 200, northStar: 600, savepoints: 20, label: 60 };

export const uid = () => Math.random().toString(36).slice(2, 10);

export const DEFAULT_BLUEPRINT: Blueprint = {
  northStar: "",
  targetStage: 0,
  targetDate: "",
  goals: [],
  roadmap: [],
  checklists: [
    {
      id: "pre-trade",
      name: "Pre-trade checklist",
      items: [
        { id: "a", text: "Daily check-in done — I'm regulated, not revenge trading" },
        { id: "b", text: "Setup matches a Playbook strategy" },
        { id: "c", text: "Entry, stop and target written before I click" },
        { id: "d", text: "Risk sized inside my tier" },
      ],
    },
  ],
  rules: [],
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const id = (v: unknown) => (typeof v === "string" && /^[a-z0-9-]{1,24}$/i.test(v) ? v : uid());
const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
const arr = (v: unknown) => (Array.isArray(v) ? v : []);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

export function normalizeBlueprint(input: unknown): Blueprint {
  const o = obj(input);
  const stage = Number(o.targetStage);
  return {
    northStar: str(o.northStar, LIMITS.northStar),
    targetStage: Number.isInteger(stage) && stage >= 0 && stage <= 12 ? stage : 0,
    targetDate: date(o.targetDate),
    goals: arr(o.goals).slice(0, LIMITS.goals).map((g) => {
      const x = obj(g);
      const area = GOAL_AREAS.some((a) => a.key === x.area) ? (x.area as GoalArea) : "life";
      return { id: id(x.id), title: str(x.title, LIMITS.text), area, due: date(x.due), done: x.done === true };
    }),
    roadmap: arr(o.roadmap).slice(0, LIMITS.roadmap).map((s) => {
      const x = obj(s);
      return { id: id(x.id), title: str(x.title, LIMITS.text), when: str(x.when, 40), done: x.done === true };
    }),
    checklists: arr(o.checklists).slice(0, LIMITS.checklists).map((c) => {
      const x = obj(c);
      return {
        id: id(x.id),
        name: str(x.name, 60) || "Checklist",
        items: arr(x.items).slice(0, LIMITS.items).map((it) => {
          const y = obj(it);
          return { id: id(y.id), text: str(y.text, LIMITS.text) };
        }),
      };
    }),
    rules: arr(o.rules).slice(0, LIMITS.rules).map((r) => str(r, LIMITS.text)),
  };
}
