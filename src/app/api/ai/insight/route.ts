import { z } from "zod";
import { streamText } from "ai";
import { guard, fail } from "@/server/api/http";
import { getModelId, getProvider, isAiConfigured } from "@/server/ai/provider";
import { BASE_RULES, getScope, SCOPE_SYSTEM_SUFFIX } from "@/server/ai/scopes";

export const maxDuration = 60;

const schema = z.object({
  scope: z.string().min(1),
  entityId: z.string().optional(),
  question: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const { response } = await guard();
  if (response) return response;

  if (!isAiConfigured()) {
    return fail("هوش مصنوعی پیکربندی نشده است — AI_BASE_URL و AI_API_KEY را تنظیم کنید", 503);
  }

  const provider = getProvider();
  if (!provider) return fail("ارائه‌دهندهٔ هوش مصنوعی در دسترس نیست", 503);

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return fail("درخواست نامعتبر است", 400);
  const body = parsed.data;
  const scope = getScope(body.scope);
  if (!scope) return fail("دامنهٔ نامعتبر", 400);

  const context = await scope.buildContext(body.entityId);
  if (context === null) return fail("داده‌ای برای این دامنه پیدا نشد", 404);

  const question = body.question?.trim() || scope.suggestions[0];

  const result = streamText({
    model: provider(getModelId()),
    system: `${BASE_RULES}\n\n${SCOPE_SYSTEM_SUFFIX[scope.id] ?? ""}\n\n---\n\n${context}`,
    prompt: question,
    temperature: 0.3,
  });

  return result.toTextStreamResponse();
}
