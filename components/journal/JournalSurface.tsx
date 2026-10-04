"use client";

import { usePersistentChoice } from "@/lib/usePersistentChoice";
import { SCROLL_COLOR_IDS, type ScrollColorId } from "@/lib/data/scrollColors";
import BackdropChooser, { type BackdropOption } from "@/components/visuals/BackdropChooser";
import ScrollTexture from "@/components/visuals/textures/ScrollTexture";

// The journal's writing surface (remembered per browser):
//  - Midnight: the original dark journal
//  - Notebook: off-white lined paper torn out of a notebook (jagged top + left)
//  - Parchment: bleached, age-yellowed historical sheet with burnt, ragged
//    edges and ornate corners
//  - Scroll: the dyed scroll (8 colors) behind the whole page
// Paper themes wrap the content in .paper-ink (globals.css), which flips the
// site's white-on-dark classes to ink-on-paper inside the sheet only.

type JournalBg = "midnight" | "notebook" | "parchment" | "scroll";
const IDS: readonly JournalBg[] = ["midnight", "notebook", "parchment", "scroll"];

const OPTIONS: BackdropOption<JournalBg>[] = [
  { id: "midnight", label: "Midnight", swatch: "#0d0f1a" },
  { id: "notebook", label: "Notebook Paper", swatch: "repeating-linear-gradient(180deg,#f2f0e6 0 3px,#94a3b8 3px 4px)" },
  { id: "parchment", label: "Aged Parchment", swatch: "radial-gradient(circle,#f3e2b3,#b8894a)" },
  { id: "scroll", label: "Ancient Scroll", swatch: "linear-gradient(135deg,#b88a4f,#2e2112)" },
];

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

// Deterministic ragged-edge clip path. `amp` is the tear depth in px per
// edge [top, right, bottom, left]; 0 = straight edge.
function raggedClip(seed: number, amp: [number, number, number, number], steps = 48) {
  const r = mulberry32(seed);
  const pts: string[] = [];
  const j = (a: number) => (a ? (r() * a).toFixed(1) : "0");
  for (let i = 0; i <= steps; i++) pts.push(`${((i / steps) * 100).toFixed(2)}% ${j(amp[0])}px`);
  for (let i = 1; i <= steps; i++) pts.push(`calc(100% - ${j(amp[1])}px) ${((i / steps) * 100).toFixed(2)}%`);
  for (let i = steps - 1; i >= 0; i--) pts.push(`${((i / steps) * 100).toFixed(2)}% calc(100% - ${j(amp[2])}px)`);
  for (let i = steps - 1; i >= 1; i--) pts.push(`${j(amp[3])}px ${((i / steps) * 100).toFixed(2)}%`);
  return `polygon(${pts.join(", ")})`;
}

const NOTEBOOK_CLIP = raggedClip(11, [12, 0, 0, 10]);
const PARCHMENT_CLIP = raggedClip(29, [9, 8, 10, 8], 64);

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.15  0 0 0 0.16 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
)}")`;
const STAINS = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='700' height='700'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.006' numOctaves='3'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.1  0 0 0 -1.6 0.9'/></filter><rect width='100%' height='100%' filter='url(#s)'/></svg>"
)}")`;

function Flourish({ className }: { className: string }) {
  // an original corner ornament: a scroll curl with a leaf and a dot
  return (
    <svg viewBox="0 0 80 80" className={`pointer-events-none absolute h-14 w-14 text-[#6b4a1f] sm:h-20 sm:w-20 ${className}`} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.75">
        <path d="M6 74 V18 C6 10 12 6 18 6 H74" />
        <path d="M12 68 V24 C12 16 16 12 24 12 H68" strokeWidth="0.9" />
        <path d="M22 22 C34 18 40 28 32 34 C26 38 20 32 26 28" />
        <path d="M40 12 C44 20 52 22 58 18" />
        <path d="M12 40 C20 44 22 52 18 58" />
      </g>
      <circle cx="26" cy="28" r="2.2" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export default function JournalSurface({ children }: { children: React.ReactNode }) {
  const [bg, setBg, hydrated] = usePersistentChoice<JournalBg>("xrill-journal-bg", IDS, "midnight");
  const [dye, setDye] = usePersistentChoice<ScrollColorId>("xrill-journal-scroll", SCROLL_COLOR_IDS, "sepia");
  const theme = hydrated ? bg : "midnight";

  const chooser = (
    <div className="relative mt-5">
      <BackdropChooser label="Paper" options={OPTIONS} value={bg} onChange={setBg} scrollValue={dye} onScrollChange={setDye} scrollId="scroll" />
    </div>
  );

  if (theme === "notebook") {
    return (
      <>
        {chooser}
        {/* paper lives in its own absolutely-positioned layer (clip + shadow
            there), so fixed-position overlays inside the content — like the
            screenshot lightbox — aren't clipped or re-anchored by it */}
        <div className="paper-ink relative mt-6 px-5 pb-10 pl-12 pt-8 sm:pl-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 drop-shadow-[0_10px_24px_rgba(0,0,0,0.6)]">
          <div
            className="absolute inset-0"
            style={{
              clipPath: NOTEBOOK_CLIP,
              backgroundColor: "#efede3",
              backgroundImage: `${GRAIN}, linear-gradient(90deg, transparent 38px, rgba(239,68,68,0.45) 38px, rgba(239,68,68,0.45) 40px, transparent 40px), repeating-linear-gradient(180deg, transparent 0, transparent 31px, rgba(100,116,139,0.32) 31px, rgba(100,116,139,0.32) 32px)`,
              backgroundPosition: "0 0, 0 0, 0 14px",
            }}
          />
          </div>
          {children}
        </div>
      </>
    );
  }

  if (theme === "parchment") {
    return (
      <>
        {chooser}
        <div className="paper-ink relative mt-6 px-6 pb-12 pt-10 sm:px-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 drop-shadow-[0_10px_28px_rgba(0,0,0,0.7)]">
          <div
            className="absolute inset-0"
            style={{
              clipPath: PARCHMENT_CLIP,
              backgroundColor: "#e9d6a6",
              backgroundImage: `${GRAIN}, ${STAINS}, radial-gradient(ellipse at 50% 45%, #f6e9c4 0%, #ead5a2 45%, #cfa968 82%, #8a5f2a 100%)`,
            }}
          />
          </div>
            {/* thin double rule just inside the edge */}
            <div className="pointer-events-none absolute inset-4 border border-[#6b4a1f]/30 sm:inset-6" />
            <div className="pointer-events-none absolute inset-5 border border-[#6b4a1f]/20 sm:inset-7" />
            <Flourish className="left-2 top-2 sm:left-3 sm:top-3" />
            <Flourish className="right-2 top-2 -scale-x-100 sm:right-3 sm:top-3" />
            <Flourish className="bottom-2 left-2 -scale-y-100 sm:bottom-3 sm:left-3" />
            <Flourish className="bottom-2 right-2 -scale-100 sm:bottom-3 sm:right-3" />
            <div className="relative">{children}</div>
        </div>
      </>
    );
  }

  return (
    <>
      {theme === "scroll" && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20">
          <ScrollTexture colorId={dye} />
        </div>
      )}
      {chooser}
      <div className={theme === "scroll" ? "relative px-2 sm:px-4" : "relative"}>{children}</div>
    </>
  );
}
