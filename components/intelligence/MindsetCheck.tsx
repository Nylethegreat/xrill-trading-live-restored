"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  REALMS,
  TEST_LENGTHS,
  isValidWritten,
  pickQuestions,
  scoreAnswer,
  type MindsetQuestion,
  type Realm,
  type TestLength,
} from "@/lib/data/mindsetQuestions";

// XRILL Mindset Check — a 25/30/45/50-question pre-trade questionnaire
// sampled fresh from a 150+ question bank. Same-day only: the "why" you
// trade and today's result live in localStorage (nothing goes to the
// database), and quietly reset each morning. When a lot is on the line,
// the short versions lock and the high-stakes questions are forced in.

const WHY_KEY = "xrill-mindset-why";
const HIGH_STAKES_DOLLARS = 5_000;
const HIGH_STAKES_FRACTION = 0.25;

type Answers = Record<string, unknown>;
type Phase = "setup" | "quiz" | "power" | "results";

interface TodayResult {
  pct: number;
  verdict: Verdict["label"];
  length: number;
  at: string;
}

interface Verdict {
  label: "READY" | "CAUTION" | "STAND DOWN";
  color: string;
  line: string;
}

function todayKey() {
  const d = new Date();
  return `xrill-mindset-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readLS<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeLS(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // private mode / quota — the check still works, it just won't be remembered
  }
}

function verdictFor(pct: number, highStakes: boolean): Verdict {
  // A big day raises the bar by 10 points.
  const bump = highStakes ? 10 : 0;
  if (pct >= 75 + bump)
    return { label: "READY", color: "#22c55e", line: "You're grounded. Trade your plan — exactly your plan." };
  if (pct >= 55 + bump)
    return {
      label: "CAUTION",
      color: "#facc15",
      line: "Tradeable, but not at full size. Fix your weakest realm first, then take only A+ setups.",
    };
  return {
    label: "STAND DOWN",
    color: "#f43f5e",
    line: "Not today. Protecting your capital and your head is a win. Come back after you've taken care of yourself.",
  };
}

const realmMeta = (id: Realm) => REALMS.find((r) => r.id === id)!;

export default function MindsetCheck({ balance }: { balance: number }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [length, setLength] = useState<TestLength>(30);
  const [stakeInput, setStakeInput] = useState("");
  const [why, setWhy] = useState("");
  const [questions, setQuestions] = useState<MindsetQuestion[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [powerLine, setPowerLine] = useState("");
  const [today, setToday] = useState<TodayResult | null>(null);

  useEffect(() => {
    setWhy(readLS<string>(WHY_KEY) ?? "");
    setToday(readLS<TodayResult>(todayKey()));
  }, []);

  const stake = Math.max(0, Number(stakeInput) || 0);
  const highStakes = stake >= HIGH_STAKES_DOLLARS || (balance > 0 && stake >= balance * HIGH_STAKES_FRACTION);
  const minLength: TestLength = highStakes ? 45 : 25;
  const effectiveLength: TestLength = length < minLength ? minLength : length;

  function start() {
    writeLS(WHY_KEY, why.trim());
    setQuestions(pickQuestions(effectiveLength, highStakes));
    setAnswers({});
    setIndex(0);
    setPowerLine("");
    setPhase("quiz");
  }

  const current = questions[index];
  const currentAnswered = current ? scoreAnswer(current, answers[current.id]) !== null && (current.kind !== "text" || isValidWritten(String(answers[current.id] ?? ""))) : false;

  function answer(value: unknown) {
    if (!current) return;
    setAnswers((a) => ({ ...a, [current.id]: value }));
  }

  function next() {
    if (!currentAnswered) return;
    if (index < questions.length - 1) setIndex(index + 1);
    else setPhase("power");
  }

  const results = useMemo(() => {
    if (phase !== "results") return null;
    const perRealm = new Map<Realm, { earned: number; total: number }>();
    let earned = 0;
    for (const q of questions) {
      const s = scoreAnswer(q, answers[q.id]) ?? 0;
      earned += s;
      const r = perRealm.get(q.realm) ?? { earned: 0, total: 0 };
      r.earned += s;
      r.total += 1;
      perRealm.set(q.realm, r);
    }
    const pct = questions.length ? (earned / questions.length) * 100 : 0;
    const realms = REALMS.filter((r) => perRealm.has(r.id)).map((r) => {
      const v = perRealm.get(r.id)!;
      return { ...r, pct: (v.earned / v.total) * 100, count: v.total };
    });
    const weakest = [...realms].sort((a, b) => a.pct - b.pct).slice(0, 2).filter((r) => r.pct < 80);
    return { pct, realms, weakest, verdict: verdictFor(pct, highStakes) };
  }, [phase, questions, answers, highStakes]);

  function finish() {
    if (!isValidWritten(powerLine)) return;
    setPhase("results");
  }

  useEffect(() => {
    if (phase === "results" && results) {
      const r: TodayResult = {
        pct: Math.round(results.pct),
        verdict: results.verdict.label,
        length: questions.length,
        at: new Date().toISOString(),
      };
      writeLS(todayKey(), r);
      setToday(r);
    }
  }, [phase, results, questions.length]);

  // ── SETUP ────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 via-sky-500/5 to-amber-400/10 p-5">
        <RealmRibbon />
        {today && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs">
            <span className="text-white/60">Today&apos;s check ({today.length} questions)</span>
            <span className="font-mono font-bold" style={{ color: verdictFor(today.pct, false).color }}>
              {today.pct}% · {today.verdict}
            </span>
          </div>
        )}

        <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-white/60">
          Why are you doing this?
        </label>
        <textarea
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          rows={2}
          placeholder="The real reason. You'll see it again at the end."
          className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400"
        />

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-white/60">
          How much is on the line today? <span className="normal-case text-white/40">($ at risk, optional)</span>
        </label>
        <input
          type="number"
          min={0}
          inputMode="decimal"
          value={stakeInput}
          onChange={(e) => setStakeInput(e.target.value)}
          placeholder="0"
          className="mt-1.5 w-40 rounded-lg border border-white/15 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none focus:border-fuchsia-400"
        />
        {highStakes && (
          <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
            <b className="text-rose-300">Big day.</b> With this much on the line the short checks are locked —
            45 questions minimum, high-stakes questions first, and the bar for READY is 10 points higher.
          </div>
        )}

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-white/60">Pick your length</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TEST_LENGTHS.map((n) => {
            const locked = n < minLength;
            const active = effectiveLength === n;
            return (
              <button
                key={n}
                type="button"
                disabled={locked}
                onClick={() => setLength(n)}
                className={`rounded-full border px-4 py-1.5 font-mono text-sm font-bold transition ${
                  active
                    ? "border-fuchsia-300 bg-fuchsia-500/30 text-white shadow-[0_0_14px_rgba(232,121,249,0.5)]"
                    : locked
                    ? "cursor-not-allowed border-white/10 text-white/20 line-through"
                    : "border-white/20 text-white/70 hover:border-white/40"
                }`}
              >
                {n} Q
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={start}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-fuchsia-500 via-sky-500 to-amber-400 py-2.5 text-sm font-extrabold uppercase tracking-widest text-black hover:opacity-90"
        >
          Begin Mindset Check
        </button>
        <p className="mt-2 text-center text-[11px] text-white/35">
          Fresh random questions every time. Written answers aren&apos;t graded — any real answer counts.
        </p>
      </div>
    );
  }

  // ── QUIZ ─────────────────────────────────────────────────────────────
  if (phase === "quiz" && current) {
    const meta = realmMeta(current.realm);
    const progress = (index / questions.length) * 100;
    const value = answers[current.id];
    return (
      <div
        className="relative overflow-hidden rounded-xl border p-5 transition-colors"
        style={{ borderColor: `${meta.color}66`, background: `linear-gradient(135deg, ${meta.color}22, transparent 60%)` }}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wide text-black" style={{ background: meta.color }}>
            {meta.icon} {meta.label}
          </span>
          <span className="font-mono text-white/50">
            {index + 1} / {questions.length}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: meta.color }} />
        </div>

        {current.highStakes && <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-rose-300">⚠ Big-day question</p>}
        <h3 className="mt-3 text-lg font-semibold leading-snug text-white">{current.q}</h3>

        <div className="mt-4">
          {current.kind === "yesno" && (
            <div className="grid grid-cols-2 gap-2">
              {[true, false].map((v) => (
                <ChoiceButton key={String(v)} active={value === v} color={meta.color} onClick={() => answer(v)}>
                  {v ? "Yes" : "No"}
                </ChoiceButton>
              ))}
            </div>
          )}
          {current.kind === "choice" && (
            <div className="grid gap-2">
              {current.options.map((o, i) => (
                <ChoiceButton key={o.label} active={value === i} color={meta.color} onClick={() => answer(i)}>
                  {o.label}
                </ChoiceButton>
              ))}
            </div>
          )}
          {current.kind === "scale" && (
            <div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <ChoiceButton key={n} active={value === n} color={meta.color} onClick={() => answer(n)}>
                    {n}
                  </ChoiceButton>
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-white/40">
                <span>{current.low}</span>
                <span>{current.high}</span>
              </div>
            </div>
          )}
          {current.kind === "text" && (
            <textarea
              key={current.id}
              autoFocus
              rows={3}
              value={String(value ?? "")}
              onChange={(e) => answer(e.target.value)}
              placeholder={current.placeholder ?? "Your answer…"}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
              style={{ borderColor: isValidWritten(String(value ?? "")) ? meta.color : undefined }}
            />
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => (index > 0 ? setIndex(index - 1) : setPhase("setup"))}
            className="rounded-lg border border-white/15 px-4 py-2 text-xs text-white/60 hover:text-white"
          >
            ← Back
          </button>
          <button
            type="button"
            disabled={!currentAnswered}
            onClick={next}
            className="rounded-lg px-5 py-2 text-sm font-bold text-black disabled:opacity-30"
            style={{ background: meta.color }}
          >
            {index === questions.length - 1 ? "Finish" : "Next →"}
          </button>
        </div>
      </div>
    );
  }

  // ── POWER STATEMENT (required before results) ────────────────────────
  if (phase === "power") {
    return (
      <div className="relative overflow-hidden rounded-xl border border-amber-300/40 bg-gradient-to-br from-amber-400/20 via-fuchsia-500/10 to-transparent p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">⚡ Power-up before your score</p>
        <h3 className="mt-2 text-lg font-semibold text-white">Write one thing that is going right for you — right now.</h3>
        <p className="mt-1 text-xs text-white/50">
          Not &quot;I&apos;ll be fine if…&quot;. Something already true. Your score unlocks after this.
        </p>
        <textarea
          autoFocus
          rows={3}
          value={powerLine}
          onChange={(e) => setPowerLine(e.target.value)}
          placeholder="I showed up. I'm learning faster than last month. I have people who care about me…"
          className="mt-3 w-full rounded-lg border border-amber-300/40 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
        />
        <button
          type="button"
          disabled={!isValidWritten(powerLine)}
          onClick={finish}
          className="mt-4 w-full rounded-lg bg-gradient-to-r from-amber-300 to-fuchsia-400 py-2.5 text-sm font-extrabold uppercase tracking-widest text-black disabled:opacity-30"
        >
          Reveal my readiness
        </button>
      </div>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────────────
  if (phase === "results" && results) {
    const { pct, realms, weakest, verdict } = results;
    return (
      <div className="relative overflow-hidden rounded-xl border p-5" style={{ borderColor: `${verdict.color}66`, background: `linear-gradient(160deg, ${verdict.color}22, transparent 55%)` }}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/50">Readiness</p>
            <p className="font-mono text-5xl font-extrabold" style={{ color: verdict.color, textShadow: `0 0 18px ${verdict.color}aa` }}>
              {Math.round(pct)}%
            </p>
          </div>
          <span className="rounded-full px-3 py-1 font-mono text-sm font-extrabold tracking-widest text-black" style={{ background: verdict.color }}>
            {verdict.label}
          </span>
        </div>
        <p className="mt-2 text-sm text-white/80">{verdict.line}</p>

        {why.trim() && (
          <div className="mt-5 rounded-lg border border-fuchsia-400/40 bg-fuchsia-500/10 p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-fuchsia-300">Remember why you&apos;re doing this</p>
            <p className="mt-1.5 text-base font-semibold text-white">&ldquo;{why.trim()}&rdquo;</p>
          </div>
        )}
        <div className="mt-3 rounded-lg border border-amber-300/40 bg-amber-400/10 p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">What&apos;s already going right</p>
          <p className="mt-1.5 text-sm text-white">{powerLine.trim()}</p>
        </div>

        <div className="mt-5 space-y-2">
          {realms.map((r) => (
            <div key={r.id}>
              <div className="flex justify-between text-xs">
                <span className="text-white/80">
                  {r.icon} {r.label}
                </span>
                <span className="font-mono text-white/50">{Math.round(r.pct)}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color, boxShadow: `0 0 10px ${r.color}` }} />
              </div>
            </div>
          ))}
        </div>

        {weakest.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">Fix first</p>
            {weakest.map((r) => (
              <div key={r.id} className="rounded-lg border bg-black/30 p-3 text-sm text-white/80" style={{ borderColor: `${r.color}55` }}>
                <b style={{ color: r.color }}>
                  {r.icon} {r.label}:
                </b>{" "}
                {r.tip}
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <Link href="/journal" className="rounded-lg border border-white/20 px-3 py-2 text-white/80 hover:text-white">
            📓 Journal / Codex
          </Link>
          {verdict.label !== "STAND DOWN" && (
            <Link href="/session" className="rounded-lg border border-white/20 px-3 py-2 text-white/80 hover:text-white">
              ▶ Start Session
            </Link>
          )}
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="rounded-lg border border-white/20 px-3 py-2 text-white/60 hover:text-white"
          >
            ↻ Take another
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function ChoiceButton({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border px-3 py-2.5 text-left text-sm transition"
      style={
        active
          ? { borderColor: color, background: `${color}33`, color: "#fff", boxShadow: `0 0 12px ${color}66` }
          : { borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.75)" }
      }
    >
      {children}
    </button>
  );
}

function RealmRibbon() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {REALMS.map((r) => (
        <span
          key={r.id}
          className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ borderColor: `${r.color}66`, color: r.color, background: `${r.color}14` }}
        >
          {r.icon} {r.label}
        </span>
      ))}
    </div>
  );
}
