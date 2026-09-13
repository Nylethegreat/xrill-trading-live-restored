"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// Admin Signal Dispatcher: an admin manually publishes a trade setup here,
// posts running Trim/Update notes against it, and closes it out. Every
// write lands in public.trade_alerts (which every signed-in member can
// read — Supabase Realtime pushes it to anyone browsing the site) and is
// best-effort mirrored to Discord via webhook.

type TradeAlertRow = {
  id: string;
  ticker: string;
  direction: "long" | "short";
  entry_price: number;
  stop_loss: number;
  target_price: number;
  notes: string | null;
  status: "active" | "closed";
  exit_price: number | null;
  return_pct: number | null;
  gates_passed: number | null;
};

export interface TradeAlertInput {
  ticker: string;
  direction: "long" | "short";
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  notes?: string;
  // How many of the 8 XRILL gates this trade cleared when run through the
  // wizard before dispatching. Optional — defaults to a full 8/8 clean pass.
  gatesPassed?: number;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

// Re-confirms admin status server-side (never trust the client for this —
// public.trade_alerts' RLS policies re-check it too) and hands back the
// authed client + user id for the caller to use.
async function requireAdmin(): Promise<
  | { ok: true; supabase: SupabaseClient; userId: string }
  | { ok: false; error: string }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { ok: false, error: "Not authorized." };
  }

  return { ok: true, supabase, userId: user.id };
}

export async function submitTradeAlert(input: TradeAlertInput): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };
  const { supabase, userId } = auth;

  const ticker = input.ticker.trim().toUpperCase();
  const notes = input.notes?.trim() || null;

  if (!ticker) return { success: false, error: "Ticker is required." };
  if (input.direction !== "long" && input.direction !== "short") {
    return { success: false, error: "Direction must be long or short." };
  }
  if (![input.entryPrice, input.stopLoss, input.targetPrice].every((n) => Number.isFinite(n) && n > 0)) {
    return { success: false, error: "Entry, stop, and target must all be positive numbers." };
  }

  let gatesPassed: number | null = 8;
  if (input.gatesPassed !== undefined) {
    if (!Number.isInteger(input.gatesPassed) || input.gatesPassed < 0 || input.gatesPassed > 8) {
      return { success: false, error: "Gates passed must be a whole number from 0 to 8." };
    }
    gatesPassed = input.gatesPassed;
  }

  const { data: alert, error: insertError } = await supabase
    .from("trade_alerts")
    .insert({
      ticker,
      direction: input.direction,
      entry_price: input.entryPrice,
      stop_loss: input.stopLoss,
      target_price: input.targetPrice,
      notes,
      created_by: userId,
      gates_passed: gatesPassed,
    })
    .select()
    .single();

  if (insertError || !alert) {
    return { success: false, error: insertError?.message ?? "Failed to save the alert." };
  }

  try {
    await postEmbedToDiscord(buildDispatchEmbed(alert));
  } catch (err) {
    console.error("Discord webhook failed:", err);
  }

  revalidatePath("/admin/alerts");
  revalidatePath("/account");
  revalidatePath("/");

  return { success: true };
}

// Trim / Update: appends a timestamped line to notes and posts a follow-up
// embed. Doesn't touch status — the position is still active.
export async function pushTradeAlertUpdate(alertId: string, updateText: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };
  const { supabase } = auth;

  const text = updateText.trim();
  if (!text) return { success: false, error: "Update text is required." };

  const { data: existing, error: fetchError } = await supabase
    .from("trade_alerts")
    .select("*")
    .eq("id", alertId)
    .single();

  if (fetchError || !existing) {
    return { success: false, error: fetchError?.message ?? "Alert not found." };
  }

  const stamp = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const line = `[${stamp}] ${text}`;
  const notes = existing.notes ? `${existing.notes}\n${line}` : line;

  const { data: updated, error: updateError } = await supabase
    .from("trade_alerts")
    .update({ notes })
    .eq("id", alertId)
    .select()
    .single();

  if (updateError || !updated) {
    return { success: false, error: updateError?.message ?? "Failed to save the update." };
  }

  try {
    await postEmbedToDiscord(buildUpdateEmbed(updated, text));
  } catch (err) {
    console.error("Discord webhook failed:", err);
  }

  revalidatePath("/admin/alerts");
  revalidatePath("/account");

  return { success: true };
}

export interface ClosePositionInput {
  exitPrice?: number;
  returnPct?: number;
}

// Close Position (Sell All): marks the alert closed, records an optional
// exit price / return %, and posts a color-coded outcome embed.
export async function closeTradeAlert(alertId: string, input: ClosePositionInput): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };
  const { supabase } = auth;

  const exitPrice = input.exitPrice !== undefined && Number.isFinite(input.exitPrice) ? input.exitPrice : null;
  const returnPct = input.returnPct !== undefined && Number.isFinite(input.returnPct) ? input.returnPct : null;

  const { data: updated, error: updateError } = await supabase
    .from("trade_alerts")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
      exit_price: exitPrice,
      return_pct: returnPct,
    })
    .eq("id", alertId)
    .eq("status", "active")
    .select()
    .single();

  if (updateError || !updated) {
    return { success: false, error: updateError?.message ?? "Failed to close the position." };
  }

  try {
    await postEmbedToDiscord(buildClosedEmbed(updated));
  } catch (err) {
    console.error("Discord webhook failed:", err);
  }

  revalidatePath("/admin/alerts");
  revalidatePath("/account");
  revalidatePath("/");

  return { success: true };
}

// Public Stage Status: updates the homepage hero pill's underlying label
// (public.public_status.current_stage, id=1 — a free-text label the admin
// sets directly). Separate from any real per-user account balance — this
// is the marketing-facing "current stage" figure.
export async function updatePublicStatus(currentStage: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };
  const { supabase } = auth;

  const label = currentStage.trim();
  if (!label) {
    return { success: false, error: "Enter a stage label." };
  }

  const { error } = await supabase
    .from("public_status")
    .update({ current_stage: label, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  return { success: true };
}

function priceFields(alert: TradeAlertRow) {
  return [
    { name: "Entry", value: `$${alert.entry_price}`, inline: true },
    { name: "Target", value: `$${alert.target_price}`, inline: true },
    { name: "Stop", value: `$${alert.stop_loss}`, inline: true },
  ];
}

function buildDispatchEmbed(alert: TradeAlertRow) {
  const isLong = alert.direction === "long";
  return {
    title: `${isLong ? "🟢 LONG" : "🔴 SHORT"} — ${alert.ticker}`,
    color: isLong ? 0x22c55e : 0xef4444,
    fields: [
      ...priceFields(alert),
      ...(alert.gates_passed !== null ? [{ name: "Gates Passed", value: `${alert.gates_passed}/8`, inline: true }] : []),
      ...(alert.notes ? [{ name: "Notes", value: alert.notes }] : []),
    ],
    timestamp: new Date().toISOString(),
  };
}

function buildUpdateEmbed(alert: TradeAlertRow, updateText: string) {
  return {
    title: `🔄 UPDATE — ${alert.ticker} ${alert.direction.toUpperCase()}`,
    color: 0xeab308,
    fields: [{ name: "Update", value: updateText }, ...priceFields(alert)],
    timestamp: new Date().toISOString(),
  };
}

// Wins are judged by direction: a long that exits above entry (or a
// short that exits below it) is green; the reverse is red. If only
// return_pct was logged, its sign decides. With neither, it's neutral.
function buildClosedEmbed(alert: TradeAlertRow) {
  const isLong = alert.direction === "long";
  let isWin: boolean | null = null;

  if (alert.exit_price !== null) {
    isWin = isLong ? alert.exit_price >= alert.entry_price : alert.exit_price <= alert.entry_price;
  } else if (alert.return_pct !== null) {
    isWin = alert.return_pct >= 0;
  }

  const color = isWin === null ? 0x94a3b8 : isWin ? 0x22c55e : 0xef4444;
  const emoji = isWin === null ? "⚪" : isWin ? "🟢" : "🔴";

  const fields = [...priceFields(alert)];
  if (alert.exit_price !== null) fields.push({ name: "Exit", value: `$${alert.exit_price}`, inline: true });
  if (alert.return_pct !== null) {
    fields.push({ name: "Return", value: `${alert.return_pct > 0 ? "+" : ""}${alert.return_pct}%`, inline: true });
  }

  return {
    title: `${emoji} CLOSED — ${alert.ticker} ${alert.direction.toUpperCase()}`,
    color,
    fields,
    timestamp: new Date().toISOString(),
  };
}

async function postEmbedToDiscord(embed: Record<string, unknown>) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (!res.ok) {
    throw new Error(`Discord webhook responded with ${res.status}`);
  }
}
