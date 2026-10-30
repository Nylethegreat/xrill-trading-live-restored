-- Daily Trade Cap: a hard limit on how many real trades (authorized or
-- logged after the fact) can be taken per trading day. Enforced in
-- app/session/actions.ts; this migration stores the setting.
--
-- The cap can be LOWERED any time, effective immediately. A RAISE only
-- takes effect the next trading day (Eastern), so it can't be loosened
-- mid-session to squeeze in one more trade. That rule lives here in a
-- trigger, not only in the app, so a direct REST call can't skip it.

alter table public.accounts
  add column if not exists max_trades_per_day smallint not null default 3
    check (max_trades_per_day between 1 and 10),
  add column if not exists pending_max_trades smallint
    check (pending_max_trades is null or pending_max_trades between 1 and 10),
  add column if not exists pending_max_trades_from date;

create or replace function private.guard_trade_cap()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  today date := (now() at time zone 'America/New_York')::date;
  old_eff smallint;
  req smallint;
begin
  if tg_op = 'INSERT' then
    new.pending_max_trades := null;
    new.pending_max_trades_from := null;
    return new;
  end if;

  old_eff := case
    when old.pending_max_trades is not null and old.pending_max_trades_from <= today
      then old.pending_max_trades
    else old.max_trades_per_day
  end;

  -- Not a cap change (e.g. a balance update): keep pending fields as they
  -- were, promoting a pending raise once its day has come.
  if new.max_trades_per_day = old.max_trades_per_day then
    if old.pending_max_trades is not null and old.pending_max_trades_from <= today then
      new.max_trades_per_day := old.pending_max_trades;
      new.pending_max_trades := null;
      new.pending_max_trades_from := null;
    else
      new.pending_max_trades := old.pending_max_trades;
      new.pending_max_trades_from := old.pending_max_trades_from;
    end if;
    return new;
  end if;

  req := new.max_trades_per_day;

  if req <= old_eff then
    -- Lowering (or matching): applies now, cancels any pending raise.
    new.pending_max_trades := null;
    new.pending_max_trades_from := null;
  else
    -- Raising: today's cap stays, the new one starts tomorrow. Re-saving
    -- the same pending value keeps its original start date.
    new.max_trades_per_day := old_eff;
    new.pending_max_trades := req;
    new.pending_max_trades_from := case
      when old.pending_max_trades = req and old.pending_max_trades_from is not null
        then old.pending_max_trades_from
      else today + 1
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_trade_cap on public.accounts;
create trigger guard_trade_cap
  before insert or update on public.accounts
  for each row execute function private.guard_trade_cap();
