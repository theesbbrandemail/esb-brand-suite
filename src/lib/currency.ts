/**
 * Standard Nigerian Currency (NGN / ₦) Formatter for ESB Brand Suite
 */

export const NAIRA_SYMBOL = "₦";

export function formatNaira(
  amount: number | string | null | undefined,
  options?: {
    compact?: boolean;
    decimals?: number;
    showSymbol?: boolean;
  }
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `${options?.showSymbol !== false ? NAIRA_SYMBOL : ""}0`;
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const showSymbol = options?.showSymbol !== false;
  const symbol = showSymbol ? NAIRA_SYMBOL : "";

  if (options?.compact) {
    if (Math.abs(num) >= 1_000_000_000) {
      return `${symbol}${(num / 1_000_000_000).toFixed(options.decimals ?? 1)}B`;
    }
    if (Math.abs(num) >= 1_000_000) {
      return `${symbol}${(num / 1_000_000).toFixed(options.decimals ?? 1)}M`;
    }
    if (Math.abs(num) >= 1_000) {
      return `${symbol}${(num / 1_000).toFixed(options.decimals ?? 1)}K`;
    }
    return `${symbol}${Math.round(num).toLocaleString("en-NG")}`;
  }

  const decimals = options?.decimals !== undefined ? options.decimals : 0;
  return `${symbol}${num.toLocaleString("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function parseNairaInput(val: string): number {
  const clean = val.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}
