// Multi-leg option structures that XRILL treats as ONE position. Every
// structure here is a net DEBIT: you pay one combined premium up front, so
// the existing Trade Plan / Risk Manager math works unchanged -- the net
// debit simply becomes the "entry premium", the stop and target are on the
// value of the whole structure, and contracts means "how many spreads".
//
//   single   -- one call or put (the original flow)
//   vertical -- debit spread: buy one strike, sell another, same type and
//               expiry. Max value = strike width, so the target can't exceed it.
//   straddle -- buy a call AND a put (same strike = straddle, different
//               strikes = strangle). No max value.
//
// Credit spreads aren't modeled yet: their risk is (width - credit), which
// doesn't fit the debit-based engine without a separate code path.

import type { OptionType } from "@/lib/xrill";

export type Structure = "single" | "vertical" | "straddle";

export interface Leg {
  side: "BUY" | "SELL";
  type: OptionType;
  strike: number;
  premium: number;
}

export interface StructureResult {
  valid: boolean;
  error?: string;
  netDebit?: number; // per-share premium, like a single option's price
  width?: number; // vertical only: strike distance = max structure value
  label?: string; // e.g. "560/565 C Spread", "570C / 550P Strangle"
}

export const STRUCTURE_LABELS: Record<Structure, string> = {
  single: "Single Option",
  vertical: "Vertical Spread",
  straddle: "Straddle / Strangle",
};

const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
const fmtStrike = (v: number) => (Number.isInteger(v) ? v.toFixed(0) : String(+v.toFixed(2)));

export function isStructure(value: unknown): value is Structure {
  return value === "single" || value === "vertical" || value === "straddle";
}

function validLeg(l: Partial<Leg> | undefined): l is Leg {
  return (
    !!l &&
    (l.side === "BUY" || l.side === "SELL") &&
    (l.type === "CALL" || l.type === "PUT") &&
    typeof l.strike === "number" &&
    Number.isFinite(l.strike) &&
    l.strike > 0 &&
    typeof l.premium === "number" &&
    Number.isFinite(l.premium) &&
    l.premium >= 0
  );
}

export function evaluateStructure(structure: Structure, legs: Partial<Leg>[] | null | undefined): StructureResult {
  if (structure === "single") return { valid: true };
  if (!legs || legs.length !== 2 || !legs.every(validLeg)) {
    return { valid: false, error: "Fill in both legs: strike and premium for each." };
  }
  const [a, b] = legs as Leg[];

  if (structure === "vertical") {
    if (a.type !== b.type) return { valid: false, error: "A vertical spread uses two calls or two puts, not one of each." };
    const buy = a.side === "BUY" ? a : b.side === "BUY" ? b : null;
    const sell = a.side === "SELL" ? a : b.side === "SELL" ? b : null;
    if (!buy || !sell) return { valid: false, error: "A vertical spread has one leg you buy and one you sell." };
    if (buy.strike === sell.strike) return { valid: false, error: "The two strikes must be different." };
    const netDebit = round2(buy.premium - sell.premium);
    if (netDebit <= 0) {
      return {
        valid: false,
        error: "That's a net credit. XRILL only models debit spreads for now: the leg you buy must cost more than the one you sell.",
      };
    }
    const width = round2(Math.abs(buy.strike - sell.strike));
    if (netDebit >= width) return { valid: false, error: `Paying $${netDebit.toFixed(2)} for a $${width.toFixed(2)}-wide spread leaves no profit potential.` };
    const lo = Math.min(buy.strike, sell.strike);
    const hi = Math.max(buy.strike, sell.strike);
    return { valid: true, netDebit, width, label: `${fmtStrike(lo)}/${fmtStrike(hi)} ${a.type === "CALL" ? "C" : "P"} Spread` };
  }

  // straddle / strangle: buy one call and one put
  if (a.side !== "BUY" || b.side !== "BUY") return { valid: false, error: "A straddle or strangle buys both legs." };
  const call = a.type === "CALL" ? a : b.type === "CALL" ? b : null;
  const put = a.type === "PUT" ? a : b.type === "PUT" ? b : null;
  if (!call || !put) return { valid: false, error: "A straddle or strangle is one call plus one put." };
  const netDebit = round2(call.premium + put.premium);
  if (netDebit <= 0) return { valid: false, error: "Enter the premium you paid for each leg." };
  const same = call.strike === put.strike;
  return {
    valid: true,
    netDebit,
    label: same ? `${fmtStrike(call.strike)} Straddle` : `${fmtStrike(call.strike)}C / ${fmtStrike(put.strike)}P Strangle`,
  };
}

/** Default legs when a user switches structure in the Trade Plan. */
export function defaultLegs(structure: Structure, optionType: OptionType): Leg[] {
  if (structure === "vertical") {
    return [
      { side: "BUY", type: optionType, strike: NaN, premium: NaN },
      { side: "SELL", type: optionType, strike: NaN, premium: NaN },
    ];
  }
  if (structure === "straddle") {
    return [
      { side: "BUY", type: "CALL", strike: NaN, premium: NaN },
      { side: "BUY", type: "PUT", strike: NaN, premium: NaN },
    ];
  }
  return [];
}

/** Display label for a stored session (open-position card, journal). */
export function structureLabel(structure: string | null | undefined, legs: unknown): string | null {
  if (!isStructure(structure) || structure === "single" || !Array.isArray(legs)) return null;
  const r = evaluateStructure(structure, legs as Partial<Leg>[]);
  return r.valid ? r.label ?? null : null;
}
