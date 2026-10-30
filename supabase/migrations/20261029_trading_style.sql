-- Trading Style: the holding horizon picked in the Setup Read of both
-- engines (Scalping, Day Trading, Swing Trading, ...). Separate from
-- setup_type (the strategy). Optional; keys mirror lib/data/tradingStyles.ts.

alter table public.xrill_sessions
  add column if not exists trading_style text
    check (trading_style is null or trading_style in (
      'scalping', 'day_trading', 'swing_trading', 'position_trading',
      'trend_following', 'momentum', 'mean_reversion', 'breakout', 'arbitrage'
    ));
