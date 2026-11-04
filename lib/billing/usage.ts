import { USAGE_FEE_PER_LOT_USD_CENTS } from "@/lib/integrations/stripe";

/** Configurable usage fee — default USD $30 per round-turn lot from client guide. */
export function usageAmountCentsFromLots(
  lots: number,
  perLotCents = Number(process.env.USAGE_FEE_PER_LOT_CENTS) ||
    USAGE_FEE_PER_LOT_USD_CENTS,
): number {
  if (!Number.isFinite(lots) || lots < 0) return 0;
  return Math.round(lots * perLotCents);
}

export function formatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}
