import { Decimal } from "./money";

/**
 * موتور پیش‌بینی چرخهٔ خرید.
 *
 * در سطح (مشتری × محصول) کار می‌کند. از **میانه** استفاده می‌کند نه میانگین:
 * اگر مشتری معمولاً هر ۱۲ روز بخرد و یک بار ۶۰ روز غایب بوده، میانگین ۲۰ روز
 * می‌دهد ولی میانه همان ۱۲ روز می‌ماند — و برای پیش‌بینی، ۱۲ درست است.
 */

export const DAY_MS = 86_400_000;

export type CycleStatus = "learning" | "active" | "overdue";

export interface Purchase {
  /** تاریخ سفارش */
  date: Date;
  /** مقدار خریداری‌شده از این محصول */
  quantity: Decimal | string | number;
}

export interface CycleConfig {
  /** حداقل تعداد خرید برای اینکه چرخه معتبر شمرده شود */
  minSamples: number;
  /** تاریخ مرجع — پیش‌فرض «امروز». برای تست تزریق می‌شود. */
  today?: Date;
}

export interface CycleResult {
  medianCycleDays: number | null;
  meanCycleDays: number | null;
  sampleSize: number;
  totalQuantity: Decimal;
  lastPurchaseAt: Date | null;
  expectedDate: Date | null;
  dailyConsumption: Decimal;
  estimatedStock: Decimal;
  daysSinceLastPurchase: number | null;
  /** روزهای باقی‌مانده تا خرید پیش‌بینی‌شده — منفی یعنی گذشته */
  daysUntilExpected: number | null;
  status: CycleStatus;
}

/* ------------------------------------------------------------------ median */

/** میانهٔ یک آرایهٔ نامرتب. آرایهٔ خالی → null. */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

/* ------------------------------------------------------------------- cycle */

export function computeCycle(purchases: Purchase[], config: CycleConfig): CycleResult {
  const today = config.today ?? new Date();
  const minSamples = Math.max(2, config.minSamples ?? 2);

  const sorted = [...purchases]
    .filter((p) => !Number.isNaN(p.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const totalQuantity = sorted.reduce<Decimal>(
    (sum, p) => sum.plus(new Decimal(p.quantity.toString())),
    new Decimal(0),
  );

  const empty: CycleResult = {
    medianCycleDays: null,
    meanCycleDays: null,
    sampleSize: sorted.length,
    totalQuantity,
    lastPurchaseAt: sorted.at(-1)?.date ?? null,
    expectedDate: null,
    dailyConsumption: new Decimal(0),
    estimatedStock: new Decimal(0),
    daysSinceLastPurchase: null,
    daysUntilExpected: null,
    status: "learning",
  };

  if (sorted.length < minSamples) return empty;

  // فاصله‌های بین خریدها، به روز
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1].date, sorted[i].date);
    if (gap > 0) intervals.push(gap);
  }

  if (intervals.length === 0) return empty;

  const medianCycleDays = median(intervals)!;
  const meanCycleDays = mean(intervals);

  const lastPurchaseAt = sorted[sorted.length - 1].date;
  const expectedDate = new Date(lastPurchaseAt.getTime() + medianCycleDays * DAY_MS);
  const daysSinceLastPurchase = daysBetween(lastPurchaseAt, today);
  const daysUntilExpected = daysBetween(today, expectedDate);

  const dailyConsumption = medianCycleDays > 0
    ? totalQuantity.dividedBy(sorted.length).dividedBy(medianCycleDays)
    : new Decimal(0);

  const estimatedStock = Decimal.max(
    dailyConsumption.times(Math.max(0, daysSinceLastPurchase)),
    0,
  );

  return {
    medianCycleDays,
    meanCycleDays,
    sampleSize: sorted.length,
    totalQuantity,
    lastPurchaseAt,
    expectedDate,
    dailyConsumption,
    estimatedStock,
    daysSinceLastPurchase,
    daysUntilExpected,
    status: daysUntilExpected < 0 ? "overdue" : "active",
  };
}

/** مقدار پیشنهادی سفارش: مصرف روزانه × طول چرخه، گردشده به بالا. */
export function suggestedOrderQuantity(result: CycleResult): Decimal | null {
  if (result.medianCycleDays === null) return null;
  const quantity = result.dailyConsumption.times(result.medianCycleDays);
  return quantity.toDecimalPlaces(0, Decimal.ROUND_CEIL);
}
