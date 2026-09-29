"use client";

import { useEffect, useRef } from "react";

export type LeafDensity = "light" | "flurry";

// Autumn leaves drifting down behind the Analytics page -- a nod to the
// numbers always changing season to season. Each leaf is a small
// bezier-drawn shape that sways side to side, tumbles (a scaleX flip gives
// the 3D turn), and respawns at the top. Canvas + requestAnimationFrame,
// pauses in background tabs, still frame under reduced motion.

const COLORS = ["#f97316", "#ea580c", "#dc2626", "#facc15", "#eab308", "#b45309", "#d97706", "#fb923c"];

const DENSITY = {
  light: { count: 16, opacity: 0.55 },
  flurry: { count: 42, opacity: 0.8 },
} as const;

type Leaf = {
  x: number;
  y: number;
  size: number;
  color: string;
  vy: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  rot: number;
  spin: number;
  flip: number;
  flipSpeed: number;
  shape: 0 | 1;
};

function drawLeaf(ctx: CanvasRenderingContext2D, leaf: Leaf) {
  const s = leaf.size;
  ctx.fillStyle = leaf.color;
  ctx.strokeStyle = "rgba(60,20,0,0.45)";
  ctx.lineWidth = Math.max(0.6, s * 0.06);
  ctx.beginPath();
  if (leaf.shape === 0) {
    // simple oval-pointed leaf
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.75, -s * 0.5, s * 0.6, s * 0.6, 0, s);
    ctx.bezierCurveTo(-s * 0.6, s * 0.6, -s * 0.75, -s * 0.5, 0, -s);
  } else {
    // three-lobed, maple-ish leaf
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.25, -s * 0.35, s * 0.9, -s * 0.45);
    ctx.quadraticCurveTo(s * 0.45, -s * 0.05, s * 0.7, s * 0.45);
    ctx.quadraticCurveTo(s * 0.2, s * 0.3, 0, s * 0.8);
    ctx.quadraticCurveTo(-s * 0.2, s * 0.3, -s * 0.7, s * 0.45);
    ctx.quadraticCurveTo(-s * 0.45, -s * 0.05, -s * 0.9, -s * 0.45);
    ctx.quadraticCurveTo(-s * 0.25, -s * 0.35, 0, -s);
  }
  ctx.fill();
  ctx.stroke();
  // center vein + stem
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.85);
  ctx.lineTo(0, s * 1.2);
  ctx.stroke();
}

export default function FallingLeaves({ density }: { density: LeafDensity }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const cfg = DENSITY[density];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let leaves: Leaf[] = [];

    const makeLeaf = (anywhere: boolean): Leaf => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -30 - Math.random() * 100,
      size: 7 + Math.random() * 9,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vy: 28 + Math.random() * 38,
      swayAmp: 20 + Math.random() * 45,
      swayFreq: 0.5 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 1.6,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 1 + Math.random() * 2.2,
      shape: Math.random() < 0.5 ? 0 : 1,
    });

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      leaves = Array.from({ length: cfg.count }, () => makeLeaf(true));
    };
    resize();

    let time = 0;
    const draw = (dt: number) => {
      time += dt;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < leaves.length; i++) {
        const l = leaves[i];
        l.y += l.vy * dt;
        l.rot += l.spin * dt;
        l.flip += l.flipSpeed * dt;
        if (l.y > h + 30) {
          leaves[i] = makeLeaf(false);
          continue;
        }
        const x = l.x + Math.sin(time * l.swayFreq + l.phase) * l.swayAmp;
        ctx.save();
        ctx.translate(x, l.y);
        ctx.rotate(l.rot + Math.sin(time * l.swayFreq + l.phase) * 0.5);
        ctx.scale(Math.max(0.15, Math.abs(Math.cos(l.flip))), 1);
        drawLeaf(ctx, l);
        ctx.restore();
      }
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
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: DENSITY[density].opacity }}
    />
  );
}
