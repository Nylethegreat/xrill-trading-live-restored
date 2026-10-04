import CandlestickGlow from "./CandlestickGlow";

// The counterweight to the blue/green candles up top: the same glowing
// candlestick pattern, in red, sitting along the bottom of every page and
// fading up into the content. Mirrored so it trends DOWN — a quiet
// reminder at the end of every scroll that red days are part of the deal.
// Absolute (not fixed), so it lives at the bottom of the page rather than
// following you around; non-interactive and behind all content.
export default function RedRealityBand() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[340px] overflow-hidden opacity-[0.55] sm:h-[420px]"
      style={{
        maskImage: "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
      }}
    >
      <div className="h-full w-full -scale-x-100">
        <CandlestickGlow variant="banner" palette="red" showReadout={false} className="h-full w-full" />
      </div>
    </div>
  );
}
