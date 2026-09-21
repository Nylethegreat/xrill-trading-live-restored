import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-background/60 px-4 py-6 text-xs leading-relaxed text-white/40">
      {/* Liquid neon pool — two blurred radial blobs tiled end-to-end,
          drifting via animate-liquid-drift (-50% loop, same trick as the
          wins ticker / ekg scroll). Purely decorative, sits behind the
          text (z-0), low opacity so the disclaimer stays fully readable. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-10 overflow-hidden opacity-30">
        <div className="motion-safe:animate-liquid-drift flex h-full w-[200%]">
          {[0, 1].map((i) => (
            <div key={i} className="flex h-full w-1/2 items-end">
              <div
                className="h-6 w-full blur-xl"
                style={{
                  background:
                    "repeating-radial-gradient(circle at 10% 80%, rgba(34,197,94,0.9) 0px, transparent 60px), repeating-radial-gradient(circle at 35% 60%, rgba(34,197,94,0.7) 0px, transparent 70px), repeating-radial-gradient(circle at 65% 85%, rgba(34,197,94,0.8) 0px, transparent 55px), repeating-radial-gradient(circle at 90% 65%, rgba(34,197,94,0.6) 0px, transparent 65px)",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-3">
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
}
