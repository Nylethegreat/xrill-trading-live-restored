import CandlestickGlow from "./CandlestickGlow";

// Sits behind every page (mounted once in app/layout.tsx). Fixed, full-bleed,
// non-interactive, and dim enough to never fight with foreground text —
// the "digital sanctuary" trading-terminal mood the reference art asked for,
// applied site-wide rather than one page at a time.
export default function TerminalBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.35]" aria-hidden="true">
      <CandlestickGlow variant="backdrop" className="h-full w-full" />
    </div>
  );
}
