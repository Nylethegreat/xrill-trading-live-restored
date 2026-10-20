// Shared palm silhouette for the Miami backdrops (Bayside Villa, Miami
// Nights). A curved trunk plus feathered fronds; fronds sway via
// .xr-palm-sway (globals.css). Pure SVG, no filters, so it stays cheap.
export function Palm({
  x,
  baseY,
  h,
  lean,
  scale = 1,
  trunk = "#5a4a36",
  frond = "#2f6b3c",
  rib = "#24502e",
  i = 0,
}: {
  x: number;
  baseY: number;
  h: number;
  lean: number;
  scale?: number;
  trunk?: string;
  frond?: string;
  rib?: string;
  i?: number;
}) {
  const topX = x + lean * h;
  const topY = baseY - h;
  const tw = 16 * scale;
  const fronds = 10;
  return (
    <g>
      <path
        d={`M${x - tw / 2} ${baseY} Q${x + lean * h * 0.55} ${baseY - h * 0.5} ${topX - tw * 0.3} ${topY} L${topX + tw * 0.3} ${topY} Q${x + lean * h * 0.55 + tw} ${baseY - h * 0.5} ${x + tw / 2} ${baseY}Z`}
        fill={trunk}
      />
      <g className="xr-palm-sway" style={{ transformOrigin: `${topX}px ${topY}px`, animationDuration: `${5 + (i % 4)}s`, animationDelay: `-${i * 0.8}s` }}>
        {Array.from({ length: fronds }, (_, k) => {
          const a = Math.PI * 0.92 + (k / (fronds - 1)) * Math.PI * 1.16;
          const len = 170 * scale * (0.8 + ((k * 7) % 5) / 12);
          const ex = topX + Math.cos(a) * len;
          const ey = topY + Math.sin(a) * len * 0.45 + len * 0.45;
          const cx = topX + Math.cos(a) * len * 0.55;
          const cy = topY + Math.sin(a) * len * 0.7 - 12 * scale;
          const leaflets: string[] = [];
          for (let t = 0.12; t < 0.98; t += 0.06) {
            const qx = (1 - t) * (1 - t) * topX + 2 * (1 - t) * t * cx + t * t * ex;
            const qy = (1 - t) * (1 - t) * topY + 2 * (1 - t) * t * cy + t * t * ey;
            const L = 38 * scale * (1 - t * 0.7);
            for (const side of [-1, 1]) {
              const dx = Math.cos(a + side * 0.9) * L * 0.5;
              leaflets.push(`M${qx.toFixed(1)} ${qy.toFixed(1)} l${dx.toFixed(1)} ${(L * 0.85).toFixed(1)}`);
            }
          }
          return (
            <g key={k}>
              <path d={leaflets.join(" ")} stroke={frond} strokeWidth={3.4 * scale} strokeLinecap="round" fill="none" />
              <path d={`M${topX} ${topY} Q${cx} ${cy} ${ex} ${ey}`} stroke={rib} strokeWidth={3.4 * scale} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
        <circle cx={topX} cy={topY + 4} r={7 * scale} fill={trunk} />
      </g>
    </g>
  );
}
