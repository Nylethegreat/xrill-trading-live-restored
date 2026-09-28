"use client";

import { useEffect, useRef } from "react";

export type StarSpeed = "chill" | "medium" | "fast";
export type StarStyle = "twinkle" | "celestial";

// Per-speed tuning. Chill and Medium are deliberately humble: a sparse,
// dim, slowly drifting field. Fast goes all out: a dense warp-speed field
// whizzing out from the center, streak trails, and constant shooting stars.
const SPEED_CONFIG: Record<
  StarSpeed,
  { count: number; drift: number; twinkleRate: number; shootEvery: number; opacity: number; warp: boolean }
> = {
  chill: { count: 80, drift: 5, twinkleRate: 0.5, shootEvery: 18, opacity: 0.5, warp: false },
  medium: { count: 130, drift: 14, twinkleRate: 1, shootEvery: 9, opacity: 0.65, warp: false },
  fast: { count: 340, drift: 0, twinkleRate: 2.8, shootEvery: 0.7, opacity: 1, warp: true },
};

// Twinkle: soft white dots with a lavender cast over a faint purple haze
// (the Milky Way photo). Celestial: brighter blue-white / warm dots, the
// biggest ones throwing 4-point diffraction spikes (the star-cluster photo).
const STYLE_CONFIG: Record<
  StarStyle,
  { colors: string[]; glow: string; spikeChance: number; sizeMin: number; sizeMax: number; haze: boolean }
> = {
  twinkle: {
    colors: ["#ffffff", "#ffffff", "#f3e8ff", "#e9d5ff", "#ddd6fe"],
    glow: "rgba(192,132,252,",
    spikeChance: 0,
    sizeMin: 0.5,
    sizeMax: 1.8,
    haze: true,
  },
  celestial: {
    colors: ["#ffffff", "#ffffff", "#e0f2fe", "#dbeafe", "#fef3c7", "#fde68a"],
    glow: "rgba(191,219,254,",
    spikeChance: 0.08,
    sizeMin: 0.6,
    sizeMax: 2.6,
    haze: false,
  },
};

type Star = {
  x: number;
  y: number;
  z: number; // warp depth (0..1], unused in drift mode
  px: number; // previous projected position, for warp streaks
  py: number;
  size: number;
  color: string;
  phase: number;
  twinkle: number;
  spiky: boolean;
};

type Shooter = { x: number; y: number; vx: number; vy: number; life: number; max: number };

// A pre-rendered glow sprite per color, so each frame is just drawImage calls.
function makeSprite(color: string, glow: string, spiky: boolean) {
  const size = spiky ? 96 : 32;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d")!;
  const mid = size / 2;
  const halo = g.createRadialGradient(mid, mid, 0, mid, mid, spiky ? 22 : mid);
  halo.addColorStop(0, "rgba(255,255,255,1)");
  halo.addColorStop(0.18, color);
  halo.addColorStop(0.45, `${glow}0.35)`);
  halo.addColorStop(1, `${glow}0)`);
  g.fillStyle = halo;
  g.beginPath();
  g.arc(mid, mid, spiky ? 22 : mid, 0, Math.PI * 2);
  g.fill();
  if (spiky) {
    // 4-point diffraction spikes, fading toward the tips
    for (const [dx, dy] of [
      [1, 0],
      [0, 1],
    ]) {
      const grad = g.createLinearGradient(mid - dx * mid, mid - dy * mid, mid + dx * mid, mid + dy * mid);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.95)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.strokeStyle = grad;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(mid - dx * mid, mid - dy * mid);
      g.lineTo(mid + dx * mid, mid + dy * mid);
      g.stroke();
    }
  }
  return c;
}

export default function StarField({ speed, starStyle }: { speed: StarSpeed; starStyle: StarStyle }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cfg = SPEED_CONFIG[speed];
    const sty = STYLE_CONFIG[starStyle];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, cfg.warp ? 1.5 : 2);

    const sprites = new Map<string, HTMLCanvasElement>();
    const sprite = (color: string, spiky: boolean) => {
      const key = `${color}-${spiky}`;
      let s = sprites.get(key);
      if (!s) {
        s = makeSprite(color, sty.glow, spiky);
        sprites.set(key, s);
      }
      return s;
    };

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let shooters: Shooter[] = [];
    let haze: HTMLCanvasElement | null = null;

    const newStar = (fresh: boolean): Star => ({
      x: cfg.warp ? Math.random() * 2 - 1 : Math.random() * w,
      y: cfg.warp ? Math.random() * 2 - 1 : Math.random() * h,
      z: fresh ? Math.random() * 0.9 + 0.1 : 1,
      px: NaN,
      py: NaN,
      size: sty.sizeMin + Math.random() ** 2 * (sty.sizeMax - sty.sizeMin),
      color: sty.colors[Math.floor(Math.random() * sty.colors.length)],
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.6 + Math.random() * 1.4,
      spiky: Math.random() < sty.spikeChance,
    });

    const buildHaze = () => {
      if (!sty.haze) return null;
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.floor(w / 4));
      c.height = Math.max(1, Math.floor(h / 4));
      const g = c.getContext("2d")!;
      const blobs = [
        [0.55, 0.35, 0.45, "rgba(139,92,246,0.22)"],
        [0.7, 0.3, 0.3, "rgba(196,181,253,0.18)"],
        [0.35, 0.5, 0.32, "rgba(109,40,217,0.16)"],
      ] as const;
      for (const [bx, by, br, col] of blobs) {
        const r = br * Math.max(c.width, c.height);
        const grad = g.createRadialGradient(bx * c.width, by * c.height, 0, bx * c.width, by * c.height, r);
        grad.addColorStop(0, col);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, c.width, c.height);
      }
      return c;
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: cfg.count }, () => newStar(true));
      haze = buildHaze();
    };
    resize();

    const spawnShooter = () => {
      const fromLeft = Math.random() < 0.5;
      const speedPx = (cfg.warp ? 1300 : 800) * (0.8 + Math.random() * 0.5);
      const angle = (fromLeft ? 0.35 : Math.PI - 0.35) + (Math.random() - 0.5) * 0.3;
      shooters.push({
        x: fromLeft ? Math.random() * w * 0.6 : w * 0.4 + Math.random() * w * 0.6,
        y: Math.random() * h * 0.5,
        vx: Math.cos(angle) * speedPx,
        vy: Math.sin(angle) * speedPx,
        life: 0,
        max: 0.7 + Math.random() * 0.5,
      });
    };

    let t = 0;
    let nextShoot = cfg.shootEvery * (0.5 + Math.random());

    const draw = (dt: number) => {
      t += dt;
      ctx.clearRect(0, 0, w, h);
      if (haze) {
        ctx.globalAlpha = 1;
        ctx.drawImage(haze, 0, 0, w, h);
      }

      const cx = w / 2;
      const cy = h / 2;
      const focal = Math.max(w, h) * 0.5;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const tw = 0.55 + 0.45 * Math.sin(t * s.twinkle * cfg.twinkleRate * 2 + s.phase);
        let sx: number;
        let sy: number;
        let scale: number;

        if (cfg.warp) {
          s.z -= dt * 0.42;
          if (s.z <= 0.02) {
            stars[i] = newStar(false);
            continue;
          }
          sx = cx + (s.x / s.z) * focal * 0.5;
          sy = cy + (s.y / s.z) * focal * 0.5;
          if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) {
            stars[i] = newStar(false);
            continue;
          }
          scale = Math.min(3.2, 0.5 + (1 - s.z) * 2.6);
          if (!Number.isNaN(s.px)) {
            // the whizz: a streak from last frame's position to this one
            const alpha = Math.min(1, (1 - s.z) * 1.4);
            ctx.strokeStyle = starStyle === "twinkle" ? `rgba(233,213,255,${alpha * 0.7})` : `rgba(255,255,255,${alpha * 0.85})`;
            ctx.lineWidth = Math.max(0.6, s.size * scale * 0.45);
            ctx.beginPath();
            ctx.moveTo(s.px, s.py);
            ctx.lineTo(sx, sy);
            ctx.stroke();
          }
          s.px = sx;
          s.py = sy;
        } else {
          // gentle diagonal drift with a little parallax by size
          const par = 0.4 + s.size / sty.sizeMax;
          s.x += cfg.drift * 0.9 * par * dt;
          s.y += cfg.drift * 0.35 * par * dt;
          if (s.x > w + 10) s.x -= w + 20;
          if (s.y > h + 10) s.y -= h + 20;
          sx = s.x;
          sy = s.y;
          scale = 1;
        }

        const img = sprite(s.color, s.spiky);
        const flash = s.spiky ? 0.6 + 0.4 * Math.sin(t * 3.1 + s.phase) ** 8 : 1;
        const d = (s.spiky ? 18 : 7) * s.size * scale * (s.spiky ? 0.5 + flash * 0.6 : 1);
        ctx.globalAlpha = Math.min(1, tw * (s.spiky ? flash : 1));
        ctx.drawImage(img, sx - d / 2, sy - d / 2, d, d);
      }
      ctx.globalAlpha = 1;

      // Shooting stars
      nextShoot -= dt;
      if (nextShoot <= 0) {
        spawnShooter();
        if (cfg.warp && Math.random() < 0.4) spawnShooter();
        nextShoot = cfg.shootEvery * (0.5 + Math.random());
      }
      shooters = shooters.filter((sh) => sh.life < sh.max);
      for (const sh of shooters) {
        sh.life += dt;
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        const fade = 1 - sh.life / sh.max;
        const len = cfg.warp ? 0.2 : 0.14;
        const tx = sh.x - sh.vx * len;
        const ty = sh.y - sh.vy * len;
        const grad = ctx.createLinearGradient(tx, ty, sh.x, sh.y);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(1, `rgba(255,255,255,${0.9 * fade})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = cfg.warp ? 2 : 1.4;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(sh.x, sh.y);
        ctx.stroke();
        const head = sprite("#ffffff", false);
        ctx.globalAlpha = fade;
        ctx.drawImage(head, sh.x - 7, sh.y - 7, 14, 14);
        ctx.globalAlpha = 1;
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

    if (reduceMotion) {
      // one still frame: no drift, no warp, no shooting stars
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onVisibility = () => {
      if (reduceMotion) return;
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
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
  }, [speed, starStyle]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: SPEED_CONFIG[speed].opacity }}
    />
  );
}
