import "server-only";
import { db } from "./db";
import {
  DEFAULT_SETTINGS,
  SETTING_GROUPS,
  SETTING_SCHEMAS,
  type AppSettings,
  type SettingsKey,
} from "@/lib/settings";

/**
 * دسترسی به تنظیمات پویا.
 *
 * خواندن: یک‌بار از دیتابیس، بعد از کش پروسه‌ای.
 * نوشتن: کش را باطل می‌کند تا تغییر بلافاصله اثر کند.
 */

type Cache = { value: AppSettings | null; at: number };
const globalCache = globalThis as unknown as { __settingsCache?: Cache };
const TTL_MS = 5_000;

function emptyCache(): Cache {
  globalCache.__settingsCache ??= { value: null, at: 0 };
  return globalCache.__settingsCache;
}

export function invalidateSettingsCache() {
  globalCache.__settingsCache = { value: null, at: 0 };
}

/** همهٔ تنظیمات با مقادیر پیش‌فرض به‌عنوان پایه. */
export async function getSettings(): Promise<AppSettings> {
  const cache = emptyCache();
  if (cache.value && Date.now() - cache.at < TTL_MS) return cache.value;

  const rows = await db.setting.findMany();
  const merged = { ...DEFAULT_SETTINGS } as AppSettings;

  for (const row of rows) {
    const key = row.key as SettingsKey;
    if (!(key in SETTING_SCHEMAS)) continue;

    try {
      const parsed = SETTING_SCHEMAS[key].safeParse(JSON.parse(row.value));
      if (parsed.success) {
        (merged as unknown as Record<string, unknown>)[key] = parsed.data;
      } else {
        console.warn(`[settings] مقدار نامعتبر برای ${key} — پیش‌فرض استفاده شد`);
      }
    } catch {
      console.warn(`[settings] JSON خراب برای ${key} — پیش‌فرض استفاده شد`);
    }
  }

  cache.value = merged;
  cache.at = Date.now();
  return merged;
}

export async function getSetting<K extends SettingsKey>(key: K): Promise<AppSettings[K]> {
  const settings = await getSettings();
  return settings[key];
}

export async function saveSetting(
  key: SettingsKey,
  rawValue: unknown,
  userId?: string,
): Promise<AppSettings[SettingsKey]> {
  const parsed = SETTING_SCHEMAS[key].parse(rawValue);

  await db.setting.upsert({
    where: { key },
    update: { value: JSON.stringify(parsed), updatedById: userId ?? null },
    create: {
      key,
      group: SETTING_GROUPS[key],
      value: JSON.stringify(parsed),
      updatedById: userId ?? null,
    },
  });

  await db.decisionLog.create({
    data: {
      entityType: "setting",
      entityId: key,
      decision: "update",
      detail: JSON.stringify({ key, value: parsed }),
      userId: userId ?? null,
    },
  });

  invalidateSettingsCache();
  return parsed;
}

/** بازگشت یک کلید به مقدار پیش‌فرض کارخانه. */
export async function resetSetting(key: SettingsKey, userId?: string) {
  await db.setting.deleteMany({ where: { key } });
  await db.decisionLog.create({
    data: {
      entityType: "setting",
      entityId: key,
      decision: "reset",
      detail: JSON.stringify({ key }),
      userId: userId ?? null,
    },
  });
  invalidateSettingsCache();
  return DEFAULT_SETTINGS[key];
}

/** نوشتن همهٔ پیش‌فرض‌ها (برای seed و نصب اولیه). */
export async function seedDefaultSettings() {
  for (const key of Object.keys(SETTING_SCHEMAS) as SettingsKey[]) {
    await db.setting.upsert({
      where: { key },
      update: {},
      create: {
        key,
        group: SETTING_GROUPS[key],
        value: JSON.stringify(DEFAULT_SETTINGS[key]),
      },
    });
  }
  invalidateSettingsCache();
}
