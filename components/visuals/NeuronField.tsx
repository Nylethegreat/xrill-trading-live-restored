"use client";

import { useEffect, useRef } from "react";

export type NeuronIntensity = "subtle" | "strong";

// Fluorescence-microscopy style neuron network for the Intelligence page:
// branching dendrites that shift color along their length (orange/red
// trunks -> yellow -> green -> cyan -> blue tips), glowing synaptic
// boutons, and signal pulses running along the branches.
//
// Performance: the whole network (with its glow) is drawn ONCE to an
// offscreen canvas per resize; each frame just blits that and draws a few
// dozen small moving pulses and twinkling boutons. Seeded RNG, so the
// network is identical on every visit for a given screen size.

const PALETTE = ["#fb923c", "#facc15", "#a3e635", "#4ade80", "#22d3ee", "#38bdf8", "#3b82f6", "#e879f9"];

const INTENSITY = {
  subtle: { opacity: 0.32, pulses: 14, trees: 6, glow: 6, twinkles: 40 },
  strong: { opacity: 0.85, pulses: 46, trees: 8, glow: 12, twinkles: 90 },
} as const;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Segment = { pts: [number, number][]; color: string; width: number };
type Bouton = { x: number; y: number; r: number; color: string; phase: number };

function buildNetwork(w: number, h: number, trees: number) {
  const rand = mulberry32(Math.round(w) * 7 + Math.round(h) * 13 + trees);
  const segments: Segment[] = [];
  const boutons: Bouton[] = [];
  const scale = Math.max(w, h) / 1400;

  const grow = (x: number, y: number, angle: number, len: number, width: number, depth: number, hueOffset: number) => {
    if (depth > 5 || len < 14 * scale || segments.length > 700) return;
    const pts: [number, number][] = [[x, y]];
    const steps = 10;
    let a = angle;
    let cx = x;
    let cy = y;
    for (let i = 0; i < steps; i++) {
      a += (rand() - 0.5) * 0.35;
      cx += Math.cos(a) * (len / steps);
      cy += Math.sin(a) * (len / steps);
      pts.push([cx, cy]);
    }
    const color = PALETTE[Math.min(PALETTE.length - 1, Math.max(0, depth + hueOffset))];
    segments.push({ pts, color, width });

    // synaptic boutons along finer branches
    if (depth >= 2 && rand() < 0.6) {
      const n = 1 + Math.floor(rand() * 2);
      for (let i = 0; i < n; i++) {
        const p = pts[1 + Math.floor(rand() * (pts.length - 1))];
        boutons.push({
          x: p[0],
          y: p[1],
          r: (1.2 + rand() * 2.2) * Math.max(0.7, scale),
          color: rand() < 0.6 ? "#fde68a" : color,
          phase: rand() * Math.PI * 2,
        });
      }
    }

    const children = depth < 1 ? 2 + Math.floor(rand() * 2) : rand() < 0.55 ? 2 : 1;
    for (let i = 0; i < children; i++) {
      const spread = (rand() - 0.5) * 1.5;
      grow(cx, cy, a + spread, len * (0.62 + rand() * 0.2), Math.max(0.6, width * 0.62), depth + 1, hueOffset);
    }
  };

  for (let t = 0; t < trees; t++) {
    // somas spread around (some just off-screen) so branches fill the page
    const x = (t % 3) * (w / 3) + rand() * (w / 3);
    const y = Math.floor(t / 3) * (h / Math.ceil(trees / 3)) + rand() * (h / 3);
    const hueOffset = Math.floor(rand() * 3) - 1;
    const arms = 3 + Math.floor(rand() * 2);
    for (let i = 0; i < arms; i++) {
      grow(x, y, (i / arms) * Math.PI * 2 + rand(), (150 + rand() * 120) * scale, 3.2 * Math.max(0.8, scale), 0, hueOffset);
    }
  }

  return { segments, boutons };
}

export default function NeuronField({ intensity }: { intensity: NeuronIntensity }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const cfg = INTENSITY[intensity];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0;
    let h = 0;
    let base: HTMLCanvasElement | null = null;
    let network = { segments: [] as Segment[], boutons: [] as Bouton[] };
    let pulses: { seg: number; t: number; speed: number }[] = [];
    let twinklers: Bouton[] = [];

    // One pre-rendered glow sprite per color: frames are just drawImage.
    const sprites = new Map<string, HTMLCanvasElement>();
    const sprite = (color: string) => {
      let c = sprites.get(color);
      if (!c) {
        c = document.createElement("canvas");
        c.width = c.height = 32;
        const g = c.getContext("2d")!;
        const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.3, color);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 32, 32);
        sprites.set(color, c);
      }
      return c;
    };

    const drawBase = () => {
      base = document.createElement("canvas");
      base.width = Math.floor(w * dpr);
      base.height = Math.floor(h * dpr);
      const b = base.getContext("2d")!;
      b.scale(dpr, dpr);
      b.lineCap = "round";
      b.lineJoin = "round";
      b.globalCompositeOperation = "lighter";
      for (const s of network.segments) {
        b.strokeStyle = s.color;
        b.shadowColor = s.color;
        b.shadowBlur = cfg.glow;
        b.globalAlpha = 0.55;
        b.lineWidth = s.width;
        b.beginPath();
        b.moveTo(s.pts[0][0], s.pts[0][1]);
        for (let i = 1; i < s.pts.length; i++) b.lineTo(s.pts[i][0], s.pts[i][1]);
        b.stroke();
        // thin bright core, like a fluorescent filament
        b.shadowBlur = 0;
        b.globalAlpha = 0.5;
        b.strokeStyle = "#ffffff";
        b.lineWidth = Math.max(0.4, s.width * 0.25);
        b.stroke();
      }
      b.shadowBlur = 0;
      b.globalAlpha = 0.7;
      for (const bt of network.boutons) {
        const d = bt.r * 4.5;
        b.drawImage(sprite(bt.color), bt.x - d / 2, bt.y - d / 2, d, d);
      }
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      network = buildNetwork(w, h, cfg.trees);
      pulses = Array.from({ length: cfg.pulses }, () => ({
        seg: Math.floor(Math.random() * network.segments.length),
        t: Math.random(),
        speed: 0.25 + Math.random() * 0.5,
      }));
      twinklers = [...network.boutons].sort(() => Math.random() - 0.5).slice(0, cfg.twinkles);
      drawBase();
    };
    resize();

    const pointAt = (s: Segment, t: number): [number, number] => {
      const f = t * (s.pts.length - 1);
      const i = Math.min(s.pts.length - 2, Math.floor(f));
      const k = f - i;
      return [s.pts[i][0] + (s.pts[i + 1][0] - s.pts[i][0]) * k, s.pts[i][1] + (s.pts[i + 1][1] - s.pts[i][1]) * k];
    };

    let time = 0;
    const draw = (dt: number) => {
      time += dt;
      ctx.clearRect(0, 0, w, h);
      if (base) ctx.drawImage(base, 0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const bt of twinklers) {
        const glow = 0.5 + 0.5 * Math.sin(time * 1.6 + bt.phase);
        const d = bt.r * (5 + glow * 4);
        ctx.globalAlpha = glow * 0.9;
        ctx.drawImage(sprite(bt.color), bt.x - d / 2, bt.y - d / 2, d, d);
      }

      for (const p of pulses) {
        p.t += p.speed * dt;
        if (p.t >= 1) {
          p.t = 0;
          p.seg = Math.floor(Math.random() * network.segments.length);
        }
        const s = network.segments[p.seg];
        if (!s) continue;
        const [x, y] = pointAt(s, p.t);
        ctx.globalAlpha = Math.sin(p.t * Math.PI);
        ctx.drawImage(sprite(s.color), x - 9, y - 9, 18, 18);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    if (reduceMotion) draw(0);
    else raf = requestAnimationFrame(loop);

    const onVisibility = () => {
      if (reduceMotion) return;
      if (document.hidden) cancelAnimationFrame(raf);
      else {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const onResize = () => {
      resize();
      if (reduceMotion) draw(0);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-700"
      style={{ opacity: INTENSITY[intensity].opacity }}
    />
  );
}
