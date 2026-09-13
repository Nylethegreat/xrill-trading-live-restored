"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import { pushTradeAlertUpdate, closeTradeAlert } from "@/app/admin/alerts/actions";

export type ActiveAlert = {
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

function PositionCard({ alert }: { alert: ActiveAlert }) {
  const router = useRouter();
  const isLong = alert.direction === "long";

  const [mode, setMode] = useState<"idle" | "update" | "close">("idle");
  const [updateText, setUpdateText] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [returnPct, setReturnPct] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePushUpdate() {
    setSubmitting(true);
    setError(null);
    const res = await pushTradeAlertUpdate(alert.id, updateText);
    setSubmitting(false);
    if (!res.success) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    setUpdateText("");
    setMode("idle");
    router.refresh();
  }

  async function handleClose() {
    setSubmitting(true);
    setError(null);
    const res = await closeTradeAlert(alert.id, {
      exitPrice: exitPrice.trim() ? parseFloat(exitPrice) : undefined,
      returnPct: returnPct.trim() ? parseFloat(returnPct) : undefined,
    });
    setSubmitting(false);
    if (!res.success) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    setMode("idle");
    router.refresh();
  }

  return (
    <div className="rounded border border-white/10 bg-surface p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono font-semibold text-white">{alert.ticker}</span>
          <Badge tone={isLong ? "good" : "loss"}>{alert.direction.toUpperCase()}</Badge>
          <span className="text-xs text-white/40">
            {new Date(alert.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
        <div className="text-xs text-white/50">
          Entry ${alert.entry_price} · Stop ${alert.stop_loss} · Target ${alert.target_price}
        </div>
      </div>

      {alert.notes && <p className="mt-2 whitespace-pre-line text-xs text-white/50">{alert.notes}</p>}

      {error && <p className="mt-2 text-sm text-blocked">{error}</p>}

      {mode === "idle" && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("update")}
            className="rounded border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:border-primary hover:text-primary"
          >
            Trim / Update
          </button>
          <button
            type="button"
            onClick={() => setMode("close")}
            className="rounded border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:border-loss hover:text-loss"
          >
            Close Position
          </button>
        </div>
      )}

      {mode === "update" && (
        <div className="mt-3 rounded border border-white/10 bg-white/5 p-3">
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-white/60">Status update</span>
            <textarea
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              placeholder="Trimmed 50%, stop moved to breakeven"
              rows={2}
              className="w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={!updateText.trim() || submitting}
              onClick={handlePushUpdate}
              className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Posting..." : "Post Update"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("idle");
                setUpdateText("");
                setError(null);
              }}
              className="rounded border border-white/20 px-3 py-1.5 text-xs text-white/60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === "close" && (
        <div className="mt-3 rounded border border-white/10 bg-white/5 p-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-white/60">Exit price (optional)</span>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-loss"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-white/60">Return % (optional)</span>
              <input
                type="number"
                step="any"
                value={returnPct}
                onChange={(e) => setReturnPct(e.target.value)}
                placeholder="e.g. 42.5 or -18"
                className="w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-loss"
              />
            </label>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={handleClose}
              className="rounded bg-loss px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Closing..." : "Confirm Close (Sell All)"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("idle");
                setExitPrice("");
                setReturnPct("");
                setError(null);
              }}
              className="rounded border border-white/20 px-3 py-1.5 text-xs text-white/60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActivePositions({ alerts }: { alerts: ActiveAlert[] }) {
  if (alerts.length === 0) {
    return <p className="text-sm text-white/40">No active positions right now.</p>;
  }

  return (
    <div className="space-y-3">
      {alerts.map((a) => (
        <PositionCard key={a.id} alert={a} />
      ))}
    </div>
  );
}
