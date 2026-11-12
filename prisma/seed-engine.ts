import { Prisma, type PrismaClient } from "@prisma/client";
import { DEFAULT_SETTINGS } from "../src/lib/settings.ts";
import { evaluateTemperature } from "../src/lib/temperature.ts";
import { computeCycle } from "../src/lib/cycle.ts";

const D = (v: number | string) => new Prisma.Decimal(v);
const DAY = 86_400_000;

interface Context {
  db: PrismaClient;
  companies: { id: string; name: string }[];
  products: { id: string; name: string; unitPrice: Prisma.Decimal; costPrice: Prisma.Decimal }[];
  users: { adminId: string; managerId: string; repId: string };
}

/**
 * دادهٔ نمونهٔ موتور فروش دوره‌ای:
 * پرونده مشتری، تاریخچهٔ خرید ۱۲۰ روزه، ارزیابی دما و چرخه‌های محاسبه‌شده.
 *
 * شبه‌تصادفی «قطعی» است تا هر بار seed خروجی یکسان بدهد.
 */
export async function seedSalesEngine({ db, companies, products, users }: Context) {
  const industries = ["restaurant", "fastfood", "catering", "hall", "heyat", "other"];
  const sources = ["visit", "referral", "inbound", "campaign"];

  console.log("→ پروندهٔ مشتری…");
  for (let i = 0; i < companies.length; i++) {
    await db.company.update({
      where: { id: companies[i].id },
      data: {
        industryType: industries[i % industries.length],
        acquaintanceSource: sources[i % sources.length],
      },
    });

    await db.customerProfile.create({
      data: {
        companyId: companies[i].id,
        contactAllowed: i !== 3, // یک مشتری منع تماس دارد
        blockReason: i === 3 ? "مشتری درخواست عدم تماس کرده است" : null,
        competitorName: i % 3 === 0 ? "پخش ظروف ماهان" : i % 3 === 1 ? "بازار ظروف" : null,
        competitorLoyalty: i % 6,
        switchReadiness: (i * 2) % 6,
      },
    });
  }

  console.log("→ تاریخچهٔ خرید…");
  let seedValue = 42;
  const rand = () => {
    seedValue = (seedValue * 1103515245 + 12345) % 2147483648;
    return seedValue / 2147483648;
  };
  const now = Date.now();

  for (let c = 0; c < companies.length; c++) {
    const company = companies[c];
    const productCount = 2 + (c % 2);
    const chosen: typeof products = [];
    for (let k = 0; k < productCount; k++) {
      chosen.push(products[(c * 2 + k) % products.length]);
    }

    const orderCount = 4 + (c % 3);
    const baseCycle = 10 + (c % 4) * 4;

    // بعضی مشتری‌ها از موعد گذشته‌اند تا کارتابل حالت «تأخیر» هم داشته باشد
    // هر چهارمین مشتری از موعد گذشته است تا کارتابل حالت تأخیر هم داشته باشد
    const offset = c % 4 === 3 ? baseCycle + 6 : (c % 3) * 3;

    for (let o = orderCount - 1; o >= 0; o--) {
      const daysAgo = o * baseCycle + offset + Math.floor(rand() * 3);
      // محصول اصلی هر سفارش تکرار می‌شود (کالای ثابت مشتری)، بقیه گاهی
      const lines = chosen
        .filter((_product, index) => index === 0 || rand() > 0.3)
        .map((product) => ({
          product,
          quantity: 1 + Math.floor(rand() * 4),
        }));
      if (lines.length === 0) continue;

      let subtotal = D(0);
      let profit = D(0);
      const items = lines.map((line) => {
        const revenue = line.product.unitPrice.mul(line.quantity);
        const cost = line.product.costPrice.mul(line.quantity);
        subtotal = subtotal.add(revenue);
        profit = profit.add(revenue.sub(cost));
        return {
          productId: line.product.id,
          quantity: D(line.quantity),
          unitPrice: line.product.unitPrice,
          unitCostPrice: line.product.costPrice,
          lineRevenue: revenue,
          lineCost: cost,
          lineProfit: revenue.sub(cost),
        };
      });

      await db.order.create({
        data: {
          customerId: company.id,
          number: `SO-SEED-${c + 1}-${o + 1}`,
          orderedAt: new Date(now - daysAgo * DAY),
          subtotal,
          totalCost: subtotal.sub(profit),
          profit,
          createdById: c % 2 === 0 ? users.managerId : users.repId,
          items: { create: items },
        },
      });
    }
  }

  console.log("→ ارزیابی دما…");
  const criteria = DEFAULT_SETTINGS.temperatureCriteria;
  const allKeys = criteria.map((c) => c.key);

  for (let c = 0; c < companies.length; c++) {
    const answers: Record<string, number> = {};
    const profileIndex = c % 5;

    const pick = (key: string, phrase: "low" | "mid" | "high") => {
      const criterion = criteria.find((x) => x.key === key)!;
      const real = criterion.options
        .map((option, index) => ({ option, index }))
        .filter((x) => x.option.points !== null);
      const chosenIndex =
        phrase === "low"
          ? real[0].index
          : phrase === "mid"
            ? real[Math.floor(real.length / 2)].index
            : real[real.length - 1].index;
      answers[key] = chosenIndex;
    };

    const unknown = (key: string) => {
      const criterion = criteria.find((x) => x.key === key)!;
      answers[key] = criterion.options.findIndex((o) => o.points === null);
    };

    if (profileIndex === 0) allKeys.forEach((k) => pick(k, "low"));
    else if (profileIndex === 1) allKeys.forEach((k) => pick(k, "mid"));
    else if (profileIndex === 2) {
      ["need", "interest", "price", "engagement", "initiation"].forEach((k) => pick(k, "high"));
      ["competitor", "action"].forEach((k) => pick(k, "mid"));
    } else if (profileIndex === 3) allKeys.forEach((k) => pick(k, "high"));
    else {
      pick("need", "high");
      pick("interest", "high");
      ["price", "engagement", "initiation", "competitor", "action"].forEach(unknown);
    }

    const result = evaluateTemperature({
      criteria,
      bands: DEFAULT_SETTINGS.temperatureBands,
      coverageThreshold: DEFAULT_SETTINGS.coverageThreshold,
      answers,
    });

    await db.temperatureEvaluation.create({
      data: {
        customerId: companies[c].id,
        rawScore: result.rawScore,
        coveredMax: result.coveredMax,
        coverage: D(Math.round(result.coverage * 1000) / 10),
        isProvisional: result.isProvisional,
        band: result.band,
        answers: JSON.stringify(answers),
        evaluatedById: c % 2 === 0 ? users.managerId : users.repId,
        evaluatedAt: new Date(now - (c % 7) * DAY),
      },
    });
  }

  console.log("→ دلایل عدم خرید (نمونه)…");
  const objections = ["price", "quality", "settlement", "hasStock", "competitor", "other"];
  for (let i = 0; i < companies.length; i++) {
    await db.followUpTask.create({
      data: {
        customerId: companies[i].id,
        dueDate: new Date(now - (i + 2) * DAY),
        stage: 5,
        channel: "whatsapp",
        priority: "P3",
        reason: "پیگیری بررسی موجودی",
        status: "skipped",
        objection: objections[i % objections.length],
        completedAt: new Date(now - (i + 1) * DAY),
        assigneeId: i % 2 === 0 ? users.managerId : users.repId,
      },
    });
  }

  console.log("→ چرخه‌های خرید…");
  for (const company of companies) {
    const orders = await db.order.findMany({
      where: { customerId: company.id, status: { not: "cancelled" } },
      include: { items: true },
      orderBy: { orderedAt: "asc" },
    });

    const byProduct = new Map<string, { date: Date; quantity: Prisma.Decimal }[]>();
    for (const order of orders) {
      for (const item of order.items) {
        const list = byProduct.get(item.productId) ?? [];
        list.push({ date: order.orderedAt, quantity: item.quantity });
        byProduct.set(item.productId, list);
      }
    }

    for (const [productId, purchases] of byProduct) {
      const cycle = computeCycle(purchases, { minSamples: DEFAULT_SETTINGS.cycleMinSamples });
      await db.purchaseCycle.create({
        data: {
          customerId: company.id,
          productId,
          medianCycleDays: cycle.medianCycleDays === null ? null : D(cycle.medianCycleDays),
          meanCycleDays: cycle.meanCycleDays === null ? null : D(cycle.meanCycleDays),
          sampleSize: cycle.sampleSize,
          totalQuantity: cycle.totalQuantity,
          lastPurchaseAt: cycle.lastPurchaseAt,
          expectedDate: cycle.expectedDate,
          dailyConsumption: cycle.dailyConsumption.toDecimalPlaces(3),
          estimatedStock: cycle.estimatedStock.toDecimalPlaces(3),
          status: cycle.status,
        },
      });
    }
  }
}
