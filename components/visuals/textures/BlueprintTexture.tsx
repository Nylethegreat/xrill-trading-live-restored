// Blueprint: an architect's floor plan on blue grid paper -- hatched walls,
// door swings, windows, furniture outlines, dimension lines and a title
// block that reads "XRILL HQ". Original SVG (no traced plan), static so it
// stays calm behind the editor.
const W = 1600, H = 1000;

// Floor-plan frame
const X0 = 260, Y0 = 170, X1 = 1340, Y1 = 810, T = 16;

// [x, y, w, h] wall segments (gaps in between are doorways)
const WALLS: [number, number, number, number][] = [
  [X0, Y0, X1 - X0, T], // top
  [X0, Y1 - T, X1 - X0, T], // bottom
  [X0, Y0, T, Y1 - Y0], // left
  [X1 - T, Y0, T, Y1 - Y0], // right
  [560, Y0 + T, 14, 300], // bath | kitchen
  [X0 + T, 420, 110, 14], // bath bottom (left of door)
  [470, 420, 90, 14], // bath bottom (right of door)
  [560, 640, 14, Y1 - T - 640], // bedroom | hall
  [840, Y0 + T, 14, 270], // kitchen | living (top)
  [840, 540, 14, Y1 - T - 540], // hall | living (bottom)
  [574, 470, 70, 14], // kitchen bottom (left of door)
  [730, 470, 110, 14], // kitchen bottom (right of door)
];

// Door swings: hinge point, radius, start angle (deg), sweep (deg)
const DOORS = [
  { x: 386, y: 434, r: 84, a0: 0, sweep: 90 },
  { x: 644, y: 484, r: 86, a0: 0, sweep: 90 },
  { x: 574, y: 640, r: 66, a0: -90, sweep: -90 },
  { x: 854, y: 456, r: 84, a0: 0, sweep: 90 },
];

// Windows on the outer walls: [x, y, w, h]
const WINDOWS: [number, number, number, number][] = [
  [940, Y0, 120, T],
  [1150, Y0, 110, T],
  [320, Y1 - T, 120, T],
  [960, Y1 - T, 140, T],
  [1150, Y1 - T, 120, T],
  [X1 - T, 300, T, 120],
  [X1 - T, 520, T, 100],
];

const S = "rgba(255,255,255,0.85)";
const S2 = "rgba(255,255,255,0.55)";
const LABEL = "rgba(255,255,255,0.75)";

function arcPath(x: number, y: number, r: number, a0: number, sweep: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const sx = x + r * Math.cos(rad(a0)), sy = y + r * Math.sin(rad(a0));
  const ex = x + r * Math.cos(rad(a0 + sweep)), ey = y + r * Math.sin(rad(a0 + sweep));
  const sweepFlag = sweep > 0 ? 1 : 0;
  return { arc: `M${sx} ${sy} A${r} ${r} 0 0 ${sweepFlag} ${ex} ${ey}`, leaf: `M${x} ${y} L${ex} ${ey}` };
}

// Horizontal dimension chain: ticks at each x, labels centered between them
function HDim({ y, xs, labels }: { y: number; xs: number[]; labels: string[] }) {
  return (
    <g>
      <line x1={xs[0]} y1={y} x2={xs[xs.length - 1]} y2={y} stroke={S2} strokeWidth="1" />
      {xs.map((x, i) => (
        <g key={i}>
          <line x1={x} y1={y - 9} x2={x} y2={y + 9} stroke={S2} strokeWidth="1" />
          <line x1={x - 5} y1={y + 5} x2={x + 5} y2={y - 5} stroke={S} strokeWidth="1.4" />
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={(xs[i] + xs[i + 1]) / 2} y={y - 7} textAnchor="middle" fontSize="13" fill={LABEL} fontFamily="ui-monospace, monospace">
          {l}
        </text>
      ))}
    </g>
  );
}

function VDim({ x, ys, labels }: { x: number; ys: number[]; labels: string[] }) {
  return (
    <g>
      <line x1={x} y1={ys[0]} x2={x} y2={ys[ys.length - 1]} stroke={S2} strokeWidth="1" />
      {ys.map((y, i) => (
        <g key={i}>
          <line x1={x - 9} y1={y} x2={x + 9} y2={y} stroke={S2} strokeWidth="1" />
          <line x1={x - 5} y1={y + 5} x2={x + 5} y2={y - 5} stroke={S} strokeWidth="1.4" />
        </g>
      ))}
      {labels.map((l, i) => {
        const cy = (ys[i] + ys[i + 1]) / 2;
        return (
          <text key={i} x={x - 8} y={cy} textAnchor="middle" fontSize="13" fill={LABEL} fontFamily="ui-monospace, monospace" transform={`rotate(-90 ${x - 8} ${cy})`}>
            {l}
          </text>
        );
      })}
    </g>
  );
}

function Chair({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return <rect x={x - 14} y={y - 11} width="28" height="22" rx="6" fill="none" stroke={S} strokeWidth="1.4" transform={`rotate(${rot} ${x} ${y})`} />;
}

export default function BlueprintTexture({ className = "", idPrefix = "blueprint" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`${p}-bg`} cx="50%" cy="45%" r="80%">
          <stop offset="0%" stopColor="#2f67cf" />
          <stop offset="60%" stopColor="#2152b3" />
          <stop offset="100%" stopColor="#163a86" />
        </radialGradient>
        <pattern id={`${p}-minor`} width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M25 0H0V25" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        </pattern>
        <pattern id={`${p}-major`} width="125" height="125" patternUnits="userSpaceOnUse">
          <path d="M125 0H0V125" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
        </pattern>
        <pattern id={`${p}-hatch`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.75)" strokeWidth="1.6" />
        </pattern>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-bg)`} />
      <rect width={W} height={H} fill={`url(#${p}-minor)`} />
      <rect width={W} height={H} fill={`url(#${p}-major)`} />

      {/* walls */}
      {WALLS.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={`url(#${p}-hatch)`} stroke={S} strokeWidth="1.5" />
      ))}

      {/* windows (break the hatch with three thin panes) */}
      {WINDOWS.map(([x, y, w, h], i) => {
        const horiz = w > h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill="#2459bf" stroke={S} strokeWidth="1.4" />
            {horiz ? (
              <path d={`M${x} ${y + h / 2 - 3}H${x + w} M${x} ${y + h / 2 + 3}H${x + w}`} stroke={S} strokeWidth="1" />
            ) : (
              <path d={`M${x + w / 2 - 3} ${y}V${y + h} M${x + w / 2 + 3} ${y}V${y + h}`} stroke={S} strokeWidth="1" />
            )}
          </g>
        );
      })}

      {/* door swings */}
      {DOORS.map((d, i) => {
        const { arc, leaf } = arcPath(d.x, d.y, d.r, d.a0, d.sweep);
        return (
          <g key={i}>
            <path d={arc} fill="none" stroke={S2} strokeWidth="1.2" strokeDasharray="4 4" />
            <path d={leaf} fill="none" stroke={S} strokeWidth="2" />
          </g>
        );
      })}

      {/* bathroom: double vanity, shower, toilet */}
      <g fill="none" stroke={S} strokeWidth="1.4">
        <rect x="292" y="200" width="130" height="56" rx="6" />
        <ellipse cx="325" cy="228" rx="22" ry="16" />
        <ellipse cx="389" cy="228" rx="22" ry="16" />
        <rect x="462" y="200" width="82" height="82" />
        {[0, 1, 2].flatMap((a) => [0, 1, 2].map((b) => <circle key={`${a}${b}`} cx={483 + a * 20} cy={221 + b * 20} r="2" fill={S} stroke="none" />))}
        <rect x="500" y="356" width="32" height="20" rx="4" />
        <ellipse cx="516" cy="394" rx="16" ry="20" />
      </g>

      {/* kitchen: counters, stove, sink, round table */}
      <g fill="none" stroke={S} strokeWidth="1.4">
        <path d="M590 200 H822 V300 H780 V242 H590 Z" />
        <rect x="608" y="208" width="44" height="26" rx="4" />
        {[0, 1].flatMap((a) => [0, 1].map((b) => <circle key={`${a}${b}`} cx={790 + a * 20} cy={222 + b * 26} r="7" />))}
        <circle cx="705" cy="380" r="54" />
      </g>

      {/* living: dining table + chairs, sofa, armchairs, coffee table, TV */}
      <g fill="none" stroke={S} strokeWidth="1.4">
        <rect x="1040" y="250" width="90" height="190" rx="3" />
        <Chair x={1022} y={290} rot={90} />
        <Chair x={1022} y={350} rot={90} />
        <Chair x={1022} y={410} rot={90} />
        <Chair x={1148} y={290} rot={90} />
        <Chair x={1148} y={350} rot={90} />
        <Chair x={1148} y={410} rot={90} />
        <Chair x={1085} y={232} />
        <Chair x={1085} y={458} />
        <rect x="900" y="600" width="64" height="170" rx="8" />
        <path d="M918 600 V770 M918 657 H964 M918 714 H964" />
        <rect x="1045" y="560" width="56" height="50" rx="6" />
        <rect x="1125" y="560" width="56" height="50" rx="6" />
        <rect x="1060" y="648" width="100" height="100" />
        <path d="M1060 648 L1160 748 M1160 648 L1060 748" />
      </g>
      <rect x="1300" y="640" width="8" height="120" fill="rgba(255,255,255,0.9)" />

      {/* bedroom: bed with pillows, wardrobe */}
      <g fill="none" stroke={S} strokeWidth="1.4">
        <rect x="320" y="620" width="176" height="150" rx="4" />
        <rect x="452" y="636" width="34" height="54" rx="8" />
        <rect x="452" y="700" width="34" height="54" rx="8" />
        <path d="M420 620 V770" strokeDasharray="5 4" />
        <rect x="290" y="452" width="44" height="130" />
        <path d="M290 452 L334 582 M334 452 L290 582" />
      </g>

      {/* compass */}
      <g transform="translate(1460 260)" fill="none" stroke={S} strokeWidth="1.4">
        <circle r="34" />
        <path d="M0 -44 L8 0 L0 44 L-8 0 Z" />
        <path d="M-44 0 L0 -6 L44 0 L0 6 Z" stroke={S2} />
        <text y="-52" textAnchor="middle" fontSize="14" fill={LABEL} stroke="none" fontFamily="ui-monospace, monospace">N</text>
      </g>

      {/* dimension chains */}
      <HDim y={112} xs={[X0, X1]} labels={["1080"]} />
      <HDim y={140} xs={[X0, 560, 840, X1]} labels={["300", "280", "500"]} />
      <HDim y={862} xs={[X0, 560, 840, X1]} labels={["300", "280", "500"]} />
      <VDim x={200} ys={[Y0, 427, Y1]} labels={["257", "383"]} />
      <VDim x={1410} ys={[Y0, 300, 420, 520, 620, Y1]} labels={["130", "120", "100", "100", "190"]} />
      <VDim x={1450} ys={[Y0, Y1]} labels={["640"]} />

      {/* title block */}
      <g transform="translate(1250 900)" fontFamily="ui-monospace, monospace">
        <rect width="310" height="78" fill="none" stroke={S} strokeWidth="1.5" />
        <path d="M0 30 H310 M0 54 H310 M170 30 V78" stroke={S2} strokeWidth="1" />
        <text x="12" y="21" fontSize="15" fontWeight="700" fill="rgba(255,255,255,0.92)" letterSpacing="3">XRILL HQ · BLUEPRINT</text>
        <text x="12" y="47" fontSize="11" fill={LABEL}>SHEET A-01</text>
        <text x="182" y="47" fontSize="11" fill={LABEL}>SCALE 1:50</text>
        <text x="12" y="71" fontSize="11" fill={LABEL}>DRAWN BY: YOU</text>
        <text x="182" y="71" fontSize="11" fill={LABEL}>REV: SAVEPOINT</text>
      </g>
    </svg>
  );
}
