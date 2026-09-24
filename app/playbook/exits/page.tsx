const SECTIONS = [
  {
    title: "Structure-First Exits",
    tone: "primary",
    points: [
      "Exit at structural supply/demand magnets and key levels — prior highs/lows, VWAP bands, round numbers — not at an arbitrary percentage gain.",
      "Never hold past a level you already identified as a target just to chase a bigger number. If price reaches the magnet, that's the plan working, not a reason to get greedy.",
      "The \"arbitrary 200% gain\" trap: a contract can look explosive on paper while the underlying is stalling right into resistance. Structure decides the exit, not the P/L percentage on your screen.",
    ],
  },
  {
    title: "Hybrid Scaling Out",
    tone: "secondary",
    points: [
      "Scale 50% off at Target 1 — this locks in a realized win and de-risks the trade to (at worst) a scratch on the remaining size.",
      "Move the remaining runner's stop to break-even (or a trailing stop once it's working), so it can breathe toward a larger structural target stress-free.",
      "This hybrid approach captures the discipline of a fixed target and the upside of a trend-following runner, without needing to guess which one the trade will turn into ahead of time.",
    ],
  },
  {
    title: "Risk vs. Reward Realities",
    tone: "caution",
    points: [
      "Option pricing is non-linear — Delta and Gamma mean a contract doesn't move dollar-for-dollar with the stock, and that curve steepens as expiration approaches.",
      "Theta decay is a constant headwind for long premium: the same stock move produces a smaller option gain the closer you are to expiration, all else equal.",
      "Shorter-dated contracts amplify both Gamma (bigger swings) and Theta (faster decay) — great for a fast-moving thesis, brutal if the move takes longer than expected. Swing-dated contracts (30–45 DTE) trade some of that acceleration for time to be right.",
    ],
  },
  {
    title: "Adjusting Option Selection for Higher Percentages",
    tone: "primary",
    points: [
      "If you want the 100–200%+ returns, the structural mechanics have to match: shorter-dated or slightly OTM contracts carry the percentage leverage — a small move in the underlying can explode a contract like that by 200%+.",
      "The trade-off is real — those same contracts blow up and hit a 40% stop much faster because there's less breathing room in the premium.",
      "Prefer calmer swing structures instead? Accept that smaller, consistent 50–70% wins are the natural byproduct of trading safer structures — that's not a worse outcome, it's a different, more survivable one.",
    ],
  },
];

const TONE_CLASSES: Record<string, string> = {
  primary: "border-primary/30 bg-primary/10",
  secondary: "border-secondary/30 bg-secondary/10",
  caution: "border-caution/30 bg-caution/10",
};

const TONE_TEXT: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  caution: "text-caution",
};

// Moved here from the Playbook page's old "Mindset, Habits & Capital Safety"
// column -- the Playbook stays focused on structural execution rules (the
// stuff you check right before clicking order entry), while every
// psychological anchor, behavioral lockout, and risk-of-ruin rule lives
// here in one place.
const MINDSET_RULES = [
  "No-Phone Execution: Zero trading apps on mobile. Desktop execution only to prevent boredom gambling.",
  "Detachment from Missed Trades: Missing a runner means your scan logic was 100% correct. Execute the same logic next time without chasing.",
  '"Wait for Fruit" Rule: Give swing contracts 2 to 3 weeks to work. Do not micro-manage intraday chop.',
  "Mid-Day Reset: Step away for a 34-min walk at 11:00 AM EST on winning streaks to ground yourself.",
  "Sweep Weekly Profits: Once above $16K, systematically wire 60% of net profits to a secondary bank account.",
];

export default function ExitsPlaybookPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-mono text-xl font-bold tracking-widest text-white">ADJUSTING EXITS & TRADE MANAGEMENT</h1>
      <p className="mt-1 text-sm text-white/50">
        Breaking the "arbitrary 200% gain" trap — exits driven by structure, not by a number on the screen.
      </p>

      <div className="mt-6 space-y-5">
        {SECTIONS.map((s) => (
          <div key={s.title} className={`rounded-xl border p-5 ${TONE_CLASSES[s.tone]}`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${TONE_TEXT[s.tone]}`}>{s.title}</h2>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-white/80">
              {s.points.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className={`mt-1 h-1.5 w-1.5 flex-none rounded-full ${TONE_TEXT[s.tone]} bg-current`} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-1 font-mono text-lg font-bold tracking-wide text-white">PSYCHOLOGY & BEHAVIORAL LOCKOUTS</h2>
        <p className="mb-4 text-sm text-white/50">
          Every mindset rule, hard-stop, and anti-revenge parameter in one place — read this before you touch
          the wizard, not mid-trade.
        </p>

        <div className="rounded-xl border-2 border-blocked/40 bg-blocked/10 p-5 text-center">
          <p className="text-base font-bold uppercase tracking-wide text-blocked sm:text-lg">
            Zero Averaging Down. Zero Revenge Trading. Accept the stop and walk away.
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-secondary/30 bg-secondary/10 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">Hard-Stop Daily Loss Limit</h3>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-white/80">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-secondary" />
              <span>
                <strong>Two-Loss Morning Lockout:</strong> if two morning trades hit their stop-loss, or you
                notice real emotional bleed creeping into your decisions, the terminal closes for the rest of
                the session. No exceptions, no "making it back before the close."
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-secondary" />
              <span>
                This is currently a self-enforced discipline rule, not an automated lockout — the wizard's
                Execution Check step asks "Within your daily loss limit?" as an honest yes/no gut-check, but
                nothing in the code counts your losses today and locks the session for you yet. Say the word
                and that becomes a real, coded enforcement.
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-secondary">Mindset & Habits</h3>
            <ul className="space-y-2 text-sm text-white/70">
              {MINDSET_RULES.map((r, i) => (
                <li key={i} className="border-l-2 border-secondary/40 pl-3">{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-caution">Capital Safety — Know Your Three Risk Rules</h3>
            <ul className="space-y-2.5 text-sm leading-relaxed text-white/70">
              <li className="border-l-2 border-caution/40 pl-3">
                <strong>2–5% per-trade risk</strong> (Pre-Trade Checklist / Account Settings) — how much of the
                whole account you're willing to lose on this one trade.
              </li>
              <li className="border-l-2 border-caution/40 pl-3">
                <strong>60% deployable / 40% idle buffer</strong> (the Allocation Wall shown in every Start
                Session step) — how much of the account can be at risk across ALL open positions at once. This
                is the playbook's actual "doubling up" math: you're compounding the 60% you deploy, never
                touching the 40% buffer.
              </li>
              <li className="border-l-2 border-caution/40 pl-3">
                <strong>-40% structural hard stop</strong> (Twelve-Stage Roadmap) — the position-level stop
                price on an individual contract once you're in the trade.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded border border-caution/30 bg-caution/10 p-4 text-sm text-white/80">
          <span className="font-semibold text-caution">Psychological Risk Anchor:</span> at a 30% system win
          rate with 7.5:1 reward-to-risk (EV = +62%), variance dictates you may encounter multiple consecutive
          losses. Preserving the 40% idle buying power buffer ensures a losing streak never impairs account
          survival. Stick to the sheet formulas.
        </div>
      </div>

      <div className="mt-6 rounded border border-white/10 bg-surface p-4 text-xs leading-relaxed text-white/50">
        Educational content only — not investment advice. See the full{" "}
        <a href="/disclaimer" className="underline hover:text-white/70">
          Disclaimer
        </a>{" "}
        for the CFTC Rule 4.41 disclosure.
      </div>
    </div>
  );
}
