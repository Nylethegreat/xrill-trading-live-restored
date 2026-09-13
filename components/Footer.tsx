import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-background/60 px-4 py-6 text-xs leading-relaxed text-white/40">
      <div className="mx-auto max-w-5xl space-y-3">
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
