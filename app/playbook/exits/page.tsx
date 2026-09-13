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
