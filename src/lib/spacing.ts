/**
 * ماژول یادآوری فاصله‌دار (اثر فاصله‌گذاری).
 *
 * مشتری خارج از چرخهٔ خرید روزمره نباید از ذهن برود، ولی نباید هم رباتیک
 * به‌نظر برسد. فاصله در یک **بازهٔ تصادفی** انتخاب می‌شود، نه یک عدد ثابت:
 * ارسال دقیقاً هر ۷ روز، الگوی ماشینی می‌سازد و اثر یادآوری را از بین می‌برد.
 */

export interface SpacingBucket {
  /** بالای این بازهٔ نگهداری، این قانون اعمال می‌شود */
  maxDays: number;
  minInterval: number;
  maxInterval: number;
}

export interface SpacingConfig {
  enabled: boolean;
  buckets: SpacingBucket[];
}

export interface SpacingPlan {
  bucket: SpacingBucket | null;
  intervalDays: number;
  nextTouchDate: Date;
  daysSinceLastPurchase: number;
}

const DAY_MS = 86_400_000;

/** نزدیک‌ترین بازهٔ نگهداری برای این تعداد روز. */
export function pickBucket(daysSinceLastPurchase: number, buckets: SpacingBucket[]): SpacingBucket | null {
  if (buckets.length === 0) return null;
  const sorted = [...buckets].sort((a, b) => a.maxDays - b.maxDays);
  return sorted.find((b) => daysSinceLastPurchase <= b.maxDays) ?? sorted[sorted.length - 1];
}

/** عدد تصادفی در [min, max] با یک رقم اعشار. */
function randomInterval(min: number, max: number, rng: () => number = Math.random): number {
  if (max <= min) return min;
  return Math.round((min + rng() * (max - min)) * 10) / 10;
}

export function planSpacing(
  lastPurchaseAt: Date,
  config: SpacingConfig,
  options: { today?: Date; lastTouchAt?: Date; rng?: () => number } = {},
): SpacingPlan | null {
  if (!config.enabled) return null;

  const today = options.today ?? new Date();
  const daysSinceLastPurchase = Math.round(
    (today.getTime() - lastPurchaseAt.getTime()) / DAY_MS,
  );

  const bucket = pickBucket(daysSinceLastPurchase, config.buckets);
  if (!bucket) return null;

  const intervalDays = randomInterval(bucket.minInterval, bucket.maxInterval, options.rng);
  const anchor = options.lastTouchAt ?? lastPurchaseAt;
  const nextTouchDate = new Date(anchor.getTime() + intervalDays * DAY_MS);

  return { bucket, intervalDays, nextTouchDate, daysSinceLastPurchase };
}

/** آیا امروز نوبت ارتباط است؟ */
export function isSpacingDue(plan: SpacingPlan, today: Date = new Date()): boolean {
  return plan.nextTouchDate.getTime() <= today.getTime();
}
