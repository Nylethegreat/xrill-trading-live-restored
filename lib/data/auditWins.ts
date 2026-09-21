// Transcribed directly from Nyle_Yumeen_2026_Trading_Audit.pdf, section 3
// ("The Winner's Circle: +50% to +1,721% Gains"). This is real, disclosed
// performance data -- but it is ONLY the winners: the audit's own headline
// numbers show the account was net -$1,403.00 (-5.34%) overall with a
// ~36.5% win rate. This file deliberately does not include losing trades
// or dollar amounts, matching how the hero ticker displays it (see
// WinsTicker.tsx) -- pair this on-page with a link to the full disclosed
// ledger/disclaimer, not as a standalone performance claim.
export interface AuditWin {
  date: string; // as printed in the audit, e.g. "Jul 1, 2026"
  ticker: string;
  setup: string; // strike/type/expiry, e.g. "$296 Put 7/2"
  gainPct: number;
}

export const AUDIT_WINS: AuditWin[] = [
  { date: "Jul 1, 2026", ticker: "IWM", setup: "$296 Put 7/2", gainPct: 316.67 },
  { date: "Jul 8, 2026", ticker: "IWM", setup: "$288 Put 7/10", gainPct: 85.0 },
  { date: "Jul 9, 2026", ticker: "IWM", setup: "$294 Put 7/10", gainPct: 150.0 },
  { date: "Jul 9, 2026", ticker: "AMZN", setup: "$299 Call 7/15", gainPct: 206.25 },
  { date: "Jul 13, 2026", ticker: "IWM", setup: "$289 Put 7/15", gainPct: 69.57 },
  { date: "Jul 17, 2026", ticker: "NVDA", setup: "$190 Put 7/24", gainPct: 56.67 },
  { date: "Jul 17, 2026", ticker: "META", setup: "$610 Put 7/22", gainPct: 432.47 },
  { date: "Jul 20, 2026", ticker: "AVGO", setup: "$370 Put 7/20", gainPct: 66.67 },
  { date: "Jul 21, 2026", ticker: "ORCL", setup: "$132 Call 7/24", gainPct: 61.12 },
  { date: "Jul 21, 2026", ticker: "IWM", setup: "$287 Put 7/29", gainPct: 78.95 },
  { date: "Jul 22, 2026", ticker: "ORCL", setup: "$134 Call 7/24", gainPct: 59.46 },
  { date: "Jul 22, 2026", ticker: "IWM", setup: "$293 Put 7/22", gainPct: 52.64 },
  { date: "Jul 23, 2026", ticker: "IWM", setup: "$289 Put 7/28", gainPct: 65.17 },
  { date: "Jul 23, 2026", ticker: "IWM", setup: "$290 Put 7/22", gainPct: 60.72 },
  { date: "Jul 23, 2026", ticker: "IWM", setup: "$291 Put 7/23", gainPct: 57.15 },
  { date: "Jul 29, 2026", ticker: "IWM", setup: "$284 Put 7/29", gainPct: 50.0 },
  { date: "Jul 31, 2026", ticker: "ORCL", setup: "$138 Call 8/7", gainPct: 266.08 },
  { date: "Jul 31, 2026", ticker: "IWM", setup: "$290 Put 7/31", gainPct: 172.98 },
  { date: "Aug 3, 2026", ticker: "AMZN", setup: "$275 Put 8/5", gainPct: 134.38 },
  { date: "Aug 3, 2026", ticker: "AMZN", setup: "$272.5 Put 8/5", gainPct: 117.4 },
  { date: "Aug 3, 2026", ticker: "TSLA", setup: "$342.5 Call 8/7", gainPct: 78.41 },
  { date: "Aug 5, 2026", ticker: "MRNA", setup: "$61 Call 8/7", gainPct: 53.34 },
  { date: "Aug 6, 2026", ticker: "IWM", setup: "$298 Put 8/6", gainPct: 108.7 },
  { date: "Aug 10, 2026", ticker: "MRNA", setup: "$63 Call 8/14", gainPct: 66.67 },
  { date: "Aug 12, 2026", ticker: "MSFT", setup: "$490 Put 8/12", gainPct: 100.0 },
  { date: "Aug 12, 2026", ticker: "MSFT", setup: "$480 Put 8/14", gainPct: 120.46 },
  { date: "Aug 12, 2026", ticker: "MRNA", setup: "$65 Call 8/14", gainPct: 138.1 },
  { date: "Aug 13, 2026", ticker: "SNOW", setup: "$350 Call 8/14", gainPct: 140.0 },
  { date: "Aug 17, 2026", ticker: "MSFT", setup: "$470 Put 8/21", gainPct: 110.53 },
  { date: "Aug 17, 2026", ticker: "MSFT", setup: "$485 Put 8/21", gainPct: 354.55 },
  { date: "Aug 18, 2026", ticker: "SPY", setup: "$768 Put 8/18", gainPct: 346.16 },
  { date: "Aug 18, 2026", ticker: "SNOW", setup: "$302.5 Put 8/21", gainPct: 71.06 },
  { date: "Aug 18, 2026", ticker: "SNOW", setup: "$300 Put 8/21", gainPct: 136.85 },
  { date: "Aug 18, 2026", ticker: "MU", setup: "$880 Put 8/19", gainPct: 72.42 },
  { date: "Aug 18, 2026", ticker: "META", setup: "$570 Call 8/19", gainPct: 73.34 },
  { date: "Aug 19, 2026", ticker: "SNOW", setup: "$290 Put 8/28", gainPct: 98.72 },
  { date: "Aug 20, 2026", ticker: "META", setup: "$560 Call 8/21", gainPct: 136.85 },
  { date: "Aug 24, 2026", ticker: "MU", setup: "$780 Put 8/28", gainPct: 73.27 },
  { date: "Aug 26, 2026", ticker: "META", setup: "$585 Call 8/26", gainPct: 1721.43 },
  { date: "Sep 2, 2026", ticker: "MU", setup: "$905 Put 9/2", gainPct: 122.23 },
  { date: "Sep 4, 2026", ticker: "LULU", setup: "$101 Put 9/4", gainPct: 669.24 },
  { date: "Sep 8, 2026", ticker: "CRM", setup: "$240 Put 9/11", gainPct: 264.59 },
  { date: "Sep 8, 2026", ticker: "MSFT", setup: "$485 Put 9/9", gainPct: 201.37 },
  { date: "Sep 14, 2026", ticker: "MU", setup: "$825 Put 9/18", gainPct: 248.96 },
  { date: "Sep 15, 2026", ticker: "SMCI", setup: "$36 Put 9/18", gainPct: 70.18 },
];
