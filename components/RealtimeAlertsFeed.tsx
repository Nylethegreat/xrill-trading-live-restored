"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type TradeAlertRow = {
  id: string;
  created_at: string;
  ticker: string;
  direction: "long" | "short";
  entry_price: number;
  stop_loss: number;
  target_price: number;
  notes: string | null;
  status: "active" | "closed";
};

const TOAST_LIFETIME_MS = 10_000;
const TOAST_MAX_VISIBLE = 3;

function AlertCard({ alert }: { alert: TradeAlertRow }) {
  const isLong = alert.direction === "long";
  return (
    <div className={`rounded border p-3 text-sm shadow-lg ${isLong ? "border-accent/30 bg-surface" : "border-loss/30 bg-surface"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-semibold text-white">
          {isLong ? "🟢" : "🔴"} {alert.ticker}{" "}
          <span className="text-white/60">{alert.direction.toUpperCase()}</span>
        </span>
        <span className="text-[10px] text-white/40">
          {new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-white/60">
        <span>Entry ${alert.entry_price}</span>
        <span>Target ${alert.target_price}</span>
        <span>Stop ${alert.stop_loss}</span>
      </div>
      {alert.notes && <p className="mt-1.5 text-xs text-white/50">{alert.notes}</p>}
    </div>
  );
}

/**
 * Live view of public.trade_alerts, driven by Supabase Realtime
 * (postgres_changes INSERT). Elite-tier perk -- requires the viewer to be
 * signed in AND profiles.tier === 'elite' (checked client-side on mount);
 * everyone else sees nothing rendered, silently.
 *
 * variant="toast" (default): a fixed bottom-right stack of popups that
 * appear only for alerts dispatched WHILE this is mounted, then
 * auto-dismiss after ~10s. Mounted once in the root layout for every page.
 *
 * variant="feed": an inline list seeded with the most recent active
 * alerts and kept live thereafter — embed on a page like /account.
 */
export default function RealtimeAlertsFeed({
  variant = "toast",
  limit = 5,
}: {
  variant?: "toast" | "feed";
  limit?: number;
}) {
  const [alerts, setAlerts] = useState<TradeAlertRow[]>([]);
  const supabase = useRef(createClient()).current;
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      // The signals feed (both the site-wide toast in the root layout and
      // the inline "feed" variant) is an Elite-only perk -- check tier here
      // rather than relying on whoever mounts this component to gate it,
      // since the toast variant is mounted unconditionally in app/layout.tsx.
      const { data: profile } = await supabase.from("profiles").select("tier").eq("user_id", user.id).maybeSingle();
      if (cancelled || profile?.tier !== "elite") return;

      if (variant === "feed") {
        const { data } = await supabase
          .from("trade_alerts")
          .select("id, created_at, ticker, direction, entry_price, stop_loss, target_price, notes, status")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(limit);
        if (!cancelled) setAlerts((data as TradeAlertRow[]) ?? []);
      }

      if (cancelled) return;

      const channel = supabase
        .channel("trade_alerts_live")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "trade_alerts" },
          (payload) => {
            const row = payload.new as TradeAlertRow;

            setAlerts((prev) => {
              const next = [row, ...prev];
              return variant === "feed" ? next.slice(0, limit) : next;
            });

            if (variant === "toast") {
              setTimeout(() => {
                setAlerts((prev) => prev.filter((a) => a.id !== row.id));
              }, TOAST_LIFETIME_MS);
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    }

    init();

    return () => {
      cancelled = true;
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, limit]);

  if (variant === "toast") {
    if (alerts.length === 0) return null;
    return (
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
        {alerts.slice(0, TOAST_MAX_VISIBLE).map((a) => (
          <div key={a.id} className="pointer-events-auto">
            <AlertCard alert={a} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.length === 0 ? (
        <p className="text-sm text-white/40">No active alerts right now.</p>
      ) : (
        alerts.map((a) => <AlertCard key={a.id} alert={a} />)
      )}
    </div>
  );
}
