import { describe, it, expect } from "vitest";
import {
  BAND_KEYS,
  RANGE_KEYS,
  DEFAULT_SETTINGS,
  SETTING_SCHEMAS,
  STAGE_LABELS,
  type SettingsKey,
} from "./settings";

describe("default settings", () => {
  it("every default passes its own schema", () => {
    for (const key of Object.keys(SETTING_SCHEMAS) as SettingsKey[]) {
      const result = SETTING_SCHEMAS[key].safeParse(DEFAULT_SETTINGS[key]);
      expect(result.success, `${key} نامعتبر است: ${JSON.stringify(result.error?.issues)}`).toBe(
        true,
      );
    }
  });

  it("temperature criteria add up to exactly 100", () => {
    const total = DEFAULT_SETTINGS.temperatureCriteria.reduce((sum, c) => sum + c.max, 0);
    expect(total).toBe(100);
  });

  it("has the seven criteria from the brief", () => {
    expect(DEFAULT_SETTINGS.temperatureCriteria).toHaveLength(7);
    expect(DEFAULT_SETTINGS.temperatureCriteria.map((c) => c.key)).toEqual([
      "need",
      "interest",
      "price",
      "engagement",
      "initiation",
      "competitor",
      "action",
    ]);
  });

  it("every criterion ends with an 'unknown' option", () => {
    for (const criterion of DEFAULT_SETTINGS.temperatureCriteria) {
      const last = criterion.options[criterion.options.length - 1];
      expect(last.points, criterion.key).toBeNull();
    }
  });

  it("no option exceeds its criterion ceiling", () => {
    for (const criterion of DEFAULT_SETTINGS.temperatureCriteria) {
      for (const option of criterion.options) {
        if (option.points === null) continue;
        expect(option.points, `${criterion.key}: ${option.label}`).toBeLessThanOrEqual(
          criterion.max,
        );
      }
    }
  });

  it("bands are strictly increasing", () => {
    const { cold, warm, hot } = DEFAULT_SETTINGS.temperatureBands;
    expect(cold).toBeLessThan(warm);
    expect(warm).toBeLessThan(hot);
    expect(hot).toBeLessThan(100);
  });

  it("decision matrix covers every band and every range", () => {
    for (const band of BAND_KEYS) {
      for (const range of RANGE_KEYS) {
        const stage = DEFAULT_SETTINGS.followupMatrix[band][range];
        expect(stage, `${band}/${range}`).toBeGreaterThanOrEqual(1);
        expect(stage).toBeLessThanOrEqual(7);
      }
    }
  });

  it("matrix is monotonic: closer to due date never lowers the stage", () => {
    const order = [0, 1, 2, 3, 4];
    for (const band of BAND_KEYS) {
      const stages = order.map((i) => DEFAULT_SETTINGS.followupMatrix[band][RANGE_KEYS[i]]);
      for (let i = 1; i < stages.length; i++) {
        expect(stages[i], `${band} index ${i}`).toBeGreaterThanOrEqual(stages[i - 1]);
      }
    }
  });

  it("hotter customers never get a colder stage at the same range", () => {
    for (const range of RANGE_KEYS) {
      const stages = BAND_KEYS.map((b) => DEFAULT_SETTINGS.followupMatrix[b][range]);
      for (let i = 1; i < stages.length; i++) {
        expect(stages[i], `${range} index ${i}`).toBeGreaterThanOrEqual(stages[i - 1]);
      }
    }
  });

  it("has a message template for all seven stages", () => {
    for (let stage = 1; stage <= 7; stage++) {
      expect(STAGE_LABELS[stage]).toBeTruthy();
      expect(DEFAULT_SETTINGS.followupMessages[String(stage)]?.length).toBeGreaterThan(10);
    }
  });

  it("has a channel for every band", () => {
    for (const band of BAND_KEYS) {
      expect(["call", "sms", "whatsapp"]).toContain(DEFAULT_SETTINGS.followupChannels[band]);
    }
  });

  it("spacing buckets are ordered and intervals are valid", () => {
    const buckets = DEFAULT_SETTINGS.spacing.buckets;
    for (let i = 0; i < buckets.length; i++) {
      expect(buckets[i].minInterval).toBeLessThanOrEqual(buckets[i].maxInterval);
      if (i > 0) expect(buckets[i].maxDays).toBeGreaterThan(buckets[i - 1].maxDays);
    }
  });

  it("coverage threshold and safety rules are sane", () => {
    expect(DEFAULT_SETTINGS.coverageThreshold).toBeGreaterThan(0);
    expect(DEFAULT_SETTINGS.coverageThreshold).toBeLessThanOrEqual(1);
    expect(DEFAULT_SETTINGS.safetyMaxUnansweredCalls).toBeGreaterThanOrEqual(1);
  });
});

describe("settings validation", () => {
  it("rejects criteria that do not sum to a valid shape", () => {
    expect(SETTING_SCHEMAS.temperatureCriteria.safeParse([]).success).toBe(false);
    expect(
      SETTING_SCHEMAS.temperatureCriteria.safeParse([
        { key: "x", label: "x", max: 10, options: [{ label: "only", points: 1 }] },
      ]).success,
    ).toBe(false);
  });

  it("rejects an out-of-range stage in the matrix", () => {
    const bad = structuredClone(DEFAULT_SETTINGS.followupMatrix);
    bad.cold.gt15 = 9;
    expect(SETTING_SCHEMAS.followupMatrix.safeParse(bad).success).toBe(false);
  });

  it("rejects a coverage threshold above 1", () => {
    expect(SETTING_SCHEMAS.coverageThreshold.safeParse(1.5).success).toBe(false);
  });
});
