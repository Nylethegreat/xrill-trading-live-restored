"use client";

// "Open Book" look for /glossary: a spiral-bound book spread with a ribbon
// bookmark. Left page = title, search and chapter tabs (sticky on wide
// screens); right page = the matching terms written out as dictionary
// entries. Same search/filter state as the HUD look -- only presentation.

export type GlossaryLook = "hud" | "book";
export const GLOSSARY_LOOKS: readonly GlossaryLook[] = ["hud", "book"];

const LOOK_OPTIONS: { id: GlossaryLook; label: string; swatch: string }[] = [
  { id: "hud", label: "HUD", swatch: "radial-gradient(circle,#22c55e,#0f1220 70%)" },
  { id: "book", label: "Open Book", swatch: "linear-gradient(90deg,#fdfcf7 45%,#2f55b5 45% 55%,#fdfcf7 55%)" },
];

export function GlossaryLookChooser({ value, onChange }: { value: GlossaryLook; onChange: (v: GlossaryLook) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Look</span>
      {LOOK_OPTIONS.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition ${
              active ? "border-white/60 bg-white/15 text-white" : "border-white/15 text-white/60 hover:border-white/35"
            }`}
          >
            <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: o.swatch }} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

type BookTerm = { term: string; short?: string; definition: string };
type BookEntry = { term: BookTerm; category: string; id: string };

const INK = "#2f4f9e"; // book line color (cover, rings, page edges)
const COVER = "#2f55b5";
const PAPER = "#fdfcf7";

// one spiral ring arc, repeated down the spine
const RING =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='76'%3E%3Cpath d='M4 30 Q32 12 60 30' fill='none' stroke='%232f4f9e' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E\")";

export default function GlossaryBook({
  query,
  onQuery,
  pills,
  active,
  onActive,
  entries,
  status,
  otherSide,
  onOtherSide,
  accentFor,
}: {
  query: string;
  onQuery: (q: string) => void;
  pills: { name: string; label: string; count: number }[];
  active: string;
  onActive: (name: string) => void;
  entries: BookEntry[];
  status: string;
  otherSide: string;
  onOtherSide: () => void;
  /** "r g b" accent for a category, shared with the HUD look */
  accentFor: (category: string) => string;
}) {
  return (
    <div className="relative mt-6">
      {/* back cover + page edges peeking out behind the spread */}
      <div aria-hidden="true" className="absolute -inset-x-3 -bottom-4 top-3 rounded-2xl" style={{ background: COVER }} />
      <div aria-hidden="true" className="absolute -bottom-2 left-1 right-1 top-2 rounded-xl border-2" style={{ background: PAPER, borderColor: INK }} />
      <div aria-hidden="true" className="absolute -bottom-1 left-0.5 right-0.5 top-1 rounded-xl border-2" style={{ background: PAPER, borderColor: INK }} />

      <div className="relative grid overflow-hidden rounded-xl border-2 lg:grid-cols-2" style={{ background: PAPER, borderColor: INK }}>
        {/* spiral binding down the middle (wide screens only) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 left-1/2 top-6 hidden w-16 -translate-x-1/2 lg:block"
          style={{ backgroundImage: RING, backgroundRepeat: "repeat-y" }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-0.5 -translate-x-1/2 lg:block" style={{ background: INK }} />

        {/* LEFT PAGE */}
        <section
          className="relative px-6 pb-10 pt-24 sm:px-10 lg:pr-14"
          style={{ background: `linear-gradient(to left, rgba(15,23,42,0.07), transparent 48px), ${PAPER}` }}
        >
          <span
            aria-hidden="true"
            className="absolute left-10 top-0 h-36 w-10 bg-[#f5d28f] shadow-sm"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }}
          />
          <div className="lg:sticky lg:top-24">
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">Glossary</h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
              Plain-language definitions for the terms XRILL and trading in general throw around.
            </p>

            <label className="mt-8 block">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Look up a word</span>
              <input
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="R:R, trim, liquidity..."
                className="mt-1 w-full border-0 border-b-2 border-slate-300 bg-transparent px-0 py-2 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2f4f9e]"
              />
            </label>

            <nav aria-label="Chapters" className="mt-8">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Chapters</p>
              <ol className="mt-2 flex flex-col">
                {pills.map((p, i) => {
                  const isActive = active === p.name;
                  return (
                    <li key={p.name}>
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => onActive(p.name)}
                        className={`flex w-full items-baseline gap-2 py-1.5 text-left text-sm transition-colors ${
                          isActive ? "font-bold text-slate-900" : "text-slate-600 hover:text-slate-900"
                        } ${p.count === 0 && !isActive ? "opacity-45" : ""}`}
                      >
                        <span className="w-6 font-mono text-[11px] text-slate-400">{i === 0 ? "—" : String(i).padStart(2, "0")}</span>
                        <span className={isActive ? "underline decoration-2 underline-offset-4" : ""}>{p.label}</span>
                        <span aria-hidden="true" className="flex-1 translate-y-[-3px] border-b border-dotted border-slate-300" />
                        <span className="font-mono text-[11px] text-slate-500">{p.count}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <button
              type="button"
              onClick={onOtherSide}
              className="mt-8 block w-full rotate-[-0.6deg] border-l-4 bg-[#fff6d6] p-3 text-left shadow-sm transition-transform hover:rotate-0"
              style={{ borderColor: `rgb(${accentFor(otherSide)})` }}
            >
              <span className="text-sm font-semibold text-slate-900">Won or lost on a trade? Ask where the money came from.</span>
              <span className="mt-0.5 block text-xs text-slate-600">
                Every dollar you make is paid by someone on the other side. Tap to meet them →
              </span>
            </button>
          </div>
        </section>

        {/* RIGHT PAGE */}
        <section className="relative border-t-2 px-6 pb-12 pt-10 sm:px-10 lg:border-t-0 lg:pl-16" style={{ borderColor: INK, background: `linear-gradient(to right, rgba(15,23,42,0.07), transparent 48px), ${PAPER}` }}>
          <p className="text-xs text-slate-500">{status}</p>
          {entries.length === 0 ? (
            <p className="mt-10 text-sm italic text-slate-500">Nothing on this page matches. Try another word or chapter.</p>
          ) : (
            <dl className="mt-4 flex flex-col divide-y divide-dotted divide-slate-300">
              {entries.map((e) => (
                <div key={e.id} className="py-4">
                  <dt className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-base font-bold text-slate-900">{e.term.term}:</span>
                    {e.term.short && <span className="text-sm italic text-slate-500">{e.term.short}</span>}
                    {active === "All" && (
                      <span
                        className="ml-auto text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: `rgb(${accentFor(e.category)})`, filter: "brightness(0.65)" }}
                      >
                        {e.category}
                      </span>
                    )}
                  </dt>
                  <dd className="mt-1 text-[15px] leading-relaxed text-slate-700">{e.term.definition}</dd>
                </div>
              ))}
            </dl>
          )}
          <p aria-hidden="true" className="mt-8 text-center font-mono text-[11px] text-slate-400">— XRILL —</p>
        </section>
      </div>
    </div>
  );
}
