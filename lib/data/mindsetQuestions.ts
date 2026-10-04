// XRILL Mindset Check — the 150-question bank behind the Intelligence
// page's pre-trade emotional questionnaire. Each run samples a fresh set
// (25 / 30 / 45 / 50), always including the CORE questions, and spreads
// the rest evenly across the eight realms so no single area dominates.
//
// Scoring: yes/no, multiple-choice and 1-5 scale questions carry points.
// Written questions are never graded on content — any real answer (not
// blank, not keyboard mash) counts as a full point. The point of those is
// to make you slow down and actually think, not to be "right".

export type Realm =
  | "physical"
  | "mental"
  | "financial"
  | "spiritual"
  | "social"
  | "emotional"
  | "behavior"
  | "self";

export const REALMS: { id: Realm; label: string; icon: string; color: string; tip: string }[] = [
  { id: "physical", label: "Physical", icon: "💪", color: "#f97316", tip: "Water, real food, sunlight and movement before you touch a chart. Check your Power-Ups." },
  { id: "mental", label: "Mental", icon: "🧠", color: "#a855f7", tip: "Write the plan before the open. A codex entry turns noise into a rule you can follow." },
  { id: "financial", label: "Financial", icon: "💰", color: "#22c55e", tip: "Size from the 60/40 rule, not from how you feel. Only risk money you've already accepted losing." },
  { id: "spiritual", label: "Spiritual", icon: "🔆", color: "#facc15", tip: "Reconnect with your why. One quiet minute of gratitude resets the scoreboard in your head." },
  { id: "social", label: "Social", icon: "🤝", color: "#38bdf8", tip: "Talk to one real person today — not a group chat. Isolation makes every trade feel bigger." },
  { id: "emotional", label: "Emotional", icon: "❤️", color: "#f43f5e", tip: "Name the feeling before it names your trade. If it's a red day, open the Red Day card first." },
  { id: "behavior", label: "Behavior", icon: "🛡️", color: "#14b8a6", tip: "Exits are decided before entry: -40% hard stop, trim at +100%, two losses and you're done." },
  { id: "self", label: "Self", icon: "🌟", color: "#e879f9", tip: "You are not your P&L. Do one thing today that has nothing to do with money." },
];

interface Base {
  id: string;
  realm: Realm;
  q: string;
  /** Always asked, every run, every length. */
  core?: boolean;
  /** Asked first and forced in whenever a lot is on the line. */
  highStakes?: boolean;
}
export interface YesNoQ extends Base {
  kind: "yesno";
  /** Which answer is the healthy one. */
  good: boolean;
}
export interface ChoiceQ extends Base {
  kind: "choice";
  /** points: 0 (red flag) .. 2 (ready) */
  options: { label: string; points: 0 | 1 | 2 }[];
}
export interface ScaleQ extends Base {
  kind: "scale";
  low: string;
  high: string;
  /** true when a HIGH number is the healthy end (default). */
  highIsGood?: boolean;
}
export interface TextQ extends Base {
  kind: "text";
  placeholder?: string;
}
export type MindsetQuestion = YesNoQ | ChoiceQ | ScaleQ | TextQ;

const yn = (id: string, realm: Realm, q: string, good = true, extra: Partial<Base> = {}): YesNoQ => ({ id, realm, q, kind: "yesno", good, ...extra });
const mc = (id: string, realm: Realm, q: string, options: [string, 0 | 1 | 2][], extra: Partial<Base> = {}): ChoiceQ => ({
  id,
  realm,
  q,
  kind: "choice",
  options: options.map(([label, points]) => ({ label, points })),
  ...extra,
});
const sc = (id: string, realm: Realm, q: string, low: string, high: string, highIsGood = true, extra: Partial<Base> = {}): ScaleQ => ({ id, realm, q, kind: "scale", low, high, highIsGood, ...extra });
const tx = (id: string, realm: Realm, q: string, placeholder?: string, extra: Partial<Base> = {}): TextQ => ({ id, realm, q, kind: "text", placeholder, ...extra });

const CORE = { core: true };
const STAKES = { highStakes: true };

export const MINDSET_QUESTIONS: MindsetQuestion[] = [
  // ── CORE: asked every single time ────────────────────────────────────
  yn("c1", "physical", "Did you go outside today?", true, CORE),
  yn("c2", "social", "Have you actually spoken to someone today — out loud, not just texting?", true, CORE),
  yn("c3", "physical", "Are you hydrated? (At least a couple of glasses of water so far.)", true, CORE),
  yn("c4", "physical", "Have you eaten a real meal today?", true, CORE),
  yn("c5", "mental", "Did you write a journal entry today (or will you before you trade)?", true, CORE),
  yn("c6", "mental", "Have you read or added to your codex today?", true, CORE),
  sc("c7", "emotional", "Overall, how are you feeling right now?", "Awful", "Great", true, CORE),

  // ── HIGH STAKES: forced in whenever a lot is on the line ────────────
  tx("h1", "spiritual", "If this trade goes to zero, what will you still be proud of today?", "Something money can't touch…", STAKES),
  yn("h2", "financial", "Is today's risk money you've already fully accepted losing?", true, STAKES),
  yn("h3", "behavior", "Is your hard stop already written down — a price, not a feeling?", true, STAKES),
  mc("h4", "emotional", "Why is the size bigger than usual today?", [
    ["It isn't — same rules, same size", 2],
    ["The setup scored higher and my tier allows it", 2],
    ["I want to make back a loss", 0],
    ["I feel like today is THE day", 0],
  ], STAKES),
  tx("h5", "self", "Write one sentence your future self would thank you for following today.", "e.g. I take the stop, no debate.", STAKES),

  // ── PHYSICAL ─────────────────────────────────────────────────────────
  sc("p1", "physical", "How well did you sleep last night?", "Barely", "Fully rested"),
  mc("p2", "physical", "Roughly how many hours did you sleep?", [["Under 5", 0], ["5–6", 1], ["7+", 2]]),
  yn("p3", "physical", "Have you moved your body today — a walk, gym, stretching, anything?"),
  yn("p4", "physical", "Is caffeine the only thing keeping you upright right now?", false),
  mc("p5", "physical", "When did you last eat?", [["Within 3 hours", 2], ["3–6 hours ago", 1], ["Can't remember", 0]]),
  yn("p6", "physical", "Do you have a headache, or feel physically off?", false),
  sc("p7", "physical", "Energy level right now?", "Drained", "Charged"),
  yn("p8", "physical", "Did you get at least 10 minutes of sunlight today?"),
  yn("p9", "physical", "Is there water within arm's reach of where you trade?"),
  mc("p10", "physical", "How long have you been staring at screens today?", [["Under 2 hours", 2], ["2–6 hours", 1], ["Basically all day", 0]]),
  yn("p11", "physical", "Did you take three slow, deep breaths before opening this?"),
  sc("p12", "physical", "How tense are your shoulders and jaw right now?", "Totally loose", "Clenched", false),
  tx("p13", "physical", "What's the best thing you ate today?", "Or the best thing you're going to eat…"),
  yn("p14", "physical", "Are you trading from a real seat at a desk, not from bed?"),
  mc("p15", "physical", "If you had to sprint right now, how would it go?", [["Let's go", 2], ["I'd survive", 1], ["Absolutely not", 0]]),
  yn("p16", "physical", "Have you checked your Power-Ups for today?"),
  tx("p17", "physical", "What's one thing you'll do for your body after the market closes?", "Walk, gym, cook, sleep early…"),
  yn("p18", "physical", "Did you drink alcohol or use anything that dulls your judgment in the last 12 hours?", false),

  // ── MENTAL ──────────────────────────────────────────────────────────
  sc("m1", "mental", "How clear is your head right now?", "Foggy", "Crystal clear"),
  yn("m2", "mental", "Can you explain your setup in one sentence without saying 'I just feel like'?"),
  yn("m3", "mental", "Do you know which XRILL gate you'd most likely fail today?"),
  mc("m4", "mental", "How many browser tabs / apps are fighting for your attention?", [["Just what I need", 2], ["A few extra", 1], ["Total chaos", 0]]),
  yn("m5", "mental", "Have you looked at tomorrow's and today's economic calendar?"),
  sc("m6", "mental", "How focused can you stay for the next hour?", "Not at all", "Locked in"),
  yn("m7", "mental", "Are you distracted by something outside trading you haven't dealt with?", false),
  mc("m8", "mental", "Which best describes your plan for today?", [["Written, with entries and exits", 2], ["In my head", 1], ["I'll see what happens", 0]]),
  tx("m9", "mental", "What's one lesson from your last losing trade?", "The rule you'll carry forward…"),
  yn("m10", "mental", "Could you sit through an entire session without trading if nothing sets up?"),
  sc("m11", "mental", "How much are you overthinking right now?", "Not at all", "Spiraling", false),
  tx("m12", "mental", "What's something you learned this week that had nothing to do with trading?", "A class, a video, a conversation…"),
  yn("m13", "mental", "Do you know your max number of trades for today?"),
  mc("m14", "mental", "If a perfect setup appears in 5 minutes, what do you do first?", [["Run it through the gates", 2], ["Check the chart again", 1], ["Enter before it runs", 0]]),
  yn("m15", "mental", "Have you reviewed your last three journal entries this week?"),
  tx("m16", "mental", "What's a book, podcast or video that's been on your mind lately?", "Anything counts."),
  sc("m17", "mental", "How patient do you feel today?", "Itchy", "Monk mode"),
  yn("m18", "mental", "Are you trying to learn a brand-new strategy with real money today?", false),

  // ── FINANCIAL ───────────────────────────────────────────────────────
  yn("f1", "financial", "Is at least 40% of your account sitting idle as cash reserve?"),
  yn("f2", "financial", "Do your bills for this month get paid regardless of today's trades?"),
  mc("f3", "financial", "How much of your account is at risk on a single trade today?", [["Within my tier's max", 2], ["A little over", 0], ["I haven't calculated it", 0]]),
  yn("f4", "financial", "Is any of today's trading money borrowed, on credit, or meant for rent?", false),
  yn("f5", "financial", "Do you know the dollar amount you lose if your hard stop is hit?"),
  mc("f6", "financial", "Your daily loss lock is…", [["Set, and I'll respect it", 2], ["Set, but I've broken it before", 1], ["What daily loss lock?", 0]]),
  yn("f7", "financial", "Have you swept profits out per the 60% bank-sweep rule when you were supposed to?"),
  sc("f8", "financial", "How much would losing today's full risk actually hurt your life?", "Not at all", "Seriously", false),
  yn("f9", "financial", "Are you trying to hit a specific dollar number today because you 'need' it?", false),
  mc("f10", "financial", "How many open positions are you carrying?", [["0–1", 2], ["2–3", 1], ["More than 3", 0]]),
  yn("f11", "financial", "Do you know your account's current stage on the ladder?"),
  tx("f12", "financial", "What would you do with your first big sweep that isn't another trade?", "Something real…"),
  yn("f13", "financial", "Are contract size and premium already calculated, not eyeballed?"),
  mc("f14", "financial", "Compared to last week, your average position size is…", [["Same or smaller", 2], ["Slightly bigger, by the rules", 1], ["Way bigger", 0]]),
  yn("f15", "financial", "Would you be OK if someone you respect saw today's position size?"),
  sc("f16", "financial", "How confident are you in your risk math right now?", "Guessing", "Exact"),
  yn("f17", "financial", "Have you checked the bid/ask spread before entering anything today?"),
  yn("f18", "financial", "Is there an expense coming up that's quietly pressuring you to win?", false),

  // ── SPIRITUAL ───────────────────────────────────────────────────────
  tx("s1", "spiritual", "Why are you doing this? (Trading, the challenge, all of it.)", "Your real reason…"),
  tx("s2", "spiritual", "Name three things you're grateful for right now.", "Big or small."),
  sc("s3", "spiritual", "How connected do you feel to your bigger purpose today?", "Lost", "Aligned"),
  yn("s4", "spiritual", "Did you take a moment of quiet today — prayer, meditation, or just silence?"),
  tx("s5", "spiritual", "What does a good life look like for you in five years?", "Paint it…"),
  yn("s6", "spiritual", "Would you still be you if today's trades all lost?"),
  mc("s7", "spiritual", "Right now, money feels like…", [["A tool for something bigger", 2], ["A scoreboard", 1], ["The whole point", 0]]),
  tx("s8", "spiritual", "Who are you doing this for besides yourself?", "Family, a friend, future you…"),
  sc("s9", "spiritual", "How at peace are you with whatever happens today?", "Not at all", "Completely"),
  yn("s10", "spiritual", "Have you done something kind for someone else today?"),
  tx("s11", "spiritual", "What's a moment from this past week that felt meaningful?", "One specific moment."),
  yn("s12", "spiritual", "Do you believe your progress counts even on red days?"),
  tx("s13", "spiritual", "Finish this sentence: Today I choose to…", "Write it like you mean it."),
  sc("s14", "spiritual", "How much does today feel like part of a long journey vs. a one-shot?", "One shot", "Long journey"),
  yn("s15", "spiritual", "Have you stepped outside and looked at the sky today?"),
  tx("s16", "spiritual", "What's a value you won't trade away for any profit?", "Honesty, patience, family…"),
  yn("s17", "spiritual", "Can you name one thing going right in your life that has nothing to do with markets?"),
  tx("s18", "spiritual", "Write one positive thing about yourself — no 'but' allowed.", "Own it."),

  // ── SOCIAL ──────────────────────────────────────────────────────────
  yn("o1", "social", "Have you checked in with a friend or family member in the last two days?"),
  tx("o2", "social", "What's your preferred outing today or this weekend?", "Beach, food spot, movies, gym…"),
  mc("o3", "social", "How much time have you spent on social media today?", [["Under 30 min", 2], ["Around an hour", 1], ["Lost count", 0]]),
  yn("o4", "social", "Is someone else's P&L screenshot living in your head today?", false),
  tx("o5", "social", "Who's someone you'd like to catch up with soon?", "A name or just who they are to you."),
  sc("o6", "social", "How supported do you feel by people around you?", "Alone", "Backed up"),
  yn("o7", "social", "Have you laughed out loud today?"),
  yn("o8", "social", "Are you trading to prove something to a specific person?", false),
  mc("o9", "social", "Your last real conversation was…", [["Today", 2], ["A couple of days ago", 1], ["Can't remember", 0]]),
  tx("o10", "social", "What's a show you'd recommend to a friend right now?", "Any genre."),
  yn("o11", "social", "Would you tell a friend about today's planned trades without feeling embarrassed?"),
  tx("o12", "social", "What's your movie taste lately — what kind of thing hits?", "Genres, a title, a vibe…"),
  yn("o13", "social", "Do you have plans with a real person in the next few days?"),
  sc("o14", "social", "How much are you comparing yourself to other traders right now?", "Not at all", "Constantly", false),
  tx("o15", "social", "What show are you watching (or rewatching) today?", "Or what you'd put on later…"),
  yn("o16", "social", "Did you reply to the people who reached out to you recently?"),
  tx("o17", "social", "Who in your life would you call if today goes badly?", "Just knowing helps."),
  mc("o18", "social", "Chat rooms, Discords and alert channels right now are…", [["Info, I decide", 2], ["Kind of hyping me up", 1], ["Telling me what to buy", 0]]),

  // ── EMOTIONAL ───────────────────────────────────────────────────────
  mc("e1", "emotional", "Which word fits you best right now?", [["Calm", 2], ["Focused", 2], ["Anxious", 0], ["Angry", 0], ["Euphoric", 0], ["Bored", 1]]),
  yn("e2", "emotional", "Are you trying to make back a loss from yesterday or earlier?", false),
  sc("e3", "emotional", "How strong is your urge to trade right now, setup or not?", "None", "Itching", false),
  yn("e4", "emotional", "Is today a red day — for trading, or just life?", false),
  yn("e5", "emotional", "If today turns heavy, do you know exactly where your Red Day card is?"),
  sc("e6", "emotional", "Fear level right now?", "None", "High", false),
  sc("e7", "emotional", "Greed level right now?", "None", "High", false),
  mc("e8", "emotional", "After your last loss you felt…", [["Disappointed, then moved on", 2], ["Annoyed for a while", 1], ["Like I had to get it back", 0]]),
  mc("e9", "emotional", "After your last win you felt…", [["Grateful, stuck to the plan", 2], ["Pumped", 1], ["Invincible", 0]]),
  yn("e10", "emotional", "Did anything upset you today that you haven't let go of yet?", false),
  tx("e11", "emotional", "Name the feeling you're carrying into this session, in one word.", "Just one."),
  sc("e12", "emotional", "How okay would you be if you took zero trades today?", "Not okay", "Totally fine"),
  yn("e13", "emotional", "Are you bored and looking for excitement?", false),
  tx("e14", "emotional", "What usually calms you down when you're stressed?", "Music, a walk, a person…"),
  mc("e15", "emotional", "If your first trade hits its stop, your next move is…", [["Log it and step away", 2], ["Wait for an A+ setup", 1], ["Size up to make it back", 0]]),
  sc("e16", "emotional", "How heavy does today's outcome feel?", "Light", "Life or death", false),
  yn("e17", "emotional", "Do you feel rushed or under a deadline right now?", false),
  tx("e18", "emotional", "What would make today a good day, even if you don't trade?", "Be specific."),

  // ── BEHAVIOR (exit rules & discipline) ──────────────────────────────
  yn("b1", "behavior", "Do you know your hard stop on every position before entering? (-40% rule)"),
  yn("b2", "behavior", "Will you trim at +100% to take the trade risk-free?"),
  mc("b3", "behavior", "Your runner target on the remaining contracts is…", [["+300%, or trail", 2], ["Whenever it feels right", 1], ["No target", 0]]),
  yn("b4", "behavior", "After two losses today, will you stop trading — no exceptions?"),
  yn("b5", "behavior", "Have you ever moved a stop further away mid-trade?", false),
  mc("b6", "behavior", "How many positions max will you hold at once today?", [["3 or fewer (the cap)", 2], ["Probably 4", 0], ["As many as I see", 0]]),
  yn("b7", "behavior", "Will you run every trade through the gates in Start Session?"),
  yn("b8", "behavior", "Are you planning to trade in the first 5 minutes of the open on impulse?", false),
  sc("b9", "behavior", "How well did you follow your rules yesterday?", "Ignored them", "Perfectly"),
  yn("b10", "behavior", "Will you log every trade in the journal today, including the ugly ones?"),
  mc("b11", "behavior", "A trade is up +60% and starts fading. You…", [["Follow the written exit plan", 2], ["Watch it closely", 1], ["Hope it comes back", 0]]),
  yn("b12", "behavior", "Do you check your phone for P&L outside your trading time?", false),
  yn("b13", "behavior", "Is your setup score above your minimum before you size in?"),
  mc("b14", "behavior", "When a trade goes against you, your first instinct is…", [["Respect the stop", 2], ["Re-check the thesis", 1], ["Average down", 0]]),
  tx("b15", "behavior", "Write today's exit rule in your own words.", "Stop at…, trim at…, out by…"),
  yn("b16", "behavior", "Have you set alerts so you don't have to stare at the chart?"),
  sc("b17", "behavior", "How likely are you to break a rule today if a trade 'looks perfect'?", "Never", "Very likely", false),
  yn("b18", "behavior", "Did you skip a trade recently because it didn't pass the gates — and feel fine about it?"),

  // ── SELF ────────────────────────────────────────────────────────────
  tx("x1", "self", "What's your big goal for today — trading or not?", "One thing that makes today count."),
  sc("x2", "self", "How much do you believe in yourself today?", "Low", "All in"),
  yn("x3", "self", "Do you feel like your worth goes up and down with your account balance?", false),
  tx("x4", "self", "What's one thing you've improved at in the last month?", "Proof you're growing."),
  yn("x5", "self", "Did you do something today just for you?"),
  mc("x6", "self", "If today's trades lose, how will you talk to yourself?", [["Like I'd talk to a friend", 2], ["Quietly frustrated", 1], ["Rip myself apart", 0]]),
  tx("x7", "self", "Describe the trader you're becoming in three words.", "e.g. patient, sharp, calm"),
  yn("x8", "self", "Are you proud of how you handled your last red day?"),
  tx("x9", "self", "What's something you're looking forward to this week?", "Anything at all."),
  sc("x10", "self", "How much are you enjoying the process right now?", "Grinding through it", "Loving it"),
  yn("x11", "self", "Did you keep a promise to yourself yesterday?"),
  tx("x12", "self", "What's a skill outside trading you want to get better at?", "Language, music, sport…"),
  mc("x13", "self", "Right now you are trading because…", [["It's my plan for today", 2], ["I'm here, so why not", 1], ["I need it to feel good", 0]]),
  tx("x14", "self", "Write one thing you'll still do today even if the market is closed.", "Something that's yours."),
  yn("x15", "self", "Do you know your stopping time for today?"),
  sc("x16", "self", "How kind have you been to yourself this week?", "Brutal", "Kind"),
  tx("x17", "self", "What does winning look like for you that isn't a number?", "Freedom, time, calm…"),
  yn("x18", "self", "If you had to step away for a week starting now, would you be okay?"),
];

/** Fisher–Yates shuffle (copy). */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `count` questions: high-stakes ones first (when the stakes are
 * high), then every CORE question, then a round-robin across shuffled
 * realms so the rest are evenly spread. Final order keeps the priority
 * questions up front and shuffles the remainder.
 */
export function pickQuestions(count: number, highStakes: boolean): MindsetQuestion[] {
  const stakes = highStakes ? MINDSET_QUESTIONS.filter((q) => q.highStakes) : [];
  const core = MINDSET_QUESTIONS.filter((q) => q.core);
  const pool = shuffle(MINDSET_QUESTIONS.filter((q) => !q.core && !q.highStakes));

  const byRealm = new Map<Realm, MindsetQuestion[]>();
  for (const q of pool) {
    const list = byRealm.get(q.realm) ?? [];
    list.push(q);
    byRealm.set(q.realm, list);
  }

  const fill: MindsetQuestion[] = [];
  const need = Math.max(0, count - stakes.length - core.length);
  const realmOrder = shuffle(REALMS.map((r) => r.id));
  while (fill.length < need) {
    let added = false;
    for (const r of realmOrder) {
      const next = byRealm.get(r)?.shift();
      if (next) {
        fill.push(next);
        added = true;
        if (fill.length >= need) break;
      }
    }
    if (!added) break;
  }

  return [...stakes, ...shuffle([...core, ...fill])].slice(0, Math.max(count, stakes.length + core.length));
}

/** Points earned (0..1) for one answer; null = unanswered. */
export function scoreAnswer(q: MindsetQuestion, answer: unknown): number | null {
  if (answer === undefined || answer === null || answer === "") return null;
  switch (q.kind) {
    case "yesno":
      return answer === q.good ? 1 : 0;
    case "choice": {
      const opt = q.options[answer as number];
      return opt ? opt.points / 2 : null;
    }
    case "scale": {
      const v = Number(answer);
      if (!Number.isFinite(v)) return null;
      const norm = (v - 1) / 4;
      return q.highIsGood === false ? 1 - norm : norm;
    }
    case "text":
      return isValidWritten(String(answer)) ? 1 : 0;
  }
}

/** "Valid response" = a real attempt: 3+ letters, not one key held down. */
export function isValidWritten(s: string): boolean {
  const t = s.trim();
  if (t.replace(/[^a-z]/gi, "").length < 3) return false;
  if (/^(.)\1+$/i.test(t.replace(/\s/g, ""))) return false;
  return true;
}

export const TEST_LENGTHS = [25, 30, 45, 50] as const;
export type TestLength = (typeof TEST_LENGTHS)[number];
