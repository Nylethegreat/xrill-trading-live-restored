"use client";

import { useMemo, useState } from "react";
import {
  DAILY_LOSS_DEFAULT_MULTIPLE,
  DAILY_LOSS_MIN_MULTIPLE,
  MAX_RISK_PERCENT,
  MAX_STOP_PERCENT,
  MIN_RISK_PERCENT,
  MIN_STOP_PERCENT,
  computeRiskProfile,
  normalizeDailyLossLimit,
} from "@/lib/riskProfile";

const money = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const inputClass =
  "mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent";

// Balance / Risk % / Structural Stop / Daily Loss Limit, with every derived
// dollar figure recomputed live from lib/riskProfile.ts -- the same math the
// server action re-applies on save and the Risk Manager enforces. The Daily
// Loss Limit can't be set below 1.5x one Max Trade Loss or above the Active
// Sleeve: it auto-follows 2x until the user edits it, and snaps back into
// range on blur instead of showing a conflict.
export default function RiskSettingsFields({
  initialBalance,
  initialRiskPercent,
  initialStopPercent,
  initialDailyLossLimit,
}: {
  initialBalance: number;
  initialRiskPercent: number;
  initialStopPercent: number;
  initialDailyLossLimit: number;
}) {
  const [balance, setBalance] = useState(String(initialBalance));
  const [riskPercent, setRiskPercent] = useState(String(initialRiskPercent));
  const [stopPercent, setStopPercent] = useState(String(initialStopPercent));

  const profile = useMemo(
    () =>
      computeRiskProfile({
        balance: parseFloat(balance) || 0,
        riskPercent: parseFloat(riskPercent),
        stopPercent: parseFloat(stopPercent),
      }),
    [balance, riskPercent, stopPercent]
  );

  // "auto" = follow 2x max trade loss as the other fields change.
  // "custom" = the user typed a value; keep it, but bind it to the range.
  const initialNormalized = normalizeDailyLossLimit(initialDailyLossLimit, profile);
  const [dailyMode, setDailyMode] = useState<"auto" | "custom">(
    initialNormalized.value === profile.dailyLossDefault ? "auto" : "custom"
  );
  const [dailyText, setDailyText] = useState(String(initialNormalized.value));
  const [snapNote, setSnapNote] = useState<string | null>(null);

  const riskNum = parseFloat(riskPercent);
  const riskClamped = Number.isFinite(riskNum) && riskNum !== profile.riskPercent;
  const stopNum = parseFloat(stopPercent);
  const stopClamped = Number.isFinite(stopNum) && stopNum !== profile.stopPercent;

  const dailyValue =
    dailyMode === "auto" ? profile.dailyLossDefault : normalizeDailyLossLimit(parseFloat(dailyText), profile).value;
  const dailyMultiple = profile.maxTradeLoss > 0 ? dailyValue / profile.maxTradeLoss : 0;

  function commitDaily(raw: string) {
    const result = normalizeDailyLossLimit(parseFloat(raw), profile);
    setDailyText(String(result.value));
    if (result.adjusted === "raised") {
      setSnapNote(`Raised to ${money(result.value)}: it can't be below ${DAILY_LOSS_MIN_MULTIPLE}× one max trade loss.`);
    } else if (result.adjusted === "lowered") {
      setSnapNote(`Lowered to ${money(result.value)}: it can't exceed your Active Sleeve (the Idle 40% stays untouched).`);
    } else {
      setSnapNote(null);
    }
  }

  function setMultiple(multiple: number) {
    setDailyMode(multiple === DAILY_LOSS_DEFAULT_MULTIPLE ? "auto" : "custom");
    const value = Math.min(profile.maxTradeLoss * multiple, profile.dailyLossCeiling);
    setDailyText(String(Math.round(value * 100) / 100));
    setSnapNote(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-white/70">Account balance ($)</label>
        <input
          name="balance"
          type="number"
          step="0.01"
          min="1"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-white/70">Risk per trade (% of balance)</label>
          <input
            name="risk_percent"
            type="number"
            step="0.01"
            min={MIN_RISK_PERCENT}
            max={MAX_RISK_PERCENT}
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            onBlur={() => riskClamped && setRiskPercent(String(profile.riskPercent))}
            required
            className={inputClass}
          />
          <p className={`mt-1 text-xs ${riskClamped ? "text-caution" : "text-white/40"}`}>
            {riskClamped
              ? `Capped at ${profile.riskPercent}% (the Risk Tiering Matrix range is ${MIN_RISK_PERCENT}–${MAX_RISK_PERCENT}%).`
              : `${MIN_RISK_PERCENT}–${MAX_RISK_PERCENT}%, from your pace tier.`}
          </p>
        </div>
        <div>
          <label className="block text-sm text-white/70">Structural stop (% of premium)</label>
          <input
            name="stop_loss_percent"
            type="number"
            step="1"
            min={MIN_STOP_PERCENT}
            max={MAX_STOP_PERCENT}
            value={stopPercent}
            onChange={(e) => setStopPercent(e.target.value)}
            onBlur={() => stopClamped && setStopPercent(String(profile.stopPercent))}
            required
            className={inputClass}
          />
          <p className={`mt-1 text-xs ${stopClamped ? "text-caution" : "text-white/40"}`}>
            {stopClamped
              ? `Kept within ${MIN_STOP_PERCENT}–${MAX_STOP_PERCENT}%.`
              : `Exit if the option loses ${profile.stopPercent}% of what you paid.`}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/70">Daily loss limit ($)</label>
        <div className="mt-1 flex gap-2">
          <input
            name="daily_loss_limit"
            type="number"
            step="0.01"
            min={profile.dailyLossFloor}
            max={profile.dailyLossCeiling}
            value={dailyMode === "auto" ? String(profile.dailyLossDefault) : dailyText}
            onChange={(e) => {
              setDailyMode("custom");
              setDailyText(e.target.value);
              setSnapNote(null);
            }}
            onBlur={(e) => commitDaily(e.target.value)}
            required
            className="w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
          {[DAILY_LOSS_MIN_MULTIPLE, DAILY_LOSS_DEFAULT_MULTIPLE].map((m) => {
            const active = Math.abs(dailyMultiple - m) < 0.005;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMultiple(m)}
                className={`shrink-0 rounded border px-3 text-xs font-medium transition-colors ${
                  active ? "border-accent bg-accent/15 text-accent" : "border-white/20 text-white/60 hover:border-white/40"
                }`}
              >
                {m}×
              </button>
            );
          })}
        </div>
        <p className={`mt-1 text-xs ${snapNote ? "text-caution" : "text-white/40"}`}>
          {snapNote ??
            `Allowed range ${money(profile.dailyLossFloor)}–${money(profile.dailyLossCeiling)} (${DAILY_LOSS_MIN_MULTIPLE}× max trade loss up to your Active Sleeve). ${
              dailyMode === "auto" ? `Following ${DAILY_LOSS_DEFAULT_MULTIPLE}× automatically.` : ""
            }`}
        </p>
      </div>

      <div className="rounded border border-white/10 bg-black/20 p-3 font-mono text-xs">
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-white/50">
          Your risk hierarchy (live)
        </p>
        <Row label="Active Sleeve (60%)" value={money(profile.activeSleeve)} />
        <Row label="Idle Sleeve (40%, never traded)" value={money(profile.idleSleeve)} />
        <Row
          label={`Max trade loss (${profile.riskPercent}% of balance)`}
          value={money(profile.maxTradeLoss)}
          tone="text-white"
        />
        <Row
          label={`Max position size at a ${profile.stopPercent}% stop`}
          value={money(profile.maxPositionAtStop)}
        />
        <Row
          label={`Daily loss limit (${dailyMultiple.toFixed(2)}× max trade loss)`}
          value={money(dailyValue)}
          tone="text-white"
        />
        <p className="mt-2 font-sans text-[11px] text-accent">
          ✓ Max trade loss &lt; Daily loss limit ≤ Active Sleeve — one stop-out can never blow the whole day.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, tone = "text-white/70" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="text-white/50">{label}</span>
      <span className={tone}>{value}</span>
    </div>
  );
}
