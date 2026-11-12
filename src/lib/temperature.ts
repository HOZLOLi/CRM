import type { BandKey } from "./settings";

/**
 * موتور دمای مشتری.
 *
 * قاعدهٔ کلیدی: «اطلاعی ندارم» صفر نیست. آن معیار از صورت و مخرج هر دو خارج
 * می‌شود، و در عوض «پوشش اطلاعات» کاهش می‌یابد تا فروشنده بداند چقدر می‌تواند
 * به این نمره تکیه کند.
 */

export interface TemperatureCriterion {
  key: string;
  label: string;
  max: number;
  options: { label: string; points: number | null }[];
}

export interface TemperatureBands {
  cold: number;
  warm: number;
  hot: number;
}

export interface TemperatureInput {
  criteria: TemperatureCriterion[];
  bands: TemperatureBands;
  coverageThreshold: number;
  /** criterionKey → index گزینه. معیار غایب = پاسخ داده نشده. */
  answers: Record<string, number>;
}

export interface TemperatureResult {
  rawScore: number;
  coveredMax: number;
  /** ۰ تا ۱ */
  coverage: number;
  isProvisional: boolean;
  band: BandKey;
  answeredKeys: string[];
  unknownKeys: string[];
  missingKeys: string[];
}

export function bandFor(rawScore: number, bands: TemperatureBands): BandKey {
  if (rawScore <= bands.cold) return "cold";
  if (rawScore <= bands.warm) return "warm";
  if (rawScore <= bands.hot) return "hot";
  return "veryHot";
}

export function evaluateTemperature(input: TemperatureInput): TemperatureResult {
  const { criteria, bands, coverageThreshold, answers } = input;

  let rawScore = 0;
  let coveredMax = 0;

  const answeredKeys: string[] = [];
  const unknownKeys: string[] = [];
  const missingKeys: string[] = [];

  for (const criterion of criteria) {
    const index = answers[criterion.key];

    if (index === undefined || index === null || index < 0) {
      missingKeys.push(criterion.key);
      continue;
    }

    const option = criterion.options[index];
    if (!option) {
      missingKeys.push(criterion.key);
      continue;
    }

    if (option.points === null) {
      // «اطلاعی ندارم»: نه صفر، بلکه خارج از پوشش
      unknownKeys.push(criterion.key);
      continue;
    }

    rawScore += option.points;
    coveredMax += criterion.max;
    answeredKeys.push(criterion.key);
  }

  const totalMax = criteria.reduce((sum, c) => sum + c.max, 0) || 1;
  const coverage = coveredMax / totalMax;

  return {
    rawScore,
    coveredMax,
    coverage,
    isProvisional: coverage < coverageThreshold,
    band: bandFor(rawScore, bands),
    answeredKeys,
    unknownKeys,
    missingKeys,
  };
}

/** آیا این معیار در بالاترین سطح خود پاسخ داده شده؟ (برای اولویت «فوری») */
export function isMaxAnswer(
  criteria: TemperatureCriterion[],
  answers: Record<string, number>,
  key: string,
): boolean {
  const criterion = criteria.find((c) => c.key === key);
  if (!criterion) return false;
  const index = answers[key];
  if (index === undefined) return false;
  const option = criterion.options[index];
  if (!option || option.points === null) return false;
  return option.points === criterion.max;
}

export const BAND_LABEL_FA: Record<BandKey, string> = {
  cold: "سرد",
  warm: "نیمه‌گرم",
  hot: "گرم",
  veryHot: "داغ",
};
