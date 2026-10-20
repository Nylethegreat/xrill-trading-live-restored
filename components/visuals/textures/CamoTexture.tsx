import { mulberry32 } from "./seeded";

// Weapon-camo journal backdrops: wavy, flowing tiger/swirl stripes in the
// style of an unlockable gun camo. Two original palettes:
//   - cryo:  icy chrome blue on near-black (frosted metal)
//   - toxic: radioactive green on black
//
// Built for speed (the earlier animated scenes were heavy): one small,
// seamlessly tiling SVG tile generated ONCE at module load and used as a
// CSS background-image, so the browser rasterizes ~480px once and repeats
// it. No SVG filters, no per-frame SVG work. The only motion is a single
// soft sheen band moved with a CSS transform (GPU-composited, and off
// under reduced motion via .xr-camo-sheen in globals.css).

export type CamoId = "cryo" | "toxic";

const T = 480; // tile size

type Palette = { base: string; bands: string[]; highlight: string; sheen: string };
const PALETTES: Record<CamoId, Palette> = {
  cryo: { base: "#06090f", bands: ["#0f2741", "#1d4f7a", "#3b82c4", "#7cc4f0"], highlight: "#e0f4ff", sheen: "rgba(186,230,253,0.16)" },
  toxic: { base: "#030604", bands: ["#062a12", "#0d5a24", "#16a34a", "#4ade80"], highlight: "#d9ffb3", sheen: "rgba(134,239,172,0.14)" },
};

// y(x) built only from sines with whole-number cycles across the tile, so
// every stripe meets itself at the left/right edges; stripes are drawn
// three times (y-T, y, y+T) so the top/bottom edges wrap too.
function stripe(r: () => number, y0: number) {
  const k1 = 1 + Math.floor(r() * 2);
  const k2 = 3 + Math.floor(r() * 3);
  const k3 = 6 + Math.floor(r() * 4);
  const a1 = 18 + r() * 26, a2 = 6 + r() * 12, a3 = 2 + r() * 5;
  const p1 = r() * 6.283, p2 = r() * 6.283, p3 = r() * 6.283;
  return (dy: number) => {
    let d = "";
    for (let x = 0; x <= T; x += 8) {
      const t = (x / T) * 6.283;
      const y = y0 + dy + a1 * Math.sin(k1 * t + p1) + a2 * Math.sin(k2 * t + p2) + a3 * Math.sin(k3 * t + p3);
      d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`;
    }
    return d;
  };
}

function buildTile(id: CamoId) {
  const pal = PALETTES[id];
  const r = mulberry32(id === "cryo" ? 4242 : 7171);
  const parts: string[] = [`<rect width='${T}' height='${T}' fill='${pal.base}'/>`];
  const N = 22;
  for (let i = 0; i < N; i++) {
    const f = stripe(r, (i / N) * T + r() * 10);
    const tier = Math.floor(r() * pal.bands.length);
    const w = 5 + r() * 14;
    for (const dy of [-T, 0, T]) {
      const d = f(dy);
      // thick colored band, then a thin bright edge for a metallic read
      parts.push(`<path d='${d}' stroke='${pal.bands[tier]}' stroke-width='${w.toFixed(1)}' fill='none' stroke-linecap='round'/>`);
      if (tier >= 2) parts.push(`<path d='${d}' stroke='${pal.highlight}' stroke-opacity='0.55' stroke-width='1.2' fill='none' transform='translate(0 ${(-w / 3).toFixed(1)})'/>`);
    }
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${T}' height='${T}' viewBox='0 0 ${T} ${T}'>${parts.join("")}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

const TILES: Record<CamoId, string> = { cryo: buildTile("cryo"), toxic: buildTile("toxic") };

export default function CamoTexture({ variant, className = "" }: { variant: CamoId; className?: string }) {
  const pal = PALETTES[variant];
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ backgroundColor: pal.base }}>
      <div
        className="absolute inset-0"
        style={{ backgroundImage: TILES[variant], backgroundSize: `${T}px ${T}px`, transform: "rotate(-8deg) scale(1.25)" }}
      />
      {/* vignette for depth */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(0,0,0,0.65) 100%)" }} />
      {/* one slow sheen sweep */}
      <div
        className="xr-camo-sheen absolute -inset-y-10 left-0 w-1/3"
        style={{ background: `linear-gradient(100deg, transparent, ${pal.sheen}, transparent)` }}
      />
    </div>
  );
}
