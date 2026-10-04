import { scrollColor, type ScrollColorId } from "@/lib/data/scrollColors";

// Full-page scroll backdrop: an aged, fibrous sheet hung between two rolled
// rods with gold end-caps and a corded tassel. Original CSS/SVG artwork.
// The sheet is dyed (see lib/data/scrollColors.ts) and stays dark, so
// white page text stays readable; the "alien lake" dyes slowly shift and
// glow. Fixed + non-interactive; the parent decides placement.

// Paper grain: fractal noise tinted warm, layered over the dye.
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.85  0 0 0 0 0.72  0 0 0 0 0.5  0 0 0 0.22 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
)}")`;

// Long horizontal fibers.
const FIBERS = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='300'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.005 0.09' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.75  0 0 0 0.10 0'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>"
)}")`;

function Roll({ color, position }: { color: [string, string]; position: "top" | "bottom" }) {
  const [hi, lo] = color;
  return (
    <div
      className={`absolute left-[1vw] right-[1vw] h-9 rounded-full sm:h-11 ${position === "top" ? "top-[60px]" : "bottom-2"}`}
      style={{
        background: `linear-gradient(180deg, ${lo} 0%, ${hi} 28%, ${hi} 38%, ${lo} 75%, #000 100%)`,
        boxShadow: "0 6px 14px rgba(0,0,0,0.55), inset 0 -2px 4px rgba(0,0,0,0.5)",
      }}
    >
      {/* gold end caps */}
      {["left", "right"].map((side) => (
        <span
          key={side}
          className={`absolute top-1/2 h-11 w-11 -translate-y-1/2 rounded-full sm:h-14 sm:w-14 ${side === "left" ? "-left-3" : "-right-3"}`}
          style={{
            background: "radial-gradient(circle at 35% 30%, #fff7d1 0%, #f5c84b 25%, #b07d12 60%, #4a3005 100%)",
            boxShadow: "0 3px 10px rgba(0,0,0,0.6)",
          }}
        />
      ))}
    </div>
  );
}

export default function ScrollTexture({ colorId, className = "" }: { colorId: ScrollColorId; className?: string }) {
  const c = scrollColor(colorId);
  const dye = `linear-gradient(115deg, ${c.body.join(", ")})`;
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#050506] ${className}`}>
      {/* the sheet */}
      <div
        className={`absolute inset-x-[3vw] bottom-7 top-[78px] sm:bottom-9 sm:top-[82px] ${c.animated ? "xr-dye-shift xr-dye-glow" : ""}`}
        style={{
          backgroundImage: `${GRAIN}, ${FIBERS}, radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%), ${dye}`,
          backgroundSize: c.animated ? "240px 240px, 600px 300px, 100% 100%, 400% 400%" : "240px 240px, 600px 300px, 100% 100%, 100% 100%",
          ["--xr-glow" as string]: c.glow ?? "transparent",
          boxShadow: c.animated ? undefined : "0 0 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* soft edge burn on the left/right */}
        <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/50 to-transparent" />
        {c.animated && <div className="xr-dye-sheen absolute inset-0" />}
      </div>
      <Roll color={c.roll} position="top" />
      <Roll color={c.roll} position="bottom" />
      {/* hanging cord + tassel from the top-left cap */}
      <svg className="absolute left-[1vw] top-[84px] h-40 w-10 sm:top-[90px]" viewBox="0 0 40 160">
        <path d="M14 0 C10 40 22 70 16 110" stroke="#c9a14a" strokeWidth="3" fill="none" />
        <path d="M20 0 C24 36 14 66 22 104" stroke="#a8812f" strokeWidth="3" fill="none" />
        <circle cx="19" cy="108" r="5" fill="#d4a83a" />
        {[-6, -3, 0, 3, 6].map((dx) => (
          <path key={dx} d={`M19 112 L${19 + dx} 148`} stroke="#c9a14a" strokeWidth="1.6" />
        ))}
      </svg>
    </div>
  );
}
