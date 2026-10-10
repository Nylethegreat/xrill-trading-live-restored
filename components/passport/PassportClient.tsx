"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type PassportEntry = {
  id: string;
  kind: "event" | "goal" | "person";
  title: string;
  entry_date: string | null;
  details: Record<string, string | number>;
  done: boolean;
  created_at: string;
};

type Tab = "event" | "goal" | "person";

const IDEAS: [string, string][] = [
  ["Go to a home football game", "Campus"],
  ["Table-hop at a club fair", "Campus"],
  ["Join a pre-med club meeting", "Pre-med"],
  ["Volunteer or shadow at a hospital", "Pre-med"],
  ["Sunset at the Biscayne Bay campus", "Campus"],
  ["Visit the Wolfsonian on Miami Beach", "Miami"],
  ["Night in Wynwood with friends", "Miami"],
  ["Mandarin language exchange", "Growth"],
  ["Talk to 3 new people in one week", "Social"],
  ["Host a game night or Artale session", "Social"],
  ["Film a One Question at FIU episode", "Content"],
  ["Study at Green Library with a new group", "Campus"],
  ["Sign up for an intramural sport", "Social"],
  ["Key Biscayne bike ride", "Miami"],
  ["Ask a professor about research", "Pre-med"],
];

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d: string | null) =>
  d ? new Date(d + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";

const input =
  "w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-accent";
const label = "mb-1 block font-mono text-[11px] uppercase tracking-widest text-white/50";

export default function PassportClient({ userId, initial }: { userId: string; initial: PassportEntry[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [entries, setEntries] = useState<PassportEntry[]>(initial);
  const [tab, setTab] = useState<Tab>("event");
  const [goalFilter, setGoalFilter] = useState<"open" | "done" | "all">("open");
  const [error, setError] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);

  const events = entries.filter((e) => e.kind === "event").sort((a, b) => (b.entry_date ?? "").localeCompare(a.entry_date ?? ""));
  const goals = entries.filter((e) => e.kind === "goal");
  const people = entries.filter((e) => e.kind === "person").sort((a, b) => (b.entry_date ?? "").localeCompare(a.entry_date ?? ""));
  const doneCount = goals.filter((g) => g.done).length;
  const weekAgo = Date.now() - 7 * 86400000;
  const newThisWeek = people.filter((p) => p.entry_date && new Date(p.entry_date + "T12:00:00").getTime() >= weekAgo).length;

  async function add(kind: Tab, title: string, entry_date: string | null, details: Record<string, string | number>) {
    setError(null);
    const { data, error } = await supabase
      .from("passport_entries")
      .insert({ user_id: userId, kind, title, entry_date: entry_date || null, details })
      .select("id, kind, title, entry_date, details, done, created_at")
      .single();
    if (error || !data) return setError("Couldn't save that. Check your connection and try again.");
    setEntries((prev) => [data as PassportEntry, ...prev]);
  }

  async function toggle(e: PassportEntry) {
    const { error } = await supabase.from("passport_entries").update({ done: !e.done }).eq("id", e.id);
    if (error) return setError("Couldn't update that entry.");
    setEntries((prev) => prev.map((x) => (x.id === e.id ? { ...x, done: !x.done } : x)));
  }

  async function remove(id: string) {
    if (armed !== id) {
      setArmed(id);
      setTimeout(() => setArmed((a) => (a === id ? null : a)), 3000);
      return;
    }
    const { error } = await supabase.from("passport_entries").delete().eq("id", id);
    if (error) return setError("Couldn't remove that entry.");
    setEntries((prev) => prev.filter((x) => x.id !== id));
    setArmed(null);
  }

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "").trim();
    if (tab === "event") {
      add("event", s("title"), s("date"), { vibe: Number(s("vibe")) || 4, place: s("place"), who: s("who"), note: s("note") });
    } else if (tab === "goal") {
      add("goal", s("title"), s("date"), { category: s("category") });
    } else {
      add("person", s("title"), s("date"), { where: s("where"), into: s("into"), next: s("next"), handle: s("handle"), status: s("status") });
    }
    ev.currentTarget.reset();
  }

  const shownGoals = goals
    .filter((g) => goalFilter === "all" || (goalFilter === "done" ? g.done : !g.done))
    .sort((a, b) => (a.entry_date ?? "9").localeCompare(b.entry_date ?? "9"));
  const ideaList = IDEAS.filter(([n]) => !goals.some((g) => g.title === n));

  const Remove = ({ id }: { id: string }) => (
    <button type="button" onClick={() => remove(id)} className="text-xs text-white/40 hover:text-red-400">
      {armed === id ? "Tap again to remove" : "Remove"}
    </button>
  );

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Events logged", String(events.length), null],
          ["Experiences done", `${doneCount}/${goals.length}`, goals.length ? doneCount / goals.length : 0],
          ["People met", String(people.length), null],
          ["New people this week", `${newThisWeek}/3`, Math.min(1, newThisWeek / 3)],
        ].map(([l, v, pct]) => (
          <div key={l as string} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-2xl font-bold tabular-nums text-white">{v}</div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-white/50">{l}</div>
            {pct !== null && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-accent" style={{ width: `${(pct as number) * 100}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <p className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <section className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="What are you adding">
          {([
            ["event", "I went to something"],
            ["goal", "I want to do something"],
            ["person", "I met someone"],
          ] as [Tab, string][]).map(([k, t]) => (
            <button
              key={k}
              type="button"
              aria-pressed={tab === k}
              onClick={() => setTab(k)}
              className={`rounded-full border px-4 py-1.5 text-sm ${tab === k ? "border-accent bg-accent/15 text-accent" : "border-white/15 text-white/60 hover:text-white"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <form key={tab} onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-6">
          {tab === "event" && (
            <>
              <div className="sm:col-span-3"><label className={label} htmlFor="pe-title">Event</label><input id="pe-title" name="title" required className={input} placeholder="Club fair at GC" /></div>
              <div className="sm:col-span-2"><label className={label} htmlFor="pe-date">Date</label><input id="pe-date" name="date" type="date" defaultValue={today()} className={input} /></div>
              <div><label className={label} htmlFor="pe-vibe">Vibe</label><select id="pe-vibe" name="vibe" defaultValue="4" className={input}><option value="5">5 elite</option><option value="4">4 great</option><option value="3">3 solid</option><option value="2">2 meh</option><option value="1">1 skip</option></select></div>
              <div className="sm:col-span-3"><label className={label} htmlFor="pe-place">Where</label><input id="pe-place" name="place" className={input} placeholder="Graham Center, MMC" /></div>
              <div className="sm:col-span-3"><label className={label} htmlFor="pe-who">Who you met / went with</label><input id="pe-who" name="who" className={input} placeholder="Sam, two people from pre-med club" /></div>
              <div className="sm:col-span-6"><label className={label} htmlFor="pe-note">Best moment</label><textarea id="pe-note" name="note" rows={2} className={input} placeholder="What made it worth it?" /></div>
              <button className="rounded bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90 sm:col-span-2">Stamp it</button>
            </>
          )}
          {tab === "goal" && (
            <>
              <div className="sm:col-span-3"><label className={label} htmlFor="pg-title">Experience</label><input id="pg-title" name="title" required className={input} placeholder="Sunset at the Biscayne Bay campus" /></div>
              <div className="sm:col-span-2"><label className={label} htmlFor="pg-cat">Type</label><select id="pg-cat" name="category" className={input}>{["Campus", "Miami", "Social", "Growth", "Pre-med", "Content"].map((c) => <option key={c}>{c}</option>)}</select></div>
              <div><label className={label} htmlFor="pg-date">Target date</label><input id="pg-date" name="date" type="date" className={input} /></div>
              <button className="rounded bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90 sm:col-span-2">Add to the list</button>
              <div className="sm:col-span-6">
                <span className={label}>Quick ideas, tap to add</span>
                <div className="flex flex-wrap gap-2">
                  {ideaList.length ? ideaList.map(([n, c]) => (
                    <button key={n} type="button" onClick={() => add("goal", n, null, { category: c })} className="rounded-full border border-dashed border-accent/60 px-3 py-1 text-xs text-white/80 hover:bg-accent/10">+ {n}</button>
                  )) : <span className="text-xs text-white/40">You added them all. Write your own.</span>}
                </div>
              </div>
            </>
          )}
          {tab === "person" && (
            <>
              <div className="sm:col-span-2"><label className={label} htmlFor="pp-title">Name</label><input id="pp-title" name="title" required className={input} placeholder="First name" /></div>
              <div className="sm:col-span-2"><label className={label} htmlFor="pp-where">Where you met</label><input id="pp-where" name="where" className={input} placeholder="Orgo lab" /></div>
              <div className="sm:col-span-2"><label className={label} htmlFor="pp-date">When</label><input id="pp-date" name="date" type="date" defaultValue={today()} className={input} /></div>
              <div className="sm:col-span-3"><label className={label} htmlFor="pp-into">What they're into</label><input id="pp-into" name="into" className={input} placeholder="Climbing, Valorant, wants to do PA school" /></div>
              <div className="sm:col-span-3"><label className={label} htmlFor="pp-next">Follow-up idea</label><input id="pp-next" name="next" className={input} placeholder="Invite to the next club social" /></div>
              <div className="sm:col-span-3"><label className={label} htmlFor="pp-handle">How to reach them</label><input id="pp-handle" name="handle" className={input} placeholder="@ on IG" /></div>
              <div className="sm:col-span-3"><label className={label} htmlFor="pp-status">Status</label><select id="pp-status" name="status" className={input}>{["Just met", "Hung out", "Friend", "Close friend"].map((c) => <option key={c}>{c}</option>)}</select></div>
              <button className="rounded bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90 sm:col-span-2">Save person</button>
            </>
          )}
        </form>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Places I went</h2>
          <div className="space-y-3">
            {events.length === 0 && <p className="rounded-lg border border-dashed border-white/15 p-4 text-center text-sm text-white/50">Nothing stamped yet. Log the first thing you go to.</p>}
            {events.map((e) => (
              <article key={e.id} className="relative rounded-lg border border-white/10 bg-white/5 p-4">
                <span className="absolute right-3 top-3 -rotate-6 rounded border border-orange-400/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-orange-300">{fmt(e.entry_date)}</span>
                <h3 className="pr-20 font-semibold text-white">{e.title}</h3>
                <div className="mt-1 flex flex-wrap gap-3 font-mono text-xs text-white/50">
                  {e.details.place && <span>{e.details.place}</span>}
                  <span className="tracking-[2px] text-accent">{"●".repeat(Number(e.details.vibe) || 0)}{"○".repeat(5 - (Number(e.details.vibe) || 0))}</span>
                </div>
                {e.details.who && <p className="mt-2 text-sm text-white/80"><b>With:</b> {e.details.who}</p>}
                {e.details.note && <p className="mt-1 text-sm text-white/60">{e.details.note}</p>}
                <div className="mt-2"><Remove id={e.id} /></div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-white">Want to do</h2>
              <div className="flex gap-1">
                {(["open", "done", "all"] as const).map((f) => (
                  <button key={f} type="button" aria-pressed={goalFilter === f} onClick={() => setGoalFilter(f)} className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase ${goalFilter === f ? "border-white text-white" : "border-white/15 text-white/50"}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {shownGoals.length === 0 && <p className="rounded-lg border border-dashed border-white/15 p-4 text-center text-sm text-white/50">{goals.length ? "Nothing here in this view." : "No targets yet. Tap a quick idea to start."}</p>}
              {shownGoals.map((g) => (
                <div key={g.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                  <input type="checkbox" checked={g.done} onChange={() => toggle(g)} aria-label={`Mark ${g.title} done`} className="h-5 w-5 accent-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium ${g.done ? "text-white/40 line-through" : "text-white"}`}>{g.title}</div>
                    <div className="mt-0.5 flex gap-2 font-mono text-[11px] uppercase text-white/50">
                      {g.details.category && <span className="rounded-full bg-accent/15 px-2 text-accent">{g.details.category}</span>}
                      {g.entry_date && <span>by {fmt(g.entry_date)}</span>}
                    </div>
                  </div>
                  <Remove id={g.id} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">People I've met</h2>
            <div className="space-y-3">
              {people.length === 0 && <p className="rounded-lg border border-dashed border-white/15 p-4 text-center text-sm text-white/50">Met someone? Add what they're into so next time you know what to ask.</p>}
              {people.map((p) => (
                <article key={p.id} className="relative rounded-lg border border-white/10 bg-white/5 p-4">
                  <span className="absolute right-3 top-3 -rotate-6 rounded border border-emerald-400/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-300">{p.details.status}</span>
                  <h3 className="pr-24 font-semibold text-white">{p.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-3 font-mono text-xs text-white/50">
                    {p.details.where && <span>Met at {p.details.where}</span>}
                    {p.entry_date && <span>{fmt(p.entry_date)}</span>}
                    {p.details.handle && <span>{p.details.handle}</span>}
                  </div>
                  {p.details.into && <p className="mt-2 text-sm text-white/80"><b>Into:</b> {p.details.into}</p>}
                  {p.details.next && <p className="mt-1 text-sm text-white/60"><b>Next:</b> {p.details.next}</p>}
                  <div className="mt-2"><Remove id={p.id} /></div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
