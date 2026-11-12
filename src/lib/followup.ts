import type { BandKey, Channel, RangeKey } from "./settings";

/**
 * ماتریس تصمیم کارتابل.
 *
 * (دمای مشتری × فاصله تا خرید احتمالی) → مرحلهٔ اقدام، کانال، اولویت.
 * علاوه بر آن، قواعد ایمنی که هرگز نباید نقض شوند.
 */

export type Priority = "P1" | "P2" | "P3";

export interface FollowUpRules {
  matrix: Record<BandKey, Record<RangeKey, number>>;
  channels: Record<BandKey, Channel>;
  maxUnansweredCalls: number;
}

export interface FollowUpInput {
  band: BandKey;
  expectedDate: Date | null;
  /** تاریخ توافق‌شده با مشتری — بر پیش‌بینی سیستم اولویت دارد */
  agreedNextContact?: Date | null;
  contactAllowed: boolean;
  /** تعداد تماس‌های بی‌پاسخ تا این لحظه */
  attempts?: number;
  /** مشتری صریحاً درخواست فوری داشته (معیار «درخواست اقدام» = سقف) */
  urgent?: boolean;
  today?: Date;
}

export interface FollowUpDecision {
  blocked: boolean;
  blockReason?: string;
  stage: number;
  channel: Channel;
  priority: Priority;
  range: RangeKey;
  daysUntil: number | null;
  dueDate: Date;
  /** چرا این تصمیم گرفته شد — برای DecisionLog و نمایش به فروشنده */
  reasons: string[];
}

const DAY_MS = 86_400_000;

/** فاصله به روز → کلید بازه */
export function rangeFromDays(days: number): RangeKey {
  if (days > 15) return "gt15";
  if (days >= 8) return "d8to15";
  if (days >= 4) return "d4to7";
  if (days >= 1) return "d1to3";
  return "due";
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

export function decideFollowUp(input: FollowUpInput, rules: FollowUpRules): FollowUpDecision {
  const today = input.today ?? new Date();
  const reasons: string[] = [];

  const baseDate = input.agreedNextContact ?? input.expectedDate ?? today;
  if (input.agreedNextContact) {
    reasons.push("تاریخ توافق‌شده با مشتری بر پیش‌بینی سیستم اولویت دارد");
  }

  const daysUntil = daysBetween(today, baseDate);
  const range = rangeFromDays(daysUntil);

  // ---- قانون ۱: منع تماس -------------------------------------------------
  if (!input.contactAllowed) {
    return {
      blocked: true,
      blockReason: "مشتری درخواست عدم تماس داده است",
      stage: 1,
      channel: "sms",
      priority: "P3",
      range,
      daysUntil,
      dueDate: baseDate,
      reasons: ["منع تماس فعال است — هیچ اقدام تماسی مجاز نیست"],
    };
  }

  const stage = rules.matrix[input.band][range];
  let channel = rules.channels[input.band];

  reasons.push(`دمای ${input.band} × بازهٔ ${range} ← مرحلهٔ ${stage}`);

  // ---- قانون ۲: دو تماس بی‌پاسخ ------------------------------------------
  const attempts = input.attempts ?? 0;
  if (attempts >= rules.maxUnansweredCalls && channel === "call") {
    channel = "whatsapp";
    reasons.push(
      `${attempts} تماس بی‌پاسخ — تماس تلفنی متوقف شد و کانال به واتساپ تغییر کرد`,
    );
  }

  // ---- قانون ۴: درخواست فوری ---------------------------------------------
  let priority: Priority = "P3";
  if (input.urgent) {
    priority = "P1";
    reasons.push("درخواست فوری مشتری — اولویت P1 بدون توجه به بقیهٔ معیارها");
  } else if (daysUntil <= 0) {
    priority = "P2";
    reasons.push("تاریخ خرید رسیده یا گذشته است");
  } else if (input.band === "veryHot" && daysUntil <= 3) {
    priority = "P2";
    reasons.push("مشتری داغ در فاصلهٔ ۳ روز تا خرید");
  } else if (input.band === "hot" && daysUntil <= 7) {
    priority = "P2";
    reasons.push("مشتری گرم در فاصلهٔ یک هفته تا خرید");
  }

  return {
    blocked: false,
    stage,
    channel,
    priority,
    range,
    daysUntil,
    dueDate: baseDate,
    reasons,
  };
}

/** مقدار پیش‌فرض را در قالب پیام می‌نشاند. */
export function renderMessage(
  template: string,
  vars: Record<string, string | number | null | undefined>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = vars[key];
    return value === null || value === undefined || value === "" ? "" : String(value);
  });
}

/** متن آمادهٔ هر مرحله — کوتاه‌شده برای نمایش در کارت. */
export function previewMessage(text: string, max = 90): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}

/**
 * ارزش سالانهٔ تخمینی مشتری — برای مرتب‌سازی کارتابل بر اساس اهمیت.
 * اگر چرخه ناشناخته باشد، فرض ماهانه استفاده می‌شود و برچسب «تخمینی» می‌خورد.
 */
export function annualValue(
  avgOrderValue: number,
  cycleDays: number | null,
): { value: number; estimated: boolean } {
  if (cycleDays && cycleDays > 0) {
    return { value: Math.round((avgOrderValue * 365) / cycleDays), estimated: false };
  }
  return { value: Math.round(avgOrderValue * 12), estimated: true };
}
