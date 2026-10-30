// The 9 Intelligences of a Trader: the multiple-intelligences idea,
// rewritten for trading. Shown as the wheel on /intelligence. Each slice
// says what the skill is, how it shows up when it's missing, and where in
// XRILL you train it.
export interface TraderIntelligence {
  key: string;
  name: string;
  line: string;
  color: string;
  missing: string;
  train: { text: string; href?: string }[];
}

export const TRADER_INTELLIGENCES: TraderIntelligence[] = [
  {
    key: "chart",
    name: "Chart Vision",
    line: "Seeing structure: levels, trends, the shape of a move.",
    color: "#7a9a3c",
    missing: "Entries in the middle of nowhere, stops placed by percentage instead of at a level.",
    train: [
      { text: "Mark your levels before the open. The Setup Read's Key Level check only counts if you drew them first." },
      { text: "Review the strategy library until you can name the setup in under five seconds.", href: "/playbook/strategies" },
    ],
  },
  {
    key: "market",
    name: "Market Sense",
    line: "Reading the regime: trend day, chop day, news day.",
    color: "#2f8f7a",
    missing: "Running breakout plays on a chop day, then wondering why every breakout fails.",
    train: [
      { text: "Before your first trade, name the day: trending, chopping, or waiting on news." },
      { text: "Chop day? That's a spread or no trade, not a naked call.", href: "/playbook/verticals" },
    ],
  },
  {
    key: "tape",
    name: "Tape Rhythm",
    line: "Feeling the pace: volume, momentum, when a move tires.",
    color: "#2b6f8f",
    missing: "Buying the top of a spike, or bailing on a good trade during a normal pullback.",
    train: [
      { text: "Watch how volume behaves on the pullbacks of trades that worked. That's what 'healthy' looks like." },
      { text: "On 0DTE, the ladder handles the pace for you: pay yourself at +100%, let the runner trail.", href: "/playbook/zero-dte" },
    ],
  },
  {
    key: "numbers",
    name: "Numbers",
    line: "R:R, position size, probabilities, expectancy.",
    color: "#2e4f8a",
    missing: "Sizing by feel, 1:1 trades that need a 60% win rate just to break even.",
    train: [
      { text: "Let the Risk Manager size every trade. If it cuts your contracts, the math is telling you something." },
      { text: "Check Analytics weekly: win rate times average win has to beat loss rate times average loss.", href: "/analytics" },
    ],
  },
  {
    key: "purpose",
    name: "Purpose",
    line: "Why you trade, and what the money is for.",
    color: "#5b3f8f",
    missing: "Trading to feel something, or to win back yesterday, instead of to execute a plan.",
    train: [
      { text: "Write down what each milestone is for: bills, school, family. Money with a job gets traded more carefully." },
      { text: "Keep your vision board where you'll see it before the open.", href: "/blueprint" },
    ],
  },
  {
    key: "crowd",
    name: "Crowd Reading",
    line: "Sentiment, fear and greed, who's trapped.",
    color: "#7a3f7a",
    missing: "Chasing the same move everyone's posting about, right as the early buyers sell to you.",
    train: [
      { text: "When a ticker is all over your feed, ask who's already in it and who's about to be trapped." },
      { text: "Failed breakouts are trapped buyers. That's often the better trade the other way." },
    ],
  },
  {
    key: "body",
    name: "Body",
    line: "Sleep, gym, breath: a calm body trades better.",
    color: "#8f3434",
    missing: "Overtrading on no sleep, revenge trades with your heart rate up.",
    train: [
      { text: "The Daily Check-In asks about sleep for a reason. Answer it honestly." },
      { text: "Two stop-outs? Walk away for 20 minutes before even looking at the chart. The lockout does the rest." },
    ],
  },
  {
    key: "thesis",
    name: "Thesis Writing",
    line: "Putting the trade into words before you click.",
    color: "#a0532c",
    missing: "Forgetting why you're in, and exiting a good trade because it got uncomfortable.",
    train: [
      { text: "Fill in 'What do you think happens' and 'I'm wrong if' in the Setup Read every time." },
      { text: "When you want out, reread your wrong-if. If it hasn't happened, it's still your trade.", href: "/journal" },
    ],
  },
  {
    key: "self",
    name: "Self-Knowledge",
    line: "Knowing your tilt, your triggers, your edge.",
    color: "#a8902f",
    missing: "Repeating the same mistake on a different ticker and calling it bad luck.",
    train: [
      { text: "Review every closed trade. Your Journal Streak tracks it.", href: "/dashboard" },
      { text: "Look for patterns in your emotional exits: time of day, after a win, after a loss." },
    ],
  },
];
