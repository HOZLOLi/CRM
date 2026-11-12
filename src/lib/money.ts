import Decimal from "decimal.js";

/**
 * Money is never a JavaScript `number`.
 *
 * Every amount in this app is a `Decimal` (decimal.js) so that 0.1 + 0.2 is
 * exactly 0.3, tax rounds the way an accountant expects, and no cent is lost
 * when a deal is summed, discounted, or converted.
 *
 * Storage: Prisma `Decimal` columns. Transport: strings over JSON.
 * Arithmetic: only through the helpers below.
 */

// Money rounds half-up (the convention on invoices), never banker's rounding.
Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -12,
  toExpPos: 24,
});

export type MoneyInput = Decimal | string | number | null | undefined;

export const ZERO = new Decimal(0);

/** Coerce anything into a Decimal without ever going through float math. */
export function dec(value: MoneyInput): Decimal {
  if (value === null || value === undefined || value === "") return new Decimal(0);
  if (value instanceof Decimal) return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return new Decimal(0);
    // Stringify first: `new Decimal(0.1)` is fine, but `0.1 + 0.2` already lost.
    return new Decimal(value.toString());
  }
  try {
    return new Decimal(value);
  } catch {
    return new Decimal(0);
  }
}

export const add = (a: MoneyInput, b: MoneyInput) => dec(a).plus(dec(b));
export const sub = (a: MoneyInput, b: MoneyInput) => dec(a).minus(dec(b));
export const mul = (a: MoneyInput, b: MoneyInput) => dec(a).times(dec(b));
export const div = (a: MoneyInput, b: MoneyInput) => {
  const d = dec(b);
  return d.isZero() ? new Decimal(0) : dec(a).dividedBy(d);
};

/** Round to a currency's minor units (IRR has 0, USD/EUR have 2). */
export function round(value: MoneyInput, scale = 2): Decimal {
  return dec(value).toDecimalPlaces(scale, Decimal.ROUND_HALF_UP);
}

export function sum(values: MoneyInput[]): Decimal {
  return values.reduce<Decimal>((acc, v) => acc.plus(dec(v)), new Decimal(0));
}

/** Percentage of an amount, e.g. `percentOf(1_000_000, 9)` → 90,000. */
export function percentOf(amount: MoneyInput, percent: MoneyInput): Decimal {
  return dec(amount).times(dec(percent)).dividedBy(100);
}

/** Apply a percentage discount to an amount. */
export function applyDiscount(amount: MoneyInput, percent: MoneyInput): Decimal {
  return dec(amount).minus(percentOf(amount, percent));
}

export interface LineInput {
  quantity: MoneyInput;
  unitPrice: MoneyInput;
  /** Absolute discount on the line, in currency units. */
  discount?: MoneyInput;
  /** Tax rate as a percentage, e.g. 9 for 9%. */
  taxRate?: MoneyInput;
}

export interface LineTotals {
  net: Decimal;
  tax: Decimal;
  gross: Decimal;
}

/** Totals for a single invoice line: net → tax → gross. */
export function lineTotals(line: LineInput, scale = 2): LineTotals {
  const gross = mul(line.quantity, line.unitPrice);
  const net = Decimal.max(gross.minus(dec(line.discount)), 0);
  const tax = percentOf(net, line.taxRate ?? 0);
  return {
    net: round(net, scale),
    tax: round(tax, scale),
    gross: round(net.plus(tax), scale),
  };
}

export interface DocumentTotals {
  subtotal: Decimal;
  discount: Decimal;
  tax: Decimal;
  total: Decimal;
}

/** Totals for a whole deal / invoice. */
export function documentTotals(lines: LineInput[], scale = 2): DocumentTotals {
  let subtotal = new Decimal(0);
  let discount = new Decimal(0);
  let tax = new Decimal(0);

  for (const line of lines) {
    const gross = mul(line.quantity, line.unitPrice);
    const lineDiscount = Decimal.min(dec(line.discount), gross);
    const net = gross.minus(lineDiscount);
    subtotal = subtotal.plus(gross);
    discount = discount.plus(lineDiscount);
    tax = tax.plus(percentOf(net, line.taxRate ?? 0));
  }

  const total = subtotal.minus(discount).plus(tax);
  return {
    subtotal: round(subtotal, scale),
    discount: round(discount, scale),
    tax: round(tax, scale),
    total: round(total, scale),
  };
}

/** Weighted pipeline value: Σ(amount × probability). */
export function weightedValue(amount: MoneyInput, probability: MoneyInput): Decimal {
  return round(percentOf(amount, probability), 2);
}

const CURRENCY_SCALE: Record<string, number> = {
  IRR: 0,
  IRT: 0,
  USD: 2,
  EUR: 2,
  AED: 2,
  GBP: 2,
};

export function currencyScale(currency = "IRR"): number {
  return CURRENCY_SCALE[currency] ?? 2;
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function toLatinDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export interface FormatOptions {
  currency?: string;
  /** Show the currency symbol. Default true. */
  symbol?: boolean;
  /** Persian digits. Default true. */
  persian?: boolean;
  /** Compact form for dashboards: ۱۲٫۴ میلیون */
  compact?: boolean;
  /** Always show the sign (+/−). */
  signed?: boolean;
}

const SYMBOLS: Record<string, string> = {
  IRR: "ریال",
  IRT: "تومان",
  USD: "$",
  EUR: "€",
  AED: "د.إ",
  GBP: "£",
};

/** Format a Decimal for display. Never used for arithmetic. */
export function formatMoney(value: MoneyInput, options: FormatOptions = {}): string {
  const {
    currency = "IRR",
    symbol = true,
    persian = true,
    compact = false,
    signed = false,
  } = options;

  const scale = currencyScale(currency);
  const amount = round(value, scale);
  const negative = amount.isNegative();
  const abs = amount.abs();

  let body: string;

  if (compact) {
    body = compactNumber(abs, persian);
  } else {
    const fixed = abs.toFixed(scale);
    const [intPart, fracPart] = fixed.split(".");
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
    body = fracPart ? `${grouped}٫${fracPart}` : grouped;
    if (persian) body = toPersianDigits(body);
  }

  const sign = negative ? "−" : signed ? "+" : "";
  const unit = symbol ? ` ${SYMBOLS[currency] ?? currency}` : "";

  return `${sign}${body}${unit}`;
}

/** 12_400_000 → "۱۲٫۴ میلیون" */
export function compactNumber(value: MoneyInput, persian = true): string {
  const n = dec(value).abs();
  const units: Array<[Decimal, string]> = [
    [new Decimal(1_000_000_000), "میلیارد"],
    [new Decimal(1_000_000), "میلیون"],
    [new Decimal(1_000), "هزار"],
  ];

  for (const [threshold, label] of units) {
    if (n.greaterThanOrEqualTo(threshold)) {
      const scaled = n.dividedBy(threshold).toDecimalPlaces(1, Decimal.ROUND_HALF_UP);
      const text = scaled.toFixed(1).replace(/\.0$/, "").replace(".", "٫");
      return `${persian ? toPersianDigits(text) : text} ${label}`;
    }
  }
  return persian ? toPersianDigits(n.toFixed(0)) : n.toFixed(0);
}

/** Serialize for JSON transport — always a string, never a float. */
export function serializeMoney(value: MoneyInput): string {
  return round(value, 2).toFixed(2);
}

/** Parse user input that may contain Persian digits, separators, or symbols. */
export function parseMoney(input: string): Decimal {
  const cleaned = toLatinDigits(input)
    .replace(/[٬,\s]/g, "")
    .replace(/[٫]/g, ".")
    .replace(/[^\d.\-+]/g, "");
  return dec(cleaned);
}

/** Percentage change between two amounts, as a Decimal percentage. */
export function percentChange(from: MoneyInput, to: MoneyInput): Decimal {
  const base = dec(from);
  if (base.isZero()) return new Decimal(0);
  return round(dec(to).minus(base).dividedBy(base.abs()).times(100), 1);
}

export { Decimal };
