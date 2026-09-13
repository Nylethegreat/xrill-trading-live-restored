# XRILL Trading Operating System

Next.js + Supabase port of the XRILL trading course product, originally a
Python/Streamlit app.

**This is the real, working build.** It was pushed straight to Vercel via
`vercel deploy` (no Git repo backing it), so it never existed anywhere else —
not in this repo, not on this Mac — until it was pulled back down from the
live deployment on 2026-09-08. If you also have `~/Desktop/XRILL/xrill-trading-os`
around, that was an earlier from-scratch scaffold built before this one was
discovered; it's superseded by this folder and safe to delete.

## What's actually built

- Full gate-flow wizard (`components/XrillWizard.tsx`): Daily Check-In → Trade
  Gate → Setup Score → Trade Plan → Risk Manager → Execution Check → Trade
  Score → Authorization
- Scoring/gating math (`lib/xrill.ts`) ported from the original Python
  (`main.py`, `trade_score.py`, `account.py`) — kept as the single source of
  truth so authorization is always recomputed server-side, never trusted from
  client input. **Re-tooled for options buyers**: the Trade Plan step no
  longer does futures point-value math — it's built around SPY/QQQ/single-
  stock CALL/PUT premiums (ticker, Call/Put, entry premium, a stop that's
  either a stop-loss premium or "full premium at risk" for 0DTE/scalps, and a
  target premium), with 1 contract = 100 shares baked into every dollar
  calculation. Risk Manager still dynamically caps contracts from your real
  account balance and risk % (`lib/xrill.ts`'s `evaluateRisk`), and now warns
  inline on the Trade Plan step itself — before you even reach Risk Manager —
  if the contract count you entered exceeds what your risk settings allow.
- Setup Score is now five plain-language yes/no checks (trend alignment vs.
  9/21 EMA, key level reaction, momentum/volume, news/event clear, 2x R:R) at
  5 points each instead of 1–5 slider ratings — pass bar is 20/25. Inline
  `(?)` hints (`components/Hint.tsx`) explain jargon at the point of use
  (liquidity, "1 contract = 100 shares", waiting for candle closes) across
  the wizard for beginners.
- `/dashboard` — account balance/risk, last session, performance stats
- `/session` — runs the wizard, `app/session/actions.ts` saves the result
- `/playbook`, `/account` — supporting pages
- Supabase auth (`app/login`, `lib/supabase/*`, `middleware.ts`)
- Wired to the same `xrill-trading` Supabase project (schema: `profiles`,
  `accounts`, `xrill_sessions`, `xrill_outcomes`, `leaderboard_stats` view)
- `/analytics` — full analytics command center (`lib/analytics.ts`, ported
  from the original `analytics.py`): win rate, profit factor, expectancy,
  average R, equity curve, max drawdown, breakdowns by ticker/direction/
  market session/setup type/score bucket, plan and exit-rule adherence,
  MFE/MAE, holding time — with client-side date/ticker/setup/direction
  filters, same as the original Streamlit "Analytics Command Center" tab
- `/intelligence` — trading profile (strongest/weakest gate, tiered
  observations, a recommendation) ported from the original CLI's
  `xrill_intelligence()` in `main.py`, plus an "XRILL Coach" mindset
  check-in (`lib/coach.ts`, ported from `coach.py`), plus a "🤖 XRILL
  Rejection Analysis" section (`lib/rejection.ts`, ported from
  `xrill_rejection_analysis()`) breaking down block reasons by category
  and surfacing the most common one with the same coaching message the
  CLI gave. None of these existed in working form anywhere before now —
  the Streamlit UI only had a placeholder ("Intelligence / Coach module
  will be connected next") and the real logic lived only in the old CLI,
  never wired into the web app.
- `/journal` — every XRILL session, newest first, with the trade plan and
  final decision (ported from `xrill_session_history()`), and — this is
  the important part — an actual UI to record the trade outcome
  (P/L, followed plan?, followed exit rules?, emotion, lesson) that was
  previously **only possible from the CLI's menu option 22**
  (`xrill_trade_outcome()`). Before this, `xrill_outcomes` had zero rows
  in the live database and no code path anywhere in the web app ever
  wrote to it — `/analytics`'s P&L, win rate, profit factor, and every
  other outcome-derived metric were reading a table nothing could
  populate. `/journal` is that missing write path, via a new server
  action (`app/journal/actions.ts`) and an `xrill_outcomes.session_id`
  unique constraint added directly in Supabase so each session's outcome
  can be saved and edited in place. Outcome recording is restricted to
  authorized sessions only (a blocked session was never executed, so
  there's nothing to journal), and the page has All/Authorized/Blocked
  filter tabs.
- `/about` — origin & philosophy, the 8-gate breakdown, an FAQ, a
  methodology-only performance-transparency section (no fabricated
  numbers — it points to your real `/analytics` and `/intelligence`
  instead), a quick-start guide, and a CFTC-style risk disclosure (a
  drafted starting point, not reviewed by counsel).
- Site-wide visual pass: a dark, glowing candlestick/data-terminal motif
  (`components/visuals/CandlestickGlow.tsx`), inline SVG (no external
  images, nothing to download) in the app's own color tokens. A dim,
  full-bleed version sits behind every page (`TerminalBackdrop`, mounted
  once in `app/layout.tsx`); a brighter version anchors the landing page
  hero; a compact banner variant sits behind the header on Dashboard,
  Analytics, and Intelligence.

## Known issue to fix before relying on this in production

`next@14.2.15` has several disclosed vulnerabilities, including a
**middleware authorization bypass** (GHSA-f82v-jwr5-mffw) — meaningful here
since `middleware.ts` is what gates access to authenticated routes. Run
`npm audit` for the full list. Upgrading to a patched Next 14.2.x point
release (rather than jumping to Next 16, which would need retesting the auth
flow) is the lower-risk fix.

## Local development

```bash
npm install
npm run dev
```

`.env.local` is already present (gitignored) with the Supabase URL and
publishable key for the `xrill-trading` project.
