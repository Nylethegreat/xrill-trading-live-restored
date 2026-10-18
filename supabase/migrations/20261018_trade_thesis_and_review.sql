-- Trade thesis + post-trade review.
--
-- Captures WHY a trade was taken (strategy, thesis, "I'm wrong if"),
-- how convicted the trader was going in, optional contract greeks, and
-- whether volume confirmed the entry -- then, on the outcome, how
-- convicted they were coming out, whether the thesis actually played
-- out, and the real reason they exited.
--
-- Everything is nullable/optional: the engines never require these, and
-- older rows (and the after-the-fact log) simply leave them empty.
-- setup_type already existed on xrill_sessions (Analytics groups by it)
-- but nothing wrote to it; the strategy dropdown now fills it.

alter table public.xrill_sessions
  add column if not exists thesis text
    check (thesis is null or char_length(thesis) <= 500),
  add column if not exists invalidation text
    check (invalidation is null or char_length(invalidation) <= 300),
  add column if not exists confidence_pre smallint
    check (confidence_pre is null or confidence_pre between 1 and 10),
  add column if not exists delta numeric
    check (delta is null or (delta >= -1 and delta <= 1)),
  add column if not exists theta numeric
    check (theta is null or (theta >= -100 and theta <= 100)),
  add column if not exists volume_state text
    check (volume_state is null or volume_state in ('confirming', 'absent'));

alter table public.xrill_outcomes
  add column if not exists confidence_post smallint
    check (confidence_post is null or confidence_post between 1 and 10),
  add column if not exists thesis_result text
    check (thesis_result is null or thesis_result in ('played_out', 'partial', 'failed')),
  add column if not exists exit_reason text
    check (exit_reason is null or exit_reason in ('target', 'stop', 'invalidation', 'emotional', 'time', 'other'));
