import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { guard, fail } from "@/server/api/http";
import {
  buildCrmContext,
  getModelId,
  getProvider,
  isAiConfigured,
  SYSTEM_PROMPT,
} from "@/server/ai/provider";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { response } = await guard();
  if (response) return response;

  if (!isAiConfigured()) {
    return fail(
      "هوش مصنوعی پیکربندی نشده است. مقدار AI_BASE_URL و AI_API_KEY را در فایل .env تنظیم کنید.",
      503,
    );
  }

  const provider = getProvider();
  if (!provider) return fail("ارائه‌دهنده هوش مصنوعی در دسترس نیست", 503);

  const body = (await request.json().catch(() => null)) as { messages?: UIMessage[] } | null;
  if (!body?.messages?.length) return fail("پیامی ارسال نشد", 400);

  const context = await buildCrmContext();

  const result = streamText({
    model: provider(getModelId()),
    system: `${SYSTEM_PROMPT}\n\n---\n\n# داده فعلی CRM\n\n${context}`,
    messages: await convertToModelMessages(body.messages),
    temperature: 0.3,
  });

  return result.toUIMessageStreamResponse();
}
