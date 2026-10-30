import { mulberry32 } from "./seeded";

// Holo Head: a low-poly wireframe head in teal light, cranium studded with
// glowing nodes, eyes lit, standing in front of a circuit board. Original
// SVG -- the mesh is generated here (seeded points + a small Delaunay
// triangulation), so it renders the same on server and client. Motion via
// the .xr-holo-* classes in app/globals.css; still under reduced motion.
const W = 1600, H = 1000;
const CX = 800;
const TOP = 70; // y of the crown

// Half-width of the head/neck/collar at a given depth below the crown.
const PROFILE: [number, number][] = [
  [0, 0], [12, 62], [35, 105], [70, 135], [120, 152], [180, 158], [230, 154],
  [255, 150], [262, 172], [290, 180], [330, 172], [352, 150],
  [390, 136], [430, 118], [470, 96], [505, 78], [530, 70],
  [560, 72], [610, 78], [640, 110], [680, 190], [720, 250], [760, 268],
];
const BOTTOM = PROFILE[PROFILE.length - 1][0];

function halfWidth(d: number) {
  for (let i = 1; i < PROFILE.length; i++) {
    const [d1, w1] = PROFILE[i];
    const [d0, w0] = PROFILE[i - 1];
    if (d <= d1) return w0 + ((w1 - w0) * (d - d0)) / (d1 - d0);
  }
  return PROFILE[PROFILE.length - 1][1];
}

function inside(x: number, y: number, slack = 0) {
  const d = y - TOP;
  if (d < 0 || d > BOTTOM) return false;
  return Math.abs(x - CX) <= halfWidth(d) + slack;
}

type Pt = { x: number; y: number };

const MESH = (() => {
  const r = mulberry32(7707);
  const pts: Pt[] = [];
  // Outline
  for (let d = 0; d <= BOTTOM; d += 16) {
    const w = halfWidth(d);
    pts.push({ x: CX - w, y: TOP + d });
    if (w > 0.5) pts.push({ x: CX + w, y: TOP + d });
  }
  pts.push({ x: CX - 268, y: TOP + BOTTOM }, { x: CX + 268, y: TOP + BOTTOM });
  // Interior: jittered grid, mirrored for symmetry
  for (let d = 8; d < BOTTOM; d += 24) {
    for (let dx = 0; dx < 270; dx += 26) {
      const jx = (r() - 0.5) * 16;
      const jy = (r() - 0.5) * 14;
      const y = TOP + d + jy;
      const off = dx + jx;
      if (off < 4) {
        if (inside(CX, y, -6)) pts.push({ x: CX, y });
        continue;
      }
      if (inside(CX + off, y, -6)) {
        pts.push({ x: CX + off, y }, { x: CX - off, y });
      }
    }
  }
  // Face detail: brows, eyes, nose, lips, chin (dense points = finer triangles)
  const face: Pt[] = [];
  for (let t = 0; t <= 1; t += 0.25) {
    face.push({ x: 30 + t * 60, y: 268 - Math.sin(t * Math.PI) * 10 }); // brow
    face.push({ x: 32 + t * 52, y: 300 - Math.sin(t * Math.PI) * 9 }); // upper lid
    face.push({ x: 34 + t * 48, y: 300 + Math.sin(t * Math.PI) * 7 }); // lower lid
    face.push({ x: 26 + t * 34, y: 432 + Math.sin(t * Math.PI) * 6 }); // lips
  }
  face.push({ x: 8, y: 330 }, { x: 12, y: 365 }, { x: 22, y: 392 }, { x: 30, y: 400 }, { x: 0, y: 404 }, { x: 0, y: 470 }, { x: 22, y: 488 });
  for (const f of face) {
    pts.push({ x: CX + f.x, y: TOP + f.y });
    if (f.x > 0) pts.push({ x: CX - f.x, y: TOP + f.y });
  }
  return { pts, tris: delaunay(pts).filter(([a, b, c]) => inside((pts[a].x + pts[b].x + pts[c].x) / 3, (pts[a].y + pts[b].y + pts[c].y) / 3, 2)) };
})();

// Unique edges of the triangulation, drawn as one path.
const EDGE_PATH = (() => {
  const seen = new Set<string>();
  let d = "";
  for (const [a, b, c] of MESH.tris) {
    for (const [i, j] of [[a, b], [b, c], [c, a]]) {
      const k = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const p = MESH.pts[i], q = MESH.pts[j];
      d += `M${p.x.toFixed(1)} ${p.y.toFixed(1)}L${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    }
  }
  return d;
})();

// Glowing nodes across the cranium.
const NODES = (() => {
  const r = mulberry32(4411);
  return MESH.pts
    .filter((p) => p.y < TOP + 240 && inside(p.x, p.y, -8))
    .filter(() => r() > 0.25)
    .map((p) => ({ ...p, d: (r() * 4).toFixed(2), s: 5 + r() * 3 }));
})();

// Circuit traces: run out from near the head toward the edges with one
// 45-degree jog, ending in a pad.
const TRACES = (() => {
  const r = mulberry32(9090);
  const out: { d: string; end: Pt; o: number; delay: string }[] = [];
  for (let i = 0; i < 90; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const y0 = 30 + r() * 940;
    const x0 = CX + side * (300 + r() * 120);
    const run1 = 60 + r() * 200;
    const jog = (r() - 0.5) * 160;
    const x1 = x0 + side * run1;
    const x2 = x1 + side * Math.abs(jog);
    const y2 = y0 + jog;
    const x3 = side < 0 ? Math.max(20, x2 - (80 + r() * 420)) : Math.min(1580, x2 + 80 + r() * 420);
    out.push({ d: `M${x0.toFixed(0)} ${y0.toFixed(0)}H${x1.toFixed(0)}L${x2.toFixed(0)} ${y2.toFixed(0)}H${x3.toFixed(0)}`, end: { x: x3, y: y2 }, o: 0.25 + r() * 0.35, delay: (r() * 6).toFixed(2) });
  }
  return out;
})();
const PADS = Array.from({ length: 40 }, (_, i) => {
  const r = mulberry32(300 + i);
  return { x: (i % 2 ? 1100 : 60) + r() * 440, y: 40 + r() * 920, w: 8 + r() * 18 };
});

export default function HoloHeadTexture({ className = "", idPrefix = "holo" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`${p}-bg`} cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#1f6f6f" />
          <stop offset="40%" stopColor="#0e3b3f" />
          <stop offset="100%" stopColor="#041314" />
        </radialGradient>
        <radialGradient id={`${p}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e6fffb" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#5eead4" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${p}-eye`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#f0abfc" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#67e8f9" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
        </radialGradient>
        <filter id={`${p}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-bg)`} />

      <g fill="none" stroke="#2dd4bf" strokeWidth="3" strokeLinejoin="round">
        {TRACES.map((t, i) => (
          <g key={i} opacity={t.o}>
            <path d={t.d} />
            <circle cx={t.end.x} cy={t.end.y} r="6" fill="#0e3b3f" />
          </g>
        ))}
        {TRACES.filter((_, i) => i % 6 === 0).map((t, i) => (
          <path key={`f${i}`} className="xr-holo-flow" style={{ animationDelay: `${t.delay}s` }} d={t.d} stroke="#a5f3fc" strokeWidth="2.5" strokeDasharray="14 220" opacity="0.8" />
        ))}
      </g>
      {PADS.map((pd, i) => (
        <rect key={i} x={pd.x} y={pd.y} width={pd.w} height={pd.w} rx="2" fill="#2dd4bf" opacity="0.22" />
      ))}

      <ellipse className="xr-holo-breathe" cx={CX} cy={TOP + 170} rx="330" ry="300" fill={`url(#${p}-halo)`} />

      <path d={EDGE_PATH} fill="none" stroke="#5eead4" strokeWidth="1.3" opacity="0.9" />
      <path d={EDGE_PATH} fill="none" stroke="#99f6e4" strokeWidth="3" opacity="0.12" />

      <g filter={`url(#${p}-glow)`}>
        {NODES.map((n, i) => (
          <circle key={i} className="xr-holo-node" style={{ animationDelay: `${n.d}s` }} cx={n.x} cy={n.y} r={n.s} fill="#a5f3fc" stroke="#ecfeff" strokeWidth="1.5" />
        ))}
      </g>

      {[-1, 1].map((s) => (
        <circle key={s} className="xr-holo-eye" cx={CX + s * 58} cy={TOP + 298} r="26" fill={`url(#${p}-eye)`} />
      ))}
    </svg>
  );
}

// Bowyer-Watson Delaunay triangulation. Returns index triples into pts.
function delaunay(pts: Pt[]): [number, number, number][] {
  const big = 1e5;
  const all = [...pts, { x: -big, y: -big }, { x: big * 2, y: -big }, { x: 0, y: big * 2 }];
  const n = pts.length;
  type Tri = { a: number; b: number; c: number; cx: number; cy: number; r2: number };
  const make = (a: number, b: number, c: number): Tri => {
    const A = all[a], B = all[b], C = all[c];
    const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
    const ux = ((A.x * A.x + A.y * A.y) * (B.y - C.y) + (B.x * B.x + B.y * B.y) * (C.y - A.y) + (C.x * C.x + C.y * C.y) * (A.y - B.y)) / d;
    const uy = ((A.x * A.x + A.y * A.y) * (C.x - B.x) + (B.x * B.x + B.y * B.y) * (A.x - C.x) + (C.x * C.x + C.y * C.y) * (B.x - A.x)) / d;
    return { a, b, c, cx: ux, cy: uy, r2: (A.x - ux) ** 2 + (A.y - uy) ** 2 };
  };
  let tris: Tri[] = [make(n, n + 1, n + 2)];
  for (let i = 0; i < n; i++) {
    const P = all[i];
    const bad: Tri[] = [];
    const keep: Tri[] = [];
    for (const t of tris) ((P.x - t.cx) ** 2 + (P.y - t.cy) ** 2 < t.r2 ? bad : keep).push(t);
    const edges = new Map<string, [number, number]>();
    for (const t of bad) {
      for (const [u, v] of [[t.a, t.b], [t.b, t.c], [t.c, t.a]] as [number, number][]) {
        const k = u < v ? `${u}-${v}` : `${v}-${u}`;
        if (edges.has(k)) edges.delete(k);
        else edges.set(k, [u, v]);
      }
    }
    for (const [u, v] of edges.values()) keep.push(make(u, v, i));
    tris = keep;
  }
  return tris.filter((t) => t.a < n && t.b < n && t.c < n).map((t) => [t.a, t.b, t.c]);
}
