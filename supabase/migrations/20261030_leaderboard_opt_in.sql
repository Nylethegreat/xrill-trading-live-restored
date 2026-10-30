-- Weekly Discipline Board: opt-in only. Off by default, so nobody shows
-- up on the board (or in Discord shout-outs) without choosing to. The
-- board reads other members' rows server-side and only ever renders
-- aggregate scores plus display_name.
alter table public.profiles
  add column if not exists show_on_leaderboard boolean not null default false;
