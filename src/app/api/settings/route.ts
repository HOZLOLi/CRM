import { z } from "zod";
import { guard, ok, fail, handleError } from "@/server/api/http";
import { getSettings, saveSetting, resetSetting } from "@/server/settings";
import { SETTING_SCHEMAS, type SettingsKey } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const { response } = await guard();
  if (response) return response;
  return ok(await getSettings());
}

const patchSchema = z.object({
  key: z.string().refine((k) => k in SETTING_SCHEMAS, "کلید تنظیمات ناشناخته"),
  value: z.unknown(),
});

export async function PATCH(request: Request) {
  const { user, response } = await guard();
  if (response) return response;

  try {
    const body = patchSchema.parse(await request.json());
    const saved = await saveSetting(body.key as SettingsKey, body.value, user!.id);
    return ok({ key: body.key, value: saved });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  const { user, response } = await guard();
  if (response) return response;

  try {
    const body = z
      .object({ key: z.string().refine((k) => k in SETTING_SCHEMAS) })
      .parse(await request.json());
    const value = await resetSetting(body.key as SettingsKey, user!.id);
    return ok({ key: body.key, value });
  } catch {
    return fail("بازگشت به پیش‌فرض ناموفق بود", 400);
  }
}
