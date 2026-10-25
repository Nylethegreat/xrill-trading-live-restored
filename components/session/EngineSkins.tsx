"use client";

import Link from "next/link";
import type { ReactNode } from "react";

// Alternate looks for the "Choose your engine" picker. Same three actions as
// the neon default (Swing, Daytrade, Emergency log) -- only the presentation
// changes, so the wizards and risk limits behind them are untouched.

export type EngineSkin = "neon" | "pinboard" | "notepad";
export const ENGINE_SKINS: readonly EngineSkin[] = ["neon", "pinboard", "notepad"];

const SKIN_OPTIONS: { id: EngineSkin; label: string; swatch: string }[] = [
  { id: "neon", label: "Neon", swatch: "radial-gradient(circle,#22c55e,#0f1220 70%)" },
  { id: "pinboard", label: "Pinboard", swatch: "radial-gradient(#a8763f 1px,transparent 1.5px) 0 0/4px 4px,#c8955c" },
  { id: "notepad", label: "Notepad", swatch: "repeating-linear-gradient(#fffef6 0 3px,#93c5fd 3px 4px)" },
];

const HAND = { fontFamily: '"Marker Felt","Bradley Hand","Segoe Print","Comic Sans MS",cursive' } as const;

export function EngineSkinChooser({ value, onChange }: { value: EngineSkin; onChange: (v: EngineSkin) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Look</span>
      {SKIN_OPTIONS.map((o) => {
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

type SkinProps = {
  onSwing: () => void;
  onDaytrade: () => void;
  /** the open-positions warning text, or null when there's nothing to warn about */
  warning: ReactNode | null;
};

/* ---------------------------------- Pinboard ---------------------------------- */

const CORK =
  "radial-gradient(#9c6a35 1px, transparent 1.6px) 0 0/7px 7px, radial-gradient(#e3b77f 1px, transparent 1.6px) 3px 4px/9px 9px, radial-gradient(#b5824a 1.2px, transparent 2px) 5px 2px/13px 13px, #c8955c";

const INDEX_CARD =
  "linear-gradient(#fdfbf4 34px, #f87171 34px 35px, transparent 35px), repeating-linear-gradient(#fdfbf4 0 21px, #cfe0f5 21px 22px)";

function Pin({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full"
      style={{
        background: `radial-gradient(circle at 35% 30%, #ffffffcc 0 18%, ${color} 40%, #00000066 100%)`,
        boxShadow: "2px 4px 4px rgba(0,0,0,0.45)",
      }}
    />
  );
}

function Tape({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-5 w-16 bg-[#f5f0dc]/70 shadow-sm ${className}`}
      style={{ backdropFilter: "blur(1px)" }}
    />
  );
}

export function PinboardPicker({ onSwing, onDaytrade, warning }: SkinProps) {
  return (
    <div
      className="relative rounded-md border-[12px] border-[#c9a46b] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.55),inset_0_0_24px_rgba(60,30,5,0.45)] sm:p-9"
      style={{ background: CORK, borderStyle: "ridge" }}
    >
      {/* title label */}
      <div className="relative mx-auto w-fit -rotate-1 bg-[#fdfbf4] px-6 py-3 text-center shadow-[0_6px_10px_rgba(0,0,0,0.35)]">
        <Tape className="-top-2.5 left-1/2 -translate-x-1/2 rotate-2" />
        <h1 className="text-2xl font-bold tracking-wide text-slate-900 sm:text-3xl" style={HAND}>
          Choose your engine
        </h1>
        <p className="mt-1 text-xs text-slate-600">Same account, same risk limits — different pace.</p>
      </div>

      {warning && (
        <div className="relative mx-auto mt-7 max-w-md rotate-1 bg-[#fde68a] p-3 text-center text-xs text-amber-900 shadow-[0_6px_10px_rgba(0,0,0,0.35)]">
          <Pin color="#eab308" />
          {warning}
        </div>
      )}

      <div className="mt-9 grid gap-8 sm:grid-cols-2 sm:gap-6">
        <button
          type="button"
          onClick={onSwing}
          className="relative -rotate-2 p-5 pt-3 text-left shadow-[0_10px_16px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-1 hover:rotate-0 focus-visible:rotate-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          style={{ background: INDEX_CARD }}
        >
          <Pin color="#22c55e" />
          <p className="text-lg font-bold leading-[34px] text-green-700" style={HAND}>
            Swing Trade
          </p>
          <p className="mt-2 text-[13px] leading-[22px] text-slate-700">
            The full 8-gate pipeline — Daily Check-In through Authorization. Slower, more scrutiny, the standard engine.
          </p>
        </button>

        <button
          type="button"
          onClick={onDaytrade}
          className="relative rotate-[1.5deg] p-5 pt-3 text-left shadow-[0_10px_16px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-1 hover:rotate-0 focus-visible:rotate-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          style={{ background: INDEX_CARD }}
        >
          <Pin color="#22d3ee" />
          <p className="text-lg font-bold leading-[34px] text-cyan-700" style={HAND}>
            Daytrade Engine ⚡
          </p>
          <p className="mt-2 text-[13px] leading-[22px] text-slate-700">
            A 4-step fast pass for faster-moving daytrades — fewer questions, same hard risk limits. Higher risk by design.
          </p>
        </button>
      </div>

      <div className="relative mx-auto mt-10 max-w-sm -rotate-1 bg-[#fecaca] p-4 text-center shadow-[0_8px_12px_rgba(0,0,0,0.38)]">
        <Pin color="#ef4444" />
        <p className="text-sm text-red-950" style={HAND}>
          Already in a trade you didn&apos;t run through XRILL?
        </p>
        <Link
          href="/session?mode=after"
          className="mt-2 inline-block rotate-1 border-2 border-red-700 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-red-700 hover:bg-red-700 hover:text-white"
        >
          Emergency: log it after the fact
        </Link>
        <p className="mt-2 text-[11px] text-red-900/70">Not a shortcut. Gets the trade on record so it&apos;s tracked and journaled.</p>
      </div>
    </div>
  );
}

/* ---------------------------------- Notepad ---------------------------------- */

const RULED = 32; // px between ruled lines -- text line-heights below match it

const PAPER =
  `linear-gradient(90deg, transparent 54px, #f2a3a3 54px 56px, transparent 56px), ` +
  `repeating-linear-gradient(#fffef6 0 ${RULED - 1}px, #c7dbf2 ${RULED - 1}px ${RULED}px)`;

function UptrendDoodle() {
  return (
    <svg width="74" height="44" viewBox="0 0 74 44" aria-hidden="true" className="absolute right-5 top-14 opacity-70">
      <polyline
        points="3,40 16,28 23,33 37,18 44,23 58,9 66,13"
        fill="none"
        stroke="#15803d"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M58 4 L70 4 L69 16" fill="none" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PalmDoodle() {
  return (
    <svg width="70" height="78" viewBox="0 0 70 78" aria-hidden="true" className="absolute bottom-3 right-4 opacity-60">
      <path d="M34 76 C36 58 38 44 35 28" fill="none" stroke="#7c5a2e" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M35 28 C26 18 14 18 6 26 M35 28 C30 14 20 8 12 8 M35 28 C40 14 50 8 60 10 M35 28 C46 20 58 22 66 30 M35 28 C36 18 36 10 34 4"
        fill="none"
        stroke="#15803d"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M8 76 Q35 70 64 76" fill="none" stroke="#d6b77a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckLine({ label, desc, color, onClick }: { label: string; desc: string; color: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
    >
      <span className="flex items-center gap-3" style={{ lineHeight: `${RULED}px` }}>
        <span
          aria-hidden="true"
          className="relative inline-block h-5 w-5 shrink-0 border-2 border-slate-700"
          style={{ borderRadius: "3px 6px 2px 5px" }}
        >
          <span className={`absolute -top-2 left-0.5 text-xl font-bold opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${color}`}>
            ✓
          </span>
        </span>
        <span className={`text-xl font-bold underline decoration-2 underline-offset-4 ${color}`} style={HAND}>
          {label}
        </span>
      </span>
      <span className="block pl-8 text-[14px] text-slate-700" style={{ lineHeight: `${RULED}px` }}>
        {desc}
      </span>
    </button>
  );
}

export function NotepadPicker({ onSwing, onDaytrade, warning }: SkinProps) {
  return (
    <div
      className="relative overflow-hidden rounded-sm pb-24 pl-[70px] pr-6 pt-14 shadow-[0_18px_40px_rgba(0,0,0,0.55)] sm:-rotate-[0.6deg] sm:pr-12"
      style={{ background: PAPER }}
    >
      {/* binding holes */}
      <div aria-hidden="true" className="absolute left-0 right-0 top-0 flex h-9 items-center justify-around border-b border-dashed border-slate-300 bg-[#fffef6] px-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-3.5 w-3.5 rounded-full bg-[#0f1220] shadow-[inset_0_2px_2px_rgba(0,0,0,0.6)]" />
        ))}
      </div>

      <UptrendDoodle />
      <PalmDoodle />

      <h1 className="text-3xl font-bold text-slate-900" style={{ ...HAND, lineHeight: `${RULED * 2}px` }}>
        Choose your engine
      </h1>
      <p className="text-[14px] text-slate-600" style={{ lineHeight: `${RULED}px` }}>
        Same account, same risk limits — different pace for a different kind of trade.
      </p>

      {warning && (
        <p className="text-[13px] text-red-700" style={{ ...HAND, lineHeight: `${RULED}px` }}>
          ⚠ heads up: {warning}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-8">
        <CheckLine
          label="Swing Trade"
          color="text-green-700"
          onClick={onSwing}
          desc="The full 8-gate pipeline — Daily Check-In through Authorization. Slower, more scrutiny, the standard engine."
        />
        <CheckLine
          label="Daytrade Engine ⚡"
          color="text-cyan-700"
          onClick={onDaytrade}
          desc="A 4-step fast pass for faster-moving daytrades — fewer questions, same hard risk limits. Higher risk by design."
        />
      </div>

      <div
        className="mt-8 max-w-md border-2 border-red-600 p-3"
        style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
      >
        <p className="text-[15px] text-red-700" style={HAND}>
          Already in a trade you didn&apos;t run through XRILL?
        </p>
        <Link
          href="/session?mode=after"
          className="mt-1 inline-block text-sm font-bold text-red-700 underline decoration-wavy underline-offset-4 hover:text-red-900"
        >
          → Emergency: log a trade after the fact
        </Link>
        <p className="mt-1 text-[11px] text-red-900/70">Not a shortcut. Gets the trade on record so it&apos;s tracked and journaled.</p>
      </div>
    </div>
  );
}
