import { describe, it, expect } from "vitest";
import { Decimal } from "./money";
import { DEFAULT_SETTINGS, type BandKey } from "./settings";
import { evaluateTemperature, bandFor, isMaxAnswer } from "./temperature";
import { computeCycle, median, mean, suggestedOrderQuantity } from "./cycle";
import { decideFollowUp, rangeFromDays, renderMessage, annualValue } from "./followup";
import { pickBucket, planSpacing, isSpacingDue } from "./spacing";

const T = DEFAULT_SETTINGS.temperatureCriteria;
const BANDS = DEFAULT_SETTINGS.temperatureBands;

/** ساخت پاسخ‌ها از امتیاز هدف برای هر معیار */
function answersFor(points: Record<string, number | null>): Record<string, number> {
  const answers: Record<string, number> = {};
  for (const [key, target] of Object.entries(points)) {
    const criterion = T.find((c) => c.key === key)!;
    if (target === null) {
      answers[key] = criterion.options.findIndex((o) => o.points === null);
    } else {
      answers[key] = criterion.options.findIndex((o) => o.points === target);
    }
  }
  return answers;
}

/* ========================================================== temperature */

describe("temperature engine", () => {
  const evaluate = (points: Record<string, number | null>) =>
    evaluateTemperature({
      criteria: T,
      bands: BANDS,
      coverageThreshold: DEFAULT_SETTINGS.coverageThreshold,
      answers: answersFor(points),
    });

  it("full hot answer set scores 100 and is very hot", () => {
    const result = evaluate({
      need: 30,
      interest: 15,
      price: 15,
      engagement: 10,
      initiation: 10,
      competitor: 10,
      action: 10,
    });
    expect(result.rawScore).toBe(100);
    expect(result.coverage).toBe(1);
    expect(result.isProvisional).toBe(false);
    expect(result.band).toBe("veryHot");
  });

  it("all-zero answers score 0, full coverage, cold", () => {
    const result = evaluate({
      need: 0,
      interest: 0,
      price: 0,
      engagement: 0,
      initiation: 0,
      competitor: 0,
      action: 0,
    });
    expect(result.rawScore).toBe(0);
    expect(result.coverage).toBe(1);
    expect(result.band).toBe("cold");
  });

  it("'unknown' removes the ceiling from coverage instead of scoring zero", () => {
    const result = evaluate({
      need: 30,
      interest: 15,
      price: 15,
      engagement: 10,
      initiation: null,
      competitor: null,
      action: null,
    });

    // امتیاز فقط از معیارهای پاسخ‌داده‌شده
    expect(result.rawScore).toBe(70);
    // سقف پوشش‌داده‌شده: ۳۰ + ۱۵ + ۱۵ + ۱۰ = ۷۰ از ۱۰۰
    expect(result.coveredMax).toBe(70);
    expect(result.coverage).toBeCloseTo(0.7, 5);
    expect(result.isProvisional).toBe(true); // ۷۰٪ < ۸۰٪
    expect(result.unknownKeys).toEqual(["initiation", "competitor", "action"]);
  });

  it("unknown is not treated as zero: score stays high but is flagged provisional", () => {
    const result = evaluate({
      need: 30,
      interest: 15,
      price: 15,
      engagement: null,
      initiation: null,
      competitor: null,
      action: null,
    });
    expect(result.rawScore).toBe(60);
    expect(result.coverage).toBeCloseTo(0.6, 5);
    expect(result.isProvisional).toBe(true);
    expect(result.band).toBe("hot");
  });

  it("exactly 80% coverage is not provisional; 70% is", () => {
    // ۳۰ + ۱۵ + ۱۵ + ۱۰ + ۱۰ = ۸۰ از ۱۰۰
    const at80 = evaluate({ need: 15, interest: 5, price: 5, engagement: 3, initiation: 4 });
    expect(at80.coveredMax).toBe(80);
    expect(at80.coverage).toBeCloseTo(0.8, 5);
    expect(at80.isProvisional).toBe(false);

    // یک معیار دیگر حذف شد → ۷۰٪
    const at70 = evaluate({ need: 15, interest: 5, price: 5, engagement: 3 });
    expect(at70.coverage).toBeCloseTo(0.7, 5);
    expect(at70.isProvisional).toBe(true);
  });

  it("threshold boundary is inclusive at the band edge", () => {
    expect(bandFor(24, BANDS)).toBe("cold");
    expect(bandFor(25, BANDS)).toBe("warm");
    expect(bandFor(49, BANDS)).toBe("warm");
    expect(bandFor(50, BANDS)).toBe("hot");
    expect(bandFor(74, BANDS)).toBe("hot");
    expect(bandFor(75, BANDS)).toBe("veryHot");
  });

  it("reports missing (unanswered) criteria separately from unknown", () => {
    const result = evaluate({ need: 30 });
    expect(result.missingKeys).toHaveLength(6);
    expect(result.unknownKeys).toHaveLength(0);
    expect(result.rawScore).toBe(30);
  });

  it("detects a maxed answer for the urgent rule", () => {
    const answers = answersFor({ action: 10 });
    expect(isMaxAnswer(T, answers, "action")).toBe(true);
    expect(isMaxAnswer(T, answersFor({ action: 5 }), "action")).toBe(false);
  });
});

/* ================================================================ cycle */

describe("median", () => {
  it("handles empty, odd and even arrays", () => {
    expect(median([])).toBeNull();
    expect(median([12])).toBe(12);
    expect(median([12, 20, 8])).toBe(12);
    expect(median([12, 20])).toBe(16);
    expect(median([5, 1, 100, 2])).toBe(3.5);
  });

  it("is robust against an outlier where mean is not", () => {
    const values = [12, 12, 12, 60];
    expect(median(values)).toBe(12);
    expect(mean(values)).toBe(24);
  });
});

describe("cycle engine", () => {
  const day = (n: number) => new Date(Date.UTC(2026, 0, 1) + n * 86_400_000);
  const purchase = (n: number, qty = 10) => ({ date: day(n), quantity: new Decimal(qty) });
  const today = day(60);

  it("is 'learning' with a single purchase", () => {
    const result = computeCycle([purchase(0)], { minSamples: 2, today });
    expect(result.status).toBe("learning");
    expect(result.medianCycleDays).toBeNull();
    expect(result.expectedDate).toBeNull();
    expect(result.sampleSize).toBe(1);
  });

  it("uses the single interval with two purchases", () => {
    const result = computeCycle([purchase(0), purchase(12)], { minSamples: 2, today });
    expect(result.medianCycleDays).toBe(12);
    expect(result.status).toBe("overdue");
  });

  it("uses the true median with three or more purchases", () => {
    const result = computeCycle(
      [purchase(0), purchase(12), purchase(26), purchase(38)],
      { minSamples: 2, today },
    );
    // فواصل: ۱۲، ۱۴، ۱۲ → میانه ۱۲
    expect(result.medianCycleDays).toBe(12);
  });

  it("computes expected date, daily consumption and estimated stock", () => {
    const result = computeCycle(
      [purchase(0, 10), purchase(12, 10), purchase(24, 10)],
      { minSamples: 2, today },
    );

    expect(result.medianCycleDays).toBe(12);
    expect(result.lastPurchaseAt?.toISOString().slice(0, 10)).toBe("2026-01-25");
    expect(result.expectedDate?.toISOString().slice(0, 10)).toBe("2026-02-06");
    expect(result.totalQuantity.toString()).toBe("30");

    // مصرف روزانه = (۳۰ ÷ ۳ خرید) ÷ ۱۲ روز = ۰٫۸۳۳…
    expect(result.dailyConsumption.toDecimalPlaces(3).toString()).toBe("0.833");

    // ۳۶ روز از آخرین خرید گذشته
    expect(result.daysSinceLastPurchase).toBe(36);
    expect(result.estimatedStock.toDecimalPlaces(1).toString()).toBe("30");
  });

  it("flags overdue only after the expected date, and does not touch temperature", () => {
    const purchases = [purchase(0), purchase(12), purchase(24)];
    const before = computeCycle(purchases, { minSamples: 2, today: day(30) });
    const onDue = computeCycle(purchases, { minSamples: 2, today: day(36) });
    const after = computeCycle(purchases, { minSamples: 2, today: day(40) });

    expect(before.status).toBe("active");
    expect(onDue.status).toBe("active");
    expect(after.status).toBe("overdue");
    expect(after.daysUntilExpected).toBeLessThan(0);
  });

  it("respects minSamples above 2", () => {
    const result = computeCycle([purchase(0), purchase(12)], { minSamples: 3, today });
    expect(result.status).toBe("learning");
  });

  it("ignores same-day duplicates instead of dividing by zero", () => {
    const result = computeCycle([purchase(0), purchase(0), purchase(10)], {
      minSamples: 2,
      today,
    });
    expect(result.medianCycleDays).toBe(10);
  });

  it("suggests an order quantity from consumption × cycle", () => {
    const result = computeCycle(
      [purchase(0, 10), purchase(12, 10), purchase(24, 10)],
      { minSamples: 2, today },
    );
    expect(suggestedOrderQuantity(result)?.toString()).toBe("10");
  });
});

/* ============================================================== followup */

describe("followup range", () => {
  it("maps days to the five ranges at the boundaries", () => {
    expect(rangeFromDays(16)).toBe("gt15");
    expect(rangeFromDays(15)).toBe("d8to15");
    expect(rangeFromDays(8)).toBe("d8to15");
    expect(rangeFromDays(7)).toBe("d4to7");
    expect(rangeFromDays(4)).toBe("d4to7");
    expect(rangeFromDays(3)).toBe("d1to3");
    expect(rangeFromDays(1)).toBe("d1to3");
    expect(rangeFromDays(0)).toBe("due");
    expect(rangeFromDays(-5)).toBe("due");
  });
});

describe("followup decision", () => {
  const rules = {
    matrix: DEFAULT_SETTINGS.followupMatrix,
    channels: DEFAULT_SETTINGS.followupChannels,
    maxUnansweredCalls: DEFAULT_SETTINGS.safetyMaxUnansweredCalls,
  };
  const today = new Date("2026-06-01T00:00:00Z");
  const inDays = (n: number) => new Date(today.getTime() + n * 86_400_000);

  const decide = (overrides: Partial<Parameters<typeof decideFollowUp>[0]> = {}) =>
    decideFollowUp(
      {
        band: "warm",
        expectedDate: inDays(5),
        contactAllowed: true,
        attempts: 0,
        urgent: false,
        today,
        ...overrides,
      },
      rules,
    );

  it("covers all 20 matrix cells without gaps", () => {
    const bands: BandKey[] = ["cold", "warm", "hot", "veryHot"];
    const offsets = [30, 10, 5, 2, -1];
    for (const band of bands) {
      for (const offset of offsets) {
        const decision = decide({ band, expectedDate: inDays(offset) });
        expect(decision.blocked).toBe(false);
        expect(decision.stage).toBeGreaterThanOrEqual(1);
        expect(decision.stage).toBeLessThanOrEqual(7);
      }
    }
  });

  it("blocks every action when contact permission is withdrawn", () => {
    const decision = decide({ contactAllowed: false, band: "veryHot", expectedDate: inDays(0) });
    expect(decision.blocked).toBe(true);
    expect(decision.blockReason).toBeTruthy();
    expect(decision.priority).toBe("P3");
  });

  it("stops phone calls after two unanswered attempts", () => {
    const fresh = decide({ band: "hot", expectedDate: inDays(2), attempts: 0 });
    expect(fresh.channel).toBe("call");

    const afterTwo = decide({ band: "hot", expectedDate: inDays(2), attempts: 2 });
    expect(afterTwo.channel).toBe("whatsapp");
    expect(afterTwo.reasons.join(" ")).toContain("بی‌پاسخ");
  });

  it("does not downgrade a message channel that was never a call", () => {
    const cold = decide({ band: "cold", expectedDate: inDays(2), attempts: 5 });
    expect(cold.channel).toBe("sms");
  });

  it("lets the agreed date override the system prediction", () => {
    const agreed = inDays(20);
    const decision = decide({ expectedDate: inDays(-5), agreedNextContact: agreed });
    expect(decision.daysUntil).toBe(20);
    expect(decision.range).toBe("gt15");
    expect(decision.reasons.join(" ")).toContain("توافق‌شده");
  });

  it("gives urgent customers P1 regardless of date", () => {
    const decision = decide({ band: "cold", expectedDate: inDays(40), urgent: true, attempts: 3 });
    expect(decision.priority).toBe("P1");
    expect(decision.reasons.join(" ")).toContain("فوری");
  });

  it("escalates priority as the date approaches", () => {
    expect(decide({ band: "veryHot", expectedDate: inDays(20) }).priority).toBe("P3");
    expect(decide({ band: "veryHot", expectedDate: inDays(2) }).priority).toBe("P2");
    expect(decide({ band: "veryHot", expectedDate: inDays(0) }).priority).toBe("P2");
    expect(decide({ band: "warm", expectedDate: inDays(10) }).priority).toBe("P3");
  });

  it("handles a customer with no expected date at all", () => {
    const decision = decide({ expectedDate: null });
    expect(decision.blocked).toBe(false);
    expect(decision.stage).toBeGreaterThanOrEqual(1);
  });
});

describe("message rendering", () => {
  it("replaces known variables and blanks unknown ones", () => {
    const out = renderMessage("سلام {{customer}}، {{product}} آماده است. {{missing}}", {
      customer: "رستوران آریا",
      product: "ظرف فوم",
    });
    expect(out).toBe("سلام رستوران آریا، ظرف فوم آماده است. ");
  });

  it("renders every default stage template without leaving placeholders", () => {
    for (let stage = 1; stage <= 7; stage++) {
      const out = renderMessage(DEFAULT_SETTINGS.followupMessages[String(stage)], {
        customer: "مشتری",
        product: "کالا",
        brand: "فیروزه",
        repName: "رضا",
      });
      expect(out).not.toContain("{{");
    }
  });
});

describe("annual value", () => {
  it("annualises from the purchase cycle", () => {
    expect(annualValue(1_000_000, 12)).toEqual({ value: 30_416_667, estimated: false });
  });

  it("falls back to monthly with an estimated flag", () => {
    expect(annualValue(1_000_000, null)).toEqual({ value: 12_000_000, estimated: true });
  });
});

/* =============================================================== spacing */

describe("spacing module", () => {
  const buckets = DEFAULT_SETTINGS.spacing.buckets;

  it("picks the nearest retention bucket", () => {
    expect(pickBucket(3, buckets)?.maxDays).toBe(7);
    expect(pickBucket(7, buckets)?.maxDays).toBe(7);
    expect(pickBucket(8, buckets)?.maxDays).toBe(30);
    expect(pickBucket(45, buckets)?.maxDays).toBe(90);
    expect(pickBucket(200, buckets)?.maxDays).toBe(365);
    expect(pickBucket(900, buckets)?.maxDays).toBe(365);
  });

  it("keeps the interval inside the bucket range", () => {
    for (const days of [3, 20, 60, 200]) {
      const plan = planSpacing(new Date(Date.now() - days * 86_400_000), {
        enabled: true,
        buckets,
      })!;
      expect(plan.intervalDays).toBeGreaterThanOrEqual(plan.bucket!.minInterval);
      expect(plan.intervalDays).toBeLessThanOrEqual(plan.bucket!.maxInterval);
    }
  });

  it("returns null when the module is disabled", () => {
    expect(
      planSpacing(new Date(), { enabled: false, buckets }),
    ).toBeNull();
  });

  it("is deterministic with an injected rng", () => {
    const last = new Date("2026-01-01T00:00:00Z");
    const today = new Date("2026-01-21T00:00:00Z"); // ۲۰ روز بعد → بازهٔ ۳۰ روزه
    const a = planSpacing(last, { enabled: true, buckets }, { today, rng: () => 0 })!;
    const b = planSpacing(last, { enabled: true, buckets }, { today, rng: () => 1 })!;
    expect(a.bucket?.maxDays).toBe(30);
    expect(a.intervalDays).toBe(6); // کمینهٔ بازهٔ ۳۰ روزه
    expect(b.intervalDays).toBe(12); // بیشینهٔ بازهٔ ۳۰ روزه
  });

  it("marks a plan due once the interval has elapsed", () => {
    const last = new Date("2026-01-01T00:00:00Z");
    const plan = planSpacing(last, { enabled: true, buckets }, { rng: () => 0 })!;
    expect(isSpacingDue(plan, new Date("2026-01-02T00:00:00Z"))).toBe(false);
    expect(isSpacingDue(plan, new Date("2026-02-01T00:00:00Z"))).toBe(true);
  });
});
