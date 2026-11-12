import { z } from "zod";

/**
 * تنظیمات پویا — قلب «قابل ویرایش بودن» برنامه.
 *
 * هیچ عدد جادویی در سرویس‌ها نیست. وزن‌ها، آستانه‌ها، بازه‌ها و متن‌ها همه از
 * اینجا می‌آیند و مدیر می‌تواند بدون تغییر کد آن‌ها را عوض کند.
 */

/* ------------------------------------------------------------ temperature */

export const criterionOptionSchema = z.object({
  label: z.string().min(1),
  /** null یعنی «اطلاعی ندارم» — صفر نیست، سقف را از پوشش خارج می‌کند */
  points: z.number().int().min(0).nullable(),
});

export const criterionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  max: z.number().int().min(1).max(100),
  options: z.array(criterionOptionSchema).min(2),
});

export const criteriaSchema = z.array(criterionSchema).min(1);

export const bandsSchema = z.object({
  cold: z.number().int().min(0).max(100),
  warm: z.number().int().min(0).max(100),
  hot: z.number().int().min(0).max(100),
});

/* ---------------------------------------------------------------- followup */

export const BAND_KEYS = ["cold", "warm", "hot", "veryHot"] as const;
export const RANGE_KEYS = ["gt15", "d8to15", "d4to7", "d1to3", "due"] as const;

export type BandKey = (typeof BAND_KEYS)[number];
export type RangeKey = (typeof RANGE_KEYS)[number];
export type Channel = "call" | "sms" | "whatsapp";

export const RANGE_LABELS: Record<RangeKey, string> = {
  gt15: "بیش از ۱۵ روز",
  d8to15: "۸ تا ۱۵ روز",
  d4to7: "۴ تا ۷ روز",
  d1to3: "۱ تا ۳ روز",
  due: "امروز یا گذشته",
};

export const BAND_LABELS: Record<BandKey, string> = {
  cold: "سرد",
  warm: "نیمه‌گرم",
  hot: "گرم",
  veryHot: "داغ",
};

export const STAGE_LABELS: Record<number, string> = {
  1: "حضور غیرمستقیم برند",
  2: "یادآوری ملایم",
  3: "تماس انسانی",
  4: "ارائه مزیت رقابتی",
  5: "بررسی موجودی انبار",
  6: "پیشنهاد تجاری",
  7: "درخواست سفارش قطعی",
};

export const matrixSchema = z.record(
  z.enum(BAND_KEYS),
  z.record(z.enum(RANGE_KEYS), z.number().int().min(1).max(7)),
);

export const channelsSchema = z.record(z.enum(BAND_KEYS), z.enum(["call", "sms", "whatsapp"]));

export const messagesSchema = z.record(
  z.string().regex(/^[1-7]$/),
  z.string().min(1),
);

/* ------------------------------------------------------------------ spacing */

export const spacingBucketSchema = z.object({
  maxDays: z.number().int().min(1),
  minInterval: z.number().min(0.5),
  maxInterval: z.number().min(0.5),
});

export const spacingSchema = z.object({
  enabled: z.boolean(),
  buckets: z.array(spacingBucketSchema).min(1),
});

/* --------------------------------------------------------------------- all */

export const SETTING_GROUPS = {
  temperatureCriteria: "temperature",
  temperatureBands: "temperature",
  coverageThreshold: "temperature",
  followupMatrix: "followup",
  followupChannels: "followup",
  followupMessages: "followup",
  cycleMinSamples: "cycle",
  spacing: "spacing",
  safetyMaxUnansweredCalls: "safety",
} as const;

export const SETTING_SCHEMAS = {
  temperatureCriteria: criteriaSchema,
  temperatureBands: bandsSchema,
  coverageThreshold: z.number().min(0.1).max(1),
  followupMatrix: matrixSchema,
  followupChannels: channelsSchema,
  followupMessages: messagesSchema,
  cycleMinSamples: z.number().int().min(2).max(10),
  spacing: spacingSchema,
  safetyMaxUnansweredCalls: z.number().int().min(1).max(10),
} as const;

export type SettingsKey = keyof typeof SETTING_SCHEMAS;

export interface AppSettings {
  temperatureCriteria: z.infer<typeof criteriaSchema>;
  temperatureBands: z.infer<typeof bandsSchema>;
  coverageThreshold: number;
  followupMatrix: z.infer<typeof matrixSchema>;
  followupChannels: z.infer<typeof channelsSchema>;
  followupMessages: z.infer<typeof messagesSchema>;
  cycleMinSamples: number;
  spacing: z.infer<typeof spacingSchema>;
  safetyMaxUnansweredCalls: number;
}

/* --------------------------------------------------------------- defaults */

export const DEFAULT_SETTINGS: AppSettings = {
  temperatureCriteria: [
    {
      key: "need",
      label: "نیاز فعلی",
      max: 30,
      options: [
        { label: "بدون نیاز", points: 0 },
        { label: "نامشخص در آینده", points: 5 },
        { label: "ماه آینده", points: 15 },
        { label: "هفته آینده", points: 22 },
        { label: "فوری", points: 30 },
        { label: "اطلاعی ندارم", points: null },
      ],
    },
    {
      key: "interest",
      label: "علاقه به محصول",
      max: 15,
      options: [
        { label: "بدون علاقه", points: 0 },
        { label: "سؤال از گروه کالا", points: 5 },
        { label: "بررسی محصول مشخص", points: 10 },
        { label: "اعلام تیراژ و مشخصات", points: 15 },
        { label: "اطلاعی ندارم", points: null },
      ],
    },
    {
      key: "price",
      label: "سؤال درباره قیمت و شرایط",
      max: 15,
      options: [
        { label: "بدون سؤال", points: 0 },
        { label: "سؤال از قیمت", points: 5 },
        { label: "مقایسه قیمت و کیفیت", points: 10 },
        { label: "سؤال از شرایط تسویه/ارسال/پیش‌فاکتور", points: 15 },
        { label: "اطلاعی ندارم", points: null },
      ],
    },
    {
      key: "engagement",
      label: "مشارکت در مکالمه",
      max: 10,
      options: [
        { label: "بدون مشارکت", points: 0 },
        { label: "پاسخ به سؤال‌ها", points: 3 },
        { label: "گفت‌وگوی فعال", points: 7 },
        { label: "پرسشگری فعال", points: 10 },
        { label: "اطلاعی ندارم", points: null },
      ],
    },
    {
      key: "initiation",
      label: "شروع ارتباط",
      max: 10,
      options: [
        { label: "تماس فروشنده", points: 0 },
        { label: "پاسخ به پیام فروشنده", points: 4 },
        { label: "تماس یا درخواست اولیه مشتری", points: 10 },
        { label: "اطلاعی ندارم", points: null },
      ],
    },
    {
      key: "competitor",
      label: "مقایسه رقبا",
      max: 10,
      options: [
        { label: "بدون مقایسه", points: 0 },
        { label: "سؤال از قیمت رقبا", points: 3 },
        { label: "مقایسه قیمت و کیفیت", points: 7 },
        { label: "بررسی جایگزینی تأمین‌کننده", points: 10 },
        { label: "اطلاعی ندارم", points: null },
      ],
    },
    {
      key: "action",
      label: "درخواست اقدام تجاری",
      max: 10,
      options: [
        { label: "بدون درخواست", points: 0 },
        { label: "درخواست اطلاعات و کاتالوگ", points: 3 },
        { label: "درخواست لیست قیمت", points: 5 },
        { label: "درخواست پیش‌فاکتور یا ثبت سفارش", points: 10 },
        { label: "اطلاعی ندارم", points: null },
      ],
    },
  ],

  temperatureBands: { cold: 24, warm: 49, hot: 74 },

  coverageThreshold: 0.8,

  followupMatrix: {
    cold: { gt15: 1, d8to15: 2, d4to7: 2, d1to3: 3, due: 3 },
    warm: { gt15: 2, d8to15: 2, d4to7: 3, d1to3: 4, due: 5 },
    hot: { gt15: 4, d8to15: 4, d4to7: 5, d1to3: 6, due: 7 },
    veryHot: { gt15: 6, d8to15: 6, d4to7: 7, d1to3: 7, due: 7 },
  },

  followupChannels: {
    cold: "sms",
    warm: "whatsapp",
    hot: "call",
    veryHot: "call",
  },

  followupMessages: {
    "1": "{{customer}} جان، محصولات جدید {{brand}} رسید. اگر خواستی، کاتالوگ را برایت می‌فرستم.",
    "2": "سلام {{customer}}، مدتی است سفارش ندادی. اگر چیزی لازم داشتی در خدمتم.",
    "3": "سلام {{customer}} جان، {{repName}} هستم از {{brand}}. وقت داری دو دقیقه صحبت کنیم؟",
    "4": "{{customer}} جان، امسال قیمت‌هایمان نسبت به بازار رقابتی‌تر شده و ارسال هم رایگان است.",
    "5": "سلام {{customer}}، معمولاً این موقع {{product}} تمام می‌کردید. اگر لازم داری همین امروز می‌فرستم.",
    "6": "{{customer}} جان، پیشنهاد ویژهٔ این هفته برای {{product}} داریم. لیست قیمت را بفرستم؟",
    "7": "{{customer}} جان، برای {{product}} سفارش ثبت کنم؟ امروز آمادهٔ ارسال است.",
  },

  cycleMinSamples: 2,

  spacing: {
    enabled: true,
    buckets: [
      { maxDays: 7, minInterval: 1.5, maxInterval: 3 },
      { maxDays: 30, minInterval: 6, maxInterval: 12 },
      { maxDays: 90, minInterval: 15, maxInterval: 25 },
      { maxDays: 180, minInterval: 18, maxInterval: 36 },
      { maxDays: 365, minInterval: 18, maxInterval: 36 },
    ],
  },

  safetyMaxUnansweredCalls: 2,
};

export const BRAND_NAME = "فیروزه";
