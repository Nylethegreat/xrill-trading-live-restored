"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitTradeAlert } from "@/app/admin/alerts/actions";

type Direction = "long" | "short";

export default function AdminAlertForm() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [direction, setDirection] = useState<Direction>("long");
  const [entryPrice, setEntryPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [gatesPassed, setGatesPassed] = useState("8");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit =
    ticker.trim() !== "" && entryPrice.trim() !== "" && targetPrice.trim() !== "" && stopLoss.trim() !== "";

  function resetForm() {
    setTicker("");
    setEntryPrice("");
    setTargetPrice("");
    setStopLoss("");
    setGatesPassed("8");
    setNotes("");
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const res = await submitTradeAlert({
      ticker,
      direction,
      entryPrice: parseFloat(entryPrice),
      targetPrice: parseFloat(targetPrice),
      stopLoss: parseFloat(stopLoss),
      notes,
      gatesPassed: gatesPassed.trim() === "" ? undefined : parseInt(gatesPassed, 10),
    });

    setSubmitting(false);

    if (!res.success) {
      setError(res.error ?? "Something went wrong.");
      return;
    }

    setSuccess(true);
    resetForm();
    router.refresh();
  }

  return (
    <div className="rounded border border-white/10 bg-white/5 p-4">
      <label className="block text-sm">
        <span className="mb-1 block text-xs text-white/60">Ticker</span>
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="SPY"
          className="w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm uppercase outline-none focus:border-accent"
        />
      </label>

      <div className="mt-3 flex items-center justify-between gap-4 py-1.5 text-sm">
        <span className="text-white/70">Direction</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDirection("long")}
            className={`rounded px-2.5 py-1 text-xs ${
              direction === "long" ? "bg-accent text-black" : "border border-white/20 text-white/60"
            }`}
          >
            Long
          </button>
          <button
            type="button"
            onClick={() => setDirection("short")}
            className={`rounded px-2.5 py-1 text-xs ${
              direction === "short" ? "bg-loss text-white" : "border border-white/20 text-white/60"
            }`}
          >
            Short
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-white/60">Entry</span>
          <input
            type="number"
            step="any"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            className="w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-white/60">Target</span>
          <input
            type="number"
            step="any"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-white/60">Stop Loss</span>
          <input
            type="number"
            step="any"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-accent"
          />
        </label>
      </div>

      <label className="mt-3 block text-sm">
        <span className="mb-1 block text-xs text-white/60">
          Gates Passed <span className="text-white/30">(0–8, shown on the public ledger)</span>
        </span>
        <input
          type="number"
          min={0}
          max={8}
          step={1}
          value={gatesPassed}
          onChange={(e) => setGatesPassed(e.target.value)}
          className="w-24 rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="mt-3 block text-sm">
        <span className="mb-1 block text-xs text-white/60">Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
      </label>

      {error && <p className="mt-2 text-sm text-blocked">{error}</p>}
      {success && <p className="mt-2 text-sm text-accent">Alert dispatched.</p>}

      <button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={handleSubmit}
        className="mt-3 rounded bg-accent px-3 py-1.5 text-sm font-medium text-black hover:opacity-90 disabled:opacity-40"
      >
        {submitting ? "Dispatching..." : "Dispatch Alert"}
      </button>
    </div>
  );
}
