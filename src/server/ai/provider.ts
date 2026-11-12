import "server-only";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { db } from "@/server/db";
import { formatMoney, sum, weightedValue } from "@/lib/money";

/**
 * AI provider abstraction.
 *
 * Any OpenAI-compatible endpoint works: OpenRouter, OpenAI, Ollama, LM Studio,
 * vLLM, Groq, Together. Swapping providers is an env change, not a code change.
 */
export function getProvider() {
  const baseURL = process.env.AI_BASE_URL?.trim();
  const apiKey = process.env.AI_API_KEY?.trim();

  if (!baseURL) return null;

  return createOpenAICompatible({
    name: "crm-ai",
    baseURL,
    apiKey: apiKey || "not-needed",
  });
}

export function getModelId() {
  return process.env.AI_MODEL?.trim() || "openai/gpt-4o-mini";
}

export function isAiConfigured() {
  const baseURL = process.env.AI_BASE_URL?.trim();
  if (!baseURL) return false;

  // Local runtimes (Ollama, LM Studio, vLLM) need no key; hosted ones do.
  const isLocal = /localhost|127\.0\.0\.1|0\.0\.0\.0|host\.docker\.internal/.test(baseURL);
  if (isLocal) return true;

  return Boolean(process.env.AI_API_KEY?.trim());
}

/**
 * A compact, factual snapshot of the CRM that the model can reason over.
 * Kept small on purpose: the model should answer from facts, not guess.
 */
export async function buildCrmContext() {
  const [deals, stages, tasks, companies, contacts, leads] = await Promise.all([
    db.deal.findMany({
      include: { company: true, stage: true, owner: true },
      orderBy: { updatedAt: "desc" },
      take: 40,
    }),
    db.stage.findMany({ orderBy: { order: "asc" } }),
    db.task.findMany({
      where: { status: "open" },
      include: { assignee: true, deal: true },
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
    db.company.findMany({ take: 30, orderBy: { updatedAt: "desc" } }),
    db.contact.findMany({ include: { company: true }, take: 30, orderBy: { updatedAt: "desc" } }),
    db.lead.findMany({ take: 20, orderBy: { updatedAt: "desc" } }),
  ]);

  const open = deals.filter((d) => d.status === "open");
  const won = deals.filter((d) => d.status === "won");
  const lost = deals.filter((d) => d.status === "lost");

  const lines: string[] = [];

  lines.push("## خلاصه قیف فروش");
  lines.push(`- معاملات باز: ${open.length}`);
  lines.push(`- ارزش کل قیف: ${formatMoney(sum(open.map((d) => d.amount)), { persian: false })}`);
  lines.push(
    `- ارزش وزنی: ${formatMoney(sum(open.map((d) => weightedValue(d.amount, d.probability))), { persian: false })}`,
  );
  lines.push(`- برده: ${won.length} | باخته: ${lost.length}`);

  lines.push("\n## مراحل قیف");
  for (const stage of stages) {
    const inStage = open.filter((d) => d.stageId === stage.id);
    lines.push(
      `- ${stage.name} (احتمال ${stage.probability}٪): ${inStage.length} معامله، ${formatMoney(
        sum(inStage.map((d) => d.amount)),
        { persian: false },
      )}`,
    );
  }

  lines.push("\n## معاملات باز");
  for (const deal of open.slice(0, 25)) {
    lines.push(
      `- «${deal.title}» | شرکت: ${deal.company?.name ?? "—"} | مرحله: ${deal.stage?.name ?? "—"} | مبلغ: ${formatMoney(
        deal.amount,
        { persian: false },
      )} | احتمال: ${deal.probability}٪ | مسئول: ${deal.owner?.name ?? "—"}`,
    );
  }

  lines.push("\n## وظایف باز");
  for (const task of tasks) {
    lines.push(
      `- «${task.title}» | اولویت: ${task.priority} | سررسید: ${
        task.dueDate ? task.dueDate.toISOString().slice(0, 10) : "—"
      } | معامله: ${task.deal?.title ?? "—"} | مسئول: ${task.assignee?.name ?? "—"}`,
    );
  }

  lines.push("\n## شرکت‌ها");
  for (const company of companies) {
    lines.push(`- ${company.name} | صنعت: ${company.industry ?? "—"} | شهر: ${company.city ?? "—"}`);
  }

  lines.push("\n## مخاطبین");
  for (const contact of contacts) {
    lines.push(
      `- ${contact.firstName} ${contact.lastName} | ${contact.title ?? "—"} | شرکت: ${
        contact.company?.name ?? "—"
      }`,
    );
  }

  lines.push("\n## سرنخ‌ها");
  for (const lead of leads) {
    lines.push(
      `- ${lead.name} | وضعیت: ${lead.status} | امتیاز: ${lead.score} | منبع: ${lead.source}`,
    );
  }

  return lines.join("\n");
}

export const SYSTEM_PROMPT = `تو «دستیار فیروزه» هستی، دستیار هوش مصنوعی یک سامانه مدیریت ارتباط با مشتری (CRM) برای تیم‌های فروش ایرانی.

قواعد:
- همیشه فارسی و روان پاسخ بده.
- فقط بر اساس داده‌ای که در ادامه به تو داده می‌شود پاسخ بده. اگر داده‌ای موجود نیست، صریح بگو که در CRM ثبت نشده است.
- عدد و مبلغ را دقیق نقل کن؛ از خودت عدد نساز.
- پاسخ‌ها کوتاه و عملی باشند. وقتی پیشنهاد می‌دهی، مشخص و قابل اجرا باش.
- اگر کاربر درخواست تحلیل کرد، ابتدا یک جمله جمع‌بندی، بعد حداکثر ۳ نکته کلیدی.
- از Markdown ساده استفاده کن (بولت و پررنگ). جدول فقط وقتی لازم است.`;
