import { guard, ok, fail, handleError } from "@/server/api/http";
import { generateSpacingTasks } from "@/server/sales-engine";
import { getSettings } from "@/server/settings";

export const dynamic = "force-dynamic";

export async function POST() {
  const { response } = await guard();
  if (response) return response;

  try {
    const settings = await getSettings();
    if (!settings.spacing.enabled) {
      return fail("ماژول فاصله‌گذاری در تنظیمات غیرفعال است", 409);
    }
    const result = await generateSpacingTasks();
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
