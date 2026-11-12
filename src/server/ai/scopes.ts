import "server-only";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { buildCartable, salesKpis } from "@/server/sales-engine";
import { formatMoney } from "@/lib/money";
import { BAND_LABELS, STAGE_LABELS } from "@/lib/settings";
import { BAND_LABEL_FA } from "@/lib/temperature";

/**
 * دامنه‌های هوش مصنوعی.
 *
 * هر ماژول یک دامنه دارد: یک context فشرده از دادهٔ واقعی + یک system prompt.
 * قاعده: مدل فقط بر پایهٔ همین context پاسخ می‌دهد؛ عدد از خودش نمی‌سازد.
 */

export type ScopeId = "cartable" | "customer" | "dashboard" | "orders" | "settings";

export interface ScopeDefinition {
  id: ScopeId;
  title: string;
  suggestions: string[];
  buildContext: (entityId?: string) => Promise<string | null>;
}

const BASE_RULES = `تو «دستیار فیروزه» هستی، دستیار هوش مصنوعی یک CRM پخش عمده ظروف یکبارمصرف.

قواعد:
- فارسی روان و محاوره‌ای-حرفه‌ای بنویس.
- فقط از داده‌ای که در ادامه می‌بینی پاسخ بده. اگر داده نیست، صریح بگو ثبت نشده.
- عدد و مبلغ را دقیق نقل کن؛ از خودت نساز.
- کوتاه و عملی. حداکثر ۵ بولت یا ۳ پاراگراف کوتاه.
- Markdown ساده (بولت و **پررنگ**). جدول فقط وقتی لازم است.`;

export const SCOPES: Record<ScopeId, ScopeDefinition> = {
  cartable: {
    id: "cartable",
    title: "تحلیل کارتابل امروز",
    suggestions: [
      "امروز اولویت‌بندی من چه باید باشد؟",
      "کدام مشتری را باید حتماً امروز تماس بگیرم و چه بگویم؟",
      "چه الگویی در مشتریان عقب‌افتاده می‌بینی؟",
    ],
    async buildContext() {
      const [cards, kpis] = await Promise.all([buildCartable(), salesKpis()]);

      const lines = ["## خلاصهٔ کارتابل امروز"];
      lines.push(`- تعداد پیگیری: ${cards.length}`);
      lines.push(
        `- اولویت ۱: ${cards.filter((c) => c.priority === "P1").length} | اولویت ۲: ${
          cards.filter((c) => c.priority === "P2").length
        }`,
      );
      lines.push(
        `- توزیع دما: سرد ${kpis.bandCounts.cold} · نیمه‌گرم ${kpis.bandCounts.warm} · گرم ${kpis.bandCounts.hot} · داغ ${kpis.bandCounts.veryHot}`,
      );

      lines.push("\n## کارت‌ها (به ترتیب اولویت)");
      for (const card of cards.slice(0, 15)) {
        lines.push(
          [
            `- «${card.customerName}»`,
            `دما: ${BAND_LABEL_FA[card.band]} ${card.rawScore}${card.isProvisional ? " (موقت)" : ""}`,
            `کالا: ${card.productName ?? "—"}`,
            `فاصله: ${card.daysUntil === null ? "نامشخص" : card.daysUntil < 0 ? `${Math.abs(card.daysUntil)} روز تأخیر` : `${card.daysUntil} روز دیگر`}`,
            `مرحله: ${STAGE_LABELS[card.stage]}`,
            `کانال: ${card.channel}`,
            `اولویت: ${card.priority}`,
            `ارزش سالانه: ${formatMoney(card.annualValue, { persian: false })}`,
          ].join(" | "),
        );
      }

      return lines.join("\n");
    },
  },

  customer: {
    id: "customer",
    title: "تحلیل مشتری",
    suggestions: [
      "وضعیت این مشتری را تحلیل کن و بگو اول چه کاری لازم است",
      "چطور می‌توانم این مشتری را از رقیب بگیرم؟",
      "پیش‌بینی خرید بعدی و مقدار پیشنهادی چقدر است؟",
    ],
    async buildContext(entityId) {
      if (!entityId) return null;

      const customer = await db.company.findUnique({
        where: { id: entityId },
        include: {
          profile: true,
          owner: true,
          orders: { include: { items: { include: { product: true } } }, orderBy: { orderedAt: "desc" }, take: 10 },
          purchaseCycles: { include: { product: true }, orderBy: { expectedDate: "asc" } },
          temperatureEvaluations: { orderBy: { evaluatedAt: "desc" }, take: 4 },
          followUpTasks: { where: { status: "open" } },
        },
      });
      if (!customer) return null;

      const lines = [`## مشتری: ${customer.name}`];
      lines.push(`- صنف: ${customer.industryType ?? "—"} | شهر: ${customer.city ?? "—"}`);
      lines.push(`- کارشناس: ${customer.owner?.name ?? "—"}`);
      lines.push(
        `- منع تماس: ${customer.profile?.contactAllowed === false ? "بله (تماس ممنوع)" : "خیر"}`,
      );
      if (customer.profile?.competitorName) {
        lines.push(
          `- رقیب: ${customer.profile.competitorName} | وفاداری ${customer.profile.competitorLoyalty}/5 | آمادگی جایگزینی ${customer.profile.switchReadiness}/5`,
        );
      }

      const evaluation = customer.temperatureEvaluations[0];
      if (evaluation) {
        lines.push(
          `- آخرین ارزیابی دما: ${BAND_LABEL_FA[evaluation.band as keyof typeof BAND_LABEL_FA] ?? evaluation.band} با ${evaluation.rawScore} امتیاز، پوشش ${evaluation.coverage.toString()}٪${evaluation.isProvisional ? " (موقت)" : ""}`,
        );
      } else {
        lines.push("- ارزیابی دما: ثبت نشده");
      }

      lines.push("\n## چرخهٔ خرید");
      for (const cycle of customer.purchaseCycles) {
        lines.push(
          `- ${cycle.product.name}: چرخه ${cycle.medianCycleDays?.toString() ?? "نامشخص"} روز | خرید بعدی ${cycle.expectedDate?.toISOString().slice(0, 10) ?? "—"} | موجودی تخمینی ${cycle.estimatedStock.toString()} | وضعیت ${cycle.status}`,
        );
      }

      lines.push("\n## سفارش‌های اخیر");
      for (const order of customer.orders.slice(0, 6)) {
        lines.push(
          `- ${order.orderedAt.toISOString().slice(0, 10)}: ${formatMoney(order.subtotal, { persian: false })} | سود ${formatMoney(order.profit, { persian: false })} | ${order.items.map((i) => i.product.name).join("، ")}`,
        );
      }

      if (customer.followUpTasks.length) {
        lines.push("\n## پیگیری‌های باز");
        for (const task of customer.followUpTasks) {
          lines.push(
            `- مرحله ${task.stage} (${STAGE_LABELS[task.stage]}) | کانال ${task.channel} | ${task.attempts} تماس بی‌پاسخ`,
          );
        }
      }

      return lines.join("\n");
    },
  },

  dashboard: {
    id: "dashboard",
    title: "تحلیل داشبورد",
    suggestions: [
      "وضعیت کلی فروش را در سه جمله خلاصه کن",
      "بزرگ‌ترین ریسک این هفته چیست؟",
      "چه اقدامی بیشترین اثر روی سود دارد؟",
    ],
    async buildContext() {
      const [kpis, cycles] = await Promise.all([
        salesKpis(),
        db.purchaseCycle.findMany({
          where: { status: "overdue" },
          include: { customer: true, product: true },
          take: 12,
        }),
      ]);

      const lines = ["## شاخص‌های فروش"];
      lines.push(`- تعداد سفارش: ${kpis.orderCount}`);
      lines.push(`- درآمد: ${formatMoney(kpis.revenue, { persian: false })}`);
      lines.push(`- سود ناخالص: ${formatMoney(kpis.profit, { persian: false })}`);
      lines.push(`- حاشیهٔ سود: ${kpis.marginPercent.toString()}٪`);
      lines.push(
        `- توزیع دما: سرد ${kpis.bandCounts.cold} · نیمه‌گرم ${kpis.bandCounts.warm} · گرم ${kpis.bandCounts.hot} · داغ ${kpis.bandCounts.veryHot}`,
      );
      lines.push(`- چرخه‌های تأخیرخورده: ${kpis.overdue} | در حال یادگیری: ${kpis.learning}`);

      if (cycles.length) {
        lines.push("\n## مشتریان عقب‌افتاده");
        for (const cycle of cycles) {
          lines.push(
            `- ${cycle.customer.name} | ${cycle.product.name} | موعد ${cycle.expectedDate?.toISOString().slice(0, 10)}`,
          );
        }
      }
      return lines.join("\n");
    },
  },

  orders: {
    id: "orders",
    title: "تحلیل سفارش‌ها",
    suggestions: [
      "کدام محصول بیشترین سود را دارد؟",
      "حاشیهٔ سود کدام سفارش پایین است و چرا؟",
      "چه محصولی را باید در پیشنهاد بعدی برجسته کنم؟",
    ],
    async buildContext() {
      const orders = await db.order.findMany({
        include: { customer: true, items: { include: { product: true } } },
        orderBy: { orderedAt: "desc" },
        take: 40,
      });

      const lines = ["## سفارش‌های اخیر"];
      for (const order of orders.slice(0, 20)) {
        lines.push(
          `- ${order.orderedAt.toISOString().slice(0, 10)} | ${order.customer.name} | ${formatMoney(order.subtotal, { persian: false })} | سود ${formatMoney(order.profit, { persian: false })}`,
        );
      }

      const byProduct = new Map<string, { qty: number; profit: number }>();
      for (const order of orders) {
        for (const item of order.items) {
          const entry = byProduct.get(item.product.name) ?? { qty: 0, profit: 0 };
          entry.qty += Number(item.quantity.toString());
          entry.profit += Number(item.lineProfit.toString());
          byProduct.set(item.product.name, entry);
        }
      }
      lines.push("\n## سود به تفکیک محصول");
      for (const [name, entry] of [...byProduct.entries()].sort((a, b) => b[1].profit - a[1].profit)) {
        lines.push(`- ${name}: ${entry.qty} واحد | سود ${formatMoney(entry.profit, { persian: false })}`);
      }
      return lines.join("\n");
    },
  },

  settings: {
    id: "settings",
    title: "راهنمای تنظیمات",
    suggestions: [
      "این وزن‌ها چه اثری روی کارتابل می‌گذارند؟",
      "اگر آستانهٔ «داغ» را از ۷۴ به ۶۵ کم کنم چه می‌شود؟",
      "پیشنهاد می‌کنی چه چیزی را در ماتریس تغییر دهم؟",
    ],
    async buildContext() {
      const settings = await getSettings();
      const lines = ["## تنظیمات فعلی موتور"];
      lines.push(`- آستانه‌ها: سرد ≤${settings.temperatureBands.cold} · نیمه‌گرم ≤${settings.temperatureBands.warm} · گرم ≤${settings.temperatureBands.hot} · داغ بالاتر`);
      lines.push(`- حداقل پوشش: ${Math.round(settings.coverageThreshold * 100)}٪`);
      lines.push(`- حداکثر تماس بی‌پاسخ: ${settings.safetyMaxUnansweredCalls}`);
      lines.push(`- فاصله‌گذاری برند: ${settings.spacing.enabled ? "فعال" : "غیرفعال"}`);

      lines.push("\n## معیارها");
      for (const criterion of settings.temperatureCriteria) {
        lines.push(
          `- ${criterion.label} (سقف ${criterion.max}): ${criterion.options.map((o) => `${o.label}=${o.points ?? "نامعلوم"}`).join("، ")}`,
        );
      }

      lines.push("\n## ماتریس تصمیم");
      for (const band of Object.keys(settings.followupMatrix) as (keyof typeof settings.followupMatrix)[]) {
        const row = settings.followupMatrix[band];
        lines.push(
          `- ${BAND_LABELS[band]}: ${Object.entries(row).map(([range, stage]) => `${range}→${stage}`).join("، ")}`,
        );
      }
      return lines.join("\n");
    },
  },
};

export function getScope(id: string): ScopeDefinition | null {
  return SCOPES[id as ScopeId] ?? null;
}

export const SCOPE_SYSTEM_SUFFIX: Partial<Record<ScopeId, string>> = {
  cartable:
    "تو مشاور کارتابل هستی. اولویت‌بندی کن و برای هر پیشنهاد یک جملهٔ آمادهٔ تماس یا پیام بده.",
  customer:
    "تو مشاور فروش هستی. با توجه به دمای مشتری، چرخهٔ خرید و رقیبش، یک برنامهٔ مشخص بده.",
  dashboard: "تو تحلیلگر فروش هستی. عدد را تفسیر کن، نه اینکه فقط تکرار کنی.",
  orders: "تو تحلیلگر حاشیهٔ سود هستی. به اختلاف قیمت خرید و فروش دقت کن.",
  settings:
    "تو راهنمای پیکربندی هستی. اثر هر تغییر را با مثال عددی توضیح بده. خودت چیزی را تغییر نمی‌دهی.",
};

export { BASE_RULES };
