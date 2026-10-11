"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePersistentChoice } from "@/lib/usePersistentChoice";
import { RELICS } from "@/lib/data/relics";

// The finale: once the real balance clears the last stage (Golden Anubis),
// the member gets a setting to turn on celebration fireworks. When it's on,
// they launch once per browser session on arrival, and the button fires
// another round any time. Before the final stage it just shows what's left.
// Canvas, ~7s, pointer-events none; skipped under reduced motion.
const FINAL = RELICS[RELICS.length - 1];
const MODES = ["off", "on"] as const;
type Mode = (typeof MODES)[number];
const COLORS = ["#fbbf24", "#f0abfc", "#38bdf8", "#22c55e", "#f43f5e", "#fde68a", "#a855f7"];

function launch(canvas: HTMLCanvasElement, onDone: () => void) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return onDone;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
  };
  resize();
  window.addEventListener("resize", resize);
  type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; rocket?: boolean; ty?: number };
  const ps: P[] = [];
  const W = () => canvas.width, H = () => canvas.height;
  let shots = 0, frame = 0, raf = 0;
  const burst = (x: number, y: number) => {
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    const c2 = COLORS[Math.floor(Math.random() * COLORS.length)];
    const n = 70 + Math.floor(Math.random() * 50);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, s = (2.5 + Math.random() * 5.5) * dpr;
      ps.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 60 + Math.random() * 40, c: i % 3 ? c : c2 });
    }
  };
  const tick = () => {
    frame++;
    if (shots < 14 && frame % 15 === 1) {
      shots++;
      ps.push({ x: W() * (0.15 + Math.random() * 0.7), y: H(), vx: (Math.random() - 0.5) * 2 * dpr, vy: -(14 + Math.random() * 5) * dpr, life: 0, max: 999, c: "#fff7d6", rocket: true, ty: H() * (0.15 + Math.random() * 0.35) });
    }
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, W(), H());
    ctx.globalCompositeOperation = "lighter";
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      if (p.rocket) {
        if (p.y <= (p.ty ?? 0) || p.vy >= 0) {
          burst(p.x, p.y);
          ps.splice(i, 1);
          continue;
        }
        p.vy += 0.16 * dpr;
      } else {
        p.vx *= 0.975;
        p.vy = p.vy * 0.975 + 0.06 * dpr;
        if (p.life > p.max) {
          ps.splice(i, 1);
          continue;
        }
      }
      ctx.globalAlpha = p.rocket ? 1 : Math.max(0, 1 - p.life / p.max);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (p.rocket ? 2.6 : 2.4) * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (shots >= 14 && ps.length === 0) {
      ctx.clearRect(0, 0, W(), H());
      window.removeEventListener("resize", resize);
      onDone();
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}

export default function FireworksCelebration({ balance, className = "" }: { balance: number; className?: string }) {
  const reached = balance >= FINAL.unlockAt;
  const [mode, setMode, hydrated] = usePersistentChoice<Mode>("xrill-fireworks", MODES, "on");
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLCanvasElement>(null);

  const fire = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing || !ref.current) return;
    return launch(ref.current, () => setPlaying(false));
  }, [playing]);

  useEffect(() => {
    if (!hydrated || !reached || mode !== "on") return;
    try {
      if (sessionStorage.getItem("xrill-fireworks-shown")) return;
      sessionStorage.setItem("xrill-fireworks-shown", "1");
    } catch {
      // storage blocked -- still celebrate
    }
    fire();
  }, [hydrated, reached, mode, fire]);

  if (!reached) {
    const left = FINAL.unlockAt - balance;
    return (
      <div className={`rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/50 ${className}`}>
        🎆 <span className="text-white/70">Finale fireworks</span> unlock at the final stage — ${FINAL.unlockAt.toLocaleString()} ({FINAL.name}).{" "}
        <span className="font-mono text-white/40">${Math.max(0, left).toLocaleString()} to go.</span>
      </div>
    );
  }

  return (
    <>
      {playing && <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />}
      <div className={`flex flex-wrap items-center gap-3 rounded-lg border border-yellow-300/40 bg-yellow-300/10 px-3 py-2 text-xs ${className}`}>
        <span className="text-yellow-100">🎆 Final stage cleared. You earned the finale.</span>
        <div className="flex overflow-hidden rounded-md border border-white/15" role="group" aria-label="Celebration fireworks">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`px-2.5 py-1 font-mono uppercase ${mode === m ? "bg-yellow-300/25 text-white" : "text-white/50 hover:text-white"}`}
            >
              {m === "on" ? "Fireworks on" : "Off"}
            </button>
          ))}
        </div>
        <button type="button" onClick={fire} disabled={playing} className="rounded-md bg-yellow-300/90 px-3 py-1 font-semibold text-black hover:bg-yellow-200 disabled:opacity-50">
          Launch 🎆
        </button>
      </div>
    </>
  );
}
