"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import RelicIcon from "@/components/visuals/RelicIcon";
import { RELICS } from "@/lib/data/relics";
import {
  GOAL_AREAS,
  LIMITS,
  normalizeBlueprint,
  uid,
  type Blueprint,
  type GoalArea,
} from "@/lib/blueprint";
import { createSavepoint, deleteSavepoint, loadSavepoint, saveBlueprint } from "@/app/blueprint/actions";

export interface SavepointRow {
  id: number;
  label: string;
  created_at: string;
}

const card = "rounded-xl border border-white/10 bg-black/55 p-4 backdrop-blur-sm";
const input =
  "w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:outline-none";
const ghostBtn = "rounded-md px-2 py-1 text-xs text-white/50 hover:bg-white/5 hover:text-white";

function H({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
        <span className="mr-1.5">{icon}</span>
        {title}
      </h2>
      {sub && <p className="mt-0.5 text-xs text-white/40">{sub}</p>}
    </div>
  );
}

// The glowing waypoint used for savepoints (same mark as the Quest Map backdrop).
function Waypoint({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 40 56" aria-hidden="true" className="flex-none drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]">
      <path d="M20 2c11 0 13 9 11 17l-6 22h-10l-6-22c-2-8 0-17 11-17z" fill="#93c5fd" />
      <circle cx="20" cy="50" r="5.5" fill="#93c5fd" />
    </svg>
  );
}

export default function BlueprintEditor({
  initial,
  savepoints,
  balance,
}: {
  initial: Blueprint;
  savepoints: SavepointRow[];
  balance: number;
}) {
  const [bp, setBp] = useState<Blueprint>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [label, setLabel] = useState("");
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(bp) !== baseline;

  // warn before leaving with unsaved edits
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const set = (patch: Partial<Blueprint>) => setBp((b) => normalizeBlueprint({ ...b, ...patch }));
  const flash = (tone: "ok" | "err", text: string) => {
    setMsg({ tone, text });
    window.setTimeout(() => setMsg(null), 4000);
  };

  function save() {
    start(async () => {
      const r = await saveBlueprint(bp);
      if (r.success) {
        setBaseline(JSON.stringify(bp));
        flash("ok", "Blueprint saved.");
      } else flash("err", r.error ?? "Could not save.");
    });
  }
  function savepoint() {
    start(async () => {
      const r = await createSavepoint(label, bp);
      if (r.success) {
        setBaseline(JSON.stringify(bp));
        setLabel("");
        flash("ok", "Savepoint created. You can load back to this moment any time.");
      } else flash("err", r.error ?? "Could not create savepoint.");
    });
  }
  function load(id: number, name: string) {
    if (dirty && !window.confirm(`Load "${name}"? Your unsaved edits will be replaced.`)) return;
    start(async () => {
      const r = await loadSavepoint(id);
      if (r.success && r.data) {
        setBp(r.data);
        setBaseline(JSON.stringify(r.data));
        flash("ok", `Loaded "${name}".`);
      } else flash("err", r.error ?? "Could not load savepoint.");
    });
  }
  function remove(id: number, name: string) {
    if (!window.confirm(`Delete savepoint "${name}"?`)) return;
    start(async () => {
      const r = await deleteSavepoint(id);
      if (!r.success) flash("err", r.error ?? "Could not delete.");
    });
  }

  const target = bp.targetStage > 0 ? RELICS[bp.targetStage - 1] : null;
  const pct = target ? Math.min(100, Math.round((balance / target.unlockAt) * 100)) : 0;
  const goalsDone = bp.goals.filter((g) => g.done).length;
  const stepsDone = bp.roadmap.filter((s) => s.done).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        {/* North star + target */}
        <section className={card}>
          <H icon="🧭" title="North Star" sub="Why you're doing this, in your own words. Read it before every session." />
          <textarea
            className={`${input} min-h-[90px]`}
            maxLength={LIMITS.northStar}
            placeholder="e.g. Grow $100 into a real account by graduation without breaking my rules — and stay the same person doing it."
            value={bp.northStar}
            onChange={(e) => set({ northStar: e.target.value })}
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px]">
            <label className="text-xs text-white/50">
              Stage I&apos;m chasing
              <select className={`${input} mt-1`} value={bp.targetStage} onChange={(e) => set({ targetStage: Number(e.target.value) })}>
                <option value={0}>Not set</option>
                {RELICS.map((r) => (
                  <option key={r.id} value={r.stage}>
                    Stage {r.stage} · {r.name} · ${r.unlockAt.toLocaleString()}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-white/50">
              By
              <input type="date" className={`${input} mt-1`} value={bp.targetDate} onChange={(e) => set({ targetDate: e.target.value })} />
            </label>
          </div>
          {target && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: `${target.color}55`, background: `${target.color}10` }}>
              <RelicIcon id={target.id} unlocked={balance >= target.unlockAt} size={40} glow={target.color} />
              <div className="flex-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/80">{target.name}</span>
                  <span className="font-mono text-white/50">
                    ${balance.toLocaleString()} / ${target.unlockAt.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: target.color }} />
                </div>
              </div>
              <Link href={`/playbook/relics#${target.id}`} className="text-xs text-white/50 underline hover:text-white">
                Codex
              </Link>
            </div>
          )}
        </section>

        {/* Goals */}
        <section className={card}>
          <H icon="🎯" title={`Goals · ${goalsDone}/${bp.goals.length} done`} sub="Trading and everything around it. Check them off as you go." />
          <GoalAdder onAdd={(title, area, due) => set({ goals: [...bp.goals, { id: uid(), title, area, due, done: false }] })} disabled={bp.goals.length >= LIMITS.goals} />
          <ul className="mt-3 space-y-1.5">
            {bp.goals.map((g) => {
              const a = GOAL_AREAS.find((x) => x.key === g.area);
              return (
                <li key={g.id} className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1.5">
                  <input
                    type="checkbox"
                    aria-label={`Mark "${g.title}" done`}
                    checked={g.done}
                    onChange={() => set({ goals: bp.goals.map((x) => (x.id === g.id ? { ...x, done: !x.done } : x)) })}
                    className="h-4 w-4 accent-[#22c55e]"
                  />
                  <span title={a?.label}>{a?.icon}</span>
                  <span className={`flex-1 text-sm ${g.done ? "text-white/35 line-through" : "text-white/85"}`}>{g.title}</span>
                  {g.due && <span className="font-mono text-[11px] text-white/40">{g.due}</span>}
                  <button type="button" className={ghostBtn} aria-label={`Remove "${g.title}"`} onClick={() => set({ goals: bp.goals.filter((x) => x.id !== g.id) })}>
                    ✕
                  </button>
                </li>
              );
            })}
            {bp.goals.length === 0 && <li className="text-xs text-white/35">No goals yet — add the first one above.</li>}
          </ul>
        </section>

        {/* Roadmap */}
        <section className={card}>
          <H icon="🗺️" title={`Roadmap · ${stepsDone}/${bp.roadmap.length}`} sub="The steps in order. Move them up and down until the path makes sense." />
          <TwoFieldAdder
            a="Step"
            b="When (e.g. Week 3, Dec)"
            onAdd={(title, when) => set({ roadmap: [...bp.roadmap, { id: uid(), title, when, done: false }] })}
            disabled={bp.roadmap.length >= LIMITS.roadmap}
          />
          <ol className="mt-3 space-y-0">
            {bp.roadmap.map((s, i) => (
              <li key={s.id} className="relative flex items-center gap-3 py-1.5 pl-1">
                <span
                  className={`z-10 flex h-7 w-7 flex-none items-center justify-center rounded-full border font-mono text-xs ${
                    s.done ? "border-accent bg-accent/25 text-white" : "border-white/25 bg-black text-white/60"
                  }`}
                >
                  {s.done ? "✓" : i + 1}
                </span>
                {i < bp.roadmap.length - 1 && <span className="absolute left-[17px] top-8 h-full w-px bg-white/15" aria-hidden="true" />}
                <button
                  type="button"
                  onClick={() => set({ roadmap: bp.roadmap.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)) })}
                  className={`flex-1 text-left text-sm ${s.done ? "text-white/40 line-through" : "text-white/85"}`}
                >
                  {s.title}
                </button>
                {s.when && <span className="font-mono text-[11px] text-white/40">{s.when}</span>}
                <button type="button" className={ghostBtn} aria-label="Move up" disabled={i === 0} onClick={() => set({ roadmap: move(bp.roadmap, i, -1) })}>
                  ↑
                </button>
                <button type="button" className={ghostBtn} aria-label="Move down" disabled={i === bp.roadmap.length - 1} onClick={() => set({ roadmap: move(bp.roadmap, i, 1) })}>
                  ↓
                </button>
                <button type="button" className={ghostBtn} aria-label={`Remove "${s.title}"`} onClick={() => set({ roadmap: bp.roadmap.filter((x) => x.id !== s.id) })}>
                  ✕
                </button>
              </li>
            ))}
            {bp.roadmap.length === 0 && <li className="text-xs text-white/35">No steps yet. Tip: start with the next stage on the Playbook roadmap.</li>}
          </ol>
        </section>

        {/* Trade checklists */}
        <section className={card}>
          <H icon="✅" title="Trade checklists" sub="Build your own. Run one before a session, then take it into the Trade Engine." />
          <div className="space-y-3">
            {bp.checklists.map((c) => (
              <ChecklistCard
                key={c.id}
                name={c.name}
                items={c.items}
                onRename={(name) => set({ checklists: bp.checklists.map((x) => (x.id === c.id ? { ...x, name } : x)) })}
                onItems={(items) => set({ checklists: bp.checklists.map((x) => (x.id === c.id ? { ...x, items } : x)) })}
                onDelete={() => set({ checklists: bp.checklists.filter((x) => x.id !== c.id) })}
              />
            ))}
          </div>
          {bp.checklists.length < LIMITS.checklists && (
            <button
              type="button"
              className="mt-3 rounded-md border border-dashed border-white/20 px-3 py-1.5 text-xs text-white/60 hover:border-accent/50 hover:text-white"
              onClick={() => set({ checklists: [...bp.checklists, { id: uid(), name: "New checklist", items: [] }] })}
            >
              + New checklist
            </button>
          )}
        </section>

        {/* Rules */}
        <section className={card}>
          <H icon="📜" title="My rules" sub="The non-negotiables. Short enough to remember mid-trade." />
          <OneFieldAdder placeholder="e.g. Two losses and I'm done for the day" onAdd={(t) => set({ rules: [...bp.rules, t] })} disabled={bp.rules.length >= LIMITS.rules} />
          <ol className="mt-3 list-decimal space-y-1 pl-6 text-sm text-white/85">
            {bp.rules.map((r, i) => (
              <li key={`${i}-${r}`}>
                <span className="flex items-center justify-between gap-2">
                  {r}
                  <button type="button" className={ghostBtn} aria-label="Remove rule" onClick={() => set({ rules: bp.rules.filter((_, k) => k !== i) })}>
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Savepoint rail */}
      <aside className="lg:sticky lg:top-[70px] lg:self-start">
        <div className="rounded-xl border border-blue-400/40 bg-[#07122a]/85 p-4 shadow-[0_0_30px_rgba(59,130,246,0.18)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Waypoint />
            <div>
              <div className="font-mono text-sm font-bold tracking-widest text-blue-100">SAVEPOINT</div>
              <div className="text-[11px] text-blue-200/60">{dirty ? "Unsaved changes" : "All changes saved"}</div>
            </div>
            <span className={`ml-auto h-2.5 w-2.5 rounded-full ${dirty ? "bg-caution shadow-[0_0_8px_#eab308]" : "bg-accent shadow-[0_0_8px_#22c55e]"}`} aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="mt-3 w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-black hover:bg-accent/90 disabled:opacity-40"
          >
            {pending ? "Saving…" : "Save blueprint"}
          </button>
          <div className="mt-3 border-t border-white/10 pt-3">
            <label className="text-[11px] text-blue-100/70" htmlFor="sp-label">
              Name this moment
            </label>
            <input id="sp-label" className={`${input} mt-1`} placeholder="e.g. Before Stage 2 push" maxLength={LIMITS.label} value={label} onChange={(e) => setLabel(e.target.value)} />
            <button
              type="button"
              onClick={savepoint}
              disabled={pending}
              className="mt-2 w-full rounded-md border border-blue-300/60 bg-blue-500/20 px-3 py-2 text-sm font-semibold text-blue-50 hover:bg-blue-500/30 disabled:opacity-40"
            >
              ✦ Create savepoint
            </button>
          </div>
          {msg && (
            <p role="status" className={`mt-3 text-xs ${msg.tone === "ok" ? "text-accent" : "text-red-300"}`}>
              {msg.text}
            </p>
          )}
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[10px] uppercase tracking-wide text-white/40">
              <span>Your savepoints</span>
              <span className="font-mono">
                {savepoints.length}/{LIMITS.savepoints}
              </span>
            </div>
            <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {savepoints.map((s) => (
                <li key={s.id} className="flex items-center gap-2 rounded-md bg-white/[0.04] px-2 py-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs text-white/85">{s.label}</div>
                    <div className="font-mono text-[10px] text-white/35">{new Date(s.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</div>
                  </div>
                  <button type="button" disabled={pending} onClick={() => load(s.id, s.label)} className="rounded px-2 py-1 text-[11px] text-blue-200 hover:bg-blue-500/20">
                    Load
                  </button>
                  <button type="button" disabled={pending} aria-label={`Delete ${s.label}`} onClick={() => remove(s.id, s.label)} className={ghostBtn}>
                    ✕
                  </button>
                </li>
              ))}
              {savepoints.length === 0 && <li className="text-xs text-white/35">No savepoints yet. Make one before a big change.</li>}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

function move<T>(list: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function GoalAdder({ onAdd, disabled }: { onAdd: (t: string, a: GoalArea, due: string) => void; disabled: boolean }) {
  const [t, setT] = useState("");
  const [a, setA] = useState<GoalArea>("trading");
  const [d, setD] = useState("");
  return (
    <form
      className="grid gap-2 sm:grid-cols-[1fr_130px_150px_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        if (!t.trim()) return;
        onAdd(t.trim(), a, d);
        setT("");
        setD("");
      }}
    >
      <input className={input} aria-label="Goal" placeholder="New goal" value={t} maxLength={LIMITS.text} onChange={(e) => setT(e.target.value)} disabled={disabled} />
      <select className={input} aria-label="Area" value={a} onChange={(e) => setA(e.target.value as GoalArea)}>
        {GOAL_AREAS.map((x) => (
          <option key={x.key} value={x.key}>
            {x.icon} {x.label}
          </option>
        ))}
      </select>
      <input type="date" aria-label="Due date" className={input} value={d} onChange={(e) => setD(e.target.value)} />
      <button type="submit" disabled={disabled} className="rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-40">
        Add
      </button>
    </form>
  );
}

function TwoFieldAdder({ a, b, onAdd, disabled }: { a: string; b: string; onAdd: (x: string, y: string) => void; disabled: boolean }) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  return (
    <form
      className="grid gap-2 sm:grid-cols-[1fr_200px_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        if (!x.trim()) return;
        onAdd(x.trim(), y.trim());
        setX("");
        setY("");
      }}
    >
      <input className={input} aria-label={a} placeholder={a} value={x} maxLength={LIMITS.text} onChange={(e) => setX(e.target.value)} disabled={disabled} />
      <input className={input} aria-label={b} placeholder={b} value={y} maxLength={40} onChange={(e) => setY(e.target.value)} />
      <button type="submit" disabled={disabled} className="rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-40">
        Add
      </button>
    </form>
  );
}

function OneFieldAdder({ placeholder, onAdd, disabled }: { placeholder: string; onAdd: (x: string) => void; disabled: boolean }) {
  const [x, setX] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!x.trim()) return;
        onAdd(x.trim());
        setX("");
      }}
    >
      <input className={input} aria-label={placeholder} placeholder={placeholder} value={x} maxLength={LIMITS.text} onChange={(e) => setX(e.target.value)} disabled={disabled} />
      <button type="submit" disabled={disabled} className="rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-40">
        Add
      </button>
    </form>
  );
}

function ChecklistCard({
  name,
  items,
  onRename,
  onItems,
  onDelete,
}: {
  name: string;
  items: { id: string; text: string }[];
  onRename: (n: string) => void;
  onItems: (i: { id: string; text: string }[]) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const done = useMemo(() => items.filter((i) => checked[i.id]).length, [items, checked]);
  const allClear = items.length > 0 && done === items.length;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2">
        {editing ? (
          <input className={`${input} py-1`} aria-label="Checklist name" value={name} maxLength={60} onChange={(e) => onRename(e.target.value)} />
        ) : (
          <h3 className="flex-1 text-sm font-semibold text-white">{name}</h3>
        )}
        <span className="font-mono text-[11px] text-white/40">
          {done}/{items.length}
        </span>
        <button type="button" className={ghostBtn} onClick={() => setEditing((v) => !v)}>
          {editing ? "Done" : "Edit"}
        </button>
        {editing && (
          <button type="button" className={`${ghostBtn} text-red-300/70`} onClick={() => window.confirm(`Delete "${name}"?`) && onDelete()}>
            Delete
          </button>
        )}
      </div>
      <ul className="mt-2 space-y-1">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-2">
            {editing ? (
              <>
                <input
                  className={`${input} py-1`}
                  aria-label="Checklist item"
                  value={it.text}
                  maxLength={LIMITS.text}
                  onChange={(e) => onItems(items.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x)))}
                />
                <button type="button" className={ghostBtn} aria-label="Remove item" onClick={() => onItems(items.filter((x) => x.id !== it.id))}>
                  ✕
                </button>
              </>
            ) : (
              <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm text-white/80">
                <input type="checkbox" className="h-4 w-4 accent-[#22c55e]" checked={!!checked[it.id]} onChange={() => setChecked((c) => ({ ...c, [it.id]: !c[it.id] }))} />
                <span className={checked[it.id] ? "text-white/40 line-through" : ""}>{it.text}</span>
              </label>
            )}
          </li>
        ))}
      </ul>
      {editing && items.length < LIMITS.items && (
        <button type="button" className="mt-2 text-xs text-accent hover:underline" onClick={() => onItems([...items, { id: uid(), text: "" }])}>
          + Add item
        </button>
      )}
      {!editing && items.length > 0 && (
        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-xs">
          <button type="button" className="text-white/40 hover:text-white" onClick={() => setChecked({})}>
            Reset
          </button>
          {allClear ? (
            <Link href="/session" className="rounded-md bg-accent px-3 py-1 font-semibold text-black hover:bg-accent/90">
              All clear → Open the Trade Engine
            </Link>
          ) : (
            <span className="text-white/40">Check every box to unlock the engine link</span>
          )}
        </div>
      )}
    </div>
  );
}
