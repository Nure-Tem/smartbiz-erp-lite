/** App display currency — synced from public.settings.currency (default ETB). */
let activeCurrency = "ETB";

/**
 * Update the currency used by {@link currency}. Call when settings load.
 * Falls back to ETB for empty/invalid codes.
 */
export function setAppCurrency(code: string | null | undefined) {
  const next = (code ?? "").trim().toUpperCase();
  if (!next) {
    activeCurrency = "ETB";
    return;
  }
  try {
    // Validate against Intl before committing
    new Intl.NumberFormat("en-US", { style: "currency", currency: next }).format(0);
    activeCurrency = next;
  } catch {
    activeCurrency = "ETB";
  }
}

export function getAppCurrency() {
  return activeCurrency;
}

export const currency = (value: number) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: activeCurrency || "ETB",
    }).format(value);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(value);
  }
};

export const compactNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
