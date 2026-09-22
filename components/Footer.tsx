import Link from "next/link";

export default function Footer() {
  return (
<<<<<<< ours
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-background/60 px-4 py-6 text-xs leading-relaxed text-white/40">
      {/* Liquid lava footer -- reverted from an orange trial back to green
          per feedback, now with more layered detail: three blob layers at
          different sizes/speeds/opacities drifting past each other
          (animate-liquid-drift, -50% loop) plus a slow overall brightness
          breathe (animate-candle-pulse) for a "lava lamp" feel. The orange
          version lives in git history (patch 0010) if we ever want it
          back -- `git log -p -- components/Footer.tsx`. Purely decorative,
          z-0/low-opacity so the disclaimer stays fully readable. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-12 overflow-hidden opacity-35 motion-safe:animate-candle-pulse">
        <div className="motion-safe:animate-liquid-drift flex h-full w-[200%]">
          {[0, 1].map((i) => (
            <div key={i} className="flex h-full w-1/2 items-end">
              <div
                className="h-8 w-full blur-xl"
                style={{
                  background:
                    "repeating-radial-gradient(circle at 8% 85%, rgba(34,197,94,0.95) 0px, transparent 55px), repeating-radial-gradient(circle at 30% 55%, rgba(74,222,128,0.75) 0px, transparent 75px), repeating-radial-gradient(circle at 55% 80%, rgba(16,185,129,0.85) 0px, transparent 60px), repeating-radial-gradient(circle at 78% 60%, rgba(134,239,172,0.6) 0px, transparent 70px), repeating-radial-gradient(circle at 95% 82%, rgba(21,128,61,0.8) 0px, transparent 50px)",
                }}
              />
            </div>
          ))}
        </div>
        {/* second, slower/smaller layer offset in time for depth */}
        <div className="absolute inset-0 motion-safe:animate-liquid-drift-slow flex h-full w-[200%] opacity-70">
          {[0, 1].map((i) => (
            <div key={i} className="flex h-full w-1/2 items-end">
              <div
                className="h-4 w-full blur-md"
                style={{
                  background:
                    "repeating-radial-gradient(circle at 20% 90%, rgba(187,247,208,0.7) 0px, transparent 40px), repeating-radial-gradient(circle at 60% 88%, rgba(74,222,128,0.6) 0px, transparent 45px)",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-3">
=======
    <footer className="mt-16 border-t border-white/10 bg-background/60 px-4 py-6 text-xs leading-relaxed text-white/40">
      <div className="mx-auto max-w-5xl space-y-3">
>>>>>>> theirs
        <p>
          <strong className="text-white/60">Educational content only — not investment advice.</strong> XRILL is a
          trade-planning and journaling tool. Nothing on this site — including any trade alert, XRILL score, or
          setup grade — is a recommendation to buy or sell any security, option, or other financial instrument, and
          none of it constitutes personalized investment advice.
        </p>
        <p>
          Hypothetical and simulated performance results have inherent limitations and do not represent actual
          trading — see the full{" "}
          <Link href="/disclaimer" className="underline hover:text-white/70">
            Disclaimer
          </Link>{" "}
          for the required CFTC Rule 4.41 disclosure. Trading involves substantial risk of loss and is not suitable
          for every investor.
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 pt-3">
          <Link href="/disclaimer" className="hover:text-white/70">Disclaimer</Link>
          <Link href="/terms" className="hover:text-white/70">Terms of Service</Link>
          <Link href="/glossary" className="hover:text-white/70">Glossary</Link>
          <Link href="/about" className="hover:text-white/70">About</Link>
          <span className="text-white/25">© {new Date().getFullYear()} XRILL Trading Operating System</span>
        </div>
      </div>
    </footer>
  );
<<<<<<< ours
}
=======
}).
>>>>>>> theirs
