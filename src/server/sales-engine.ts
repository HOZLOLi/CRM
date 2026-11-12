import "server-only";
import { db } from "./db";
import { getSettings } from "./settings";
import { Decimal, dec, round, sum } from "@/lib/money";
import { computeCycle, suggestedOrderQuantity, type Purchase } from "@/lib/cycle";
import { decideFollowUp, annualValue, renderMessage, type Priority } from "@/lib/followup";
import { evaluateTemperature, isMaxAnswer } from "@/lib/temperature";
import { planSpacing, isSpacingDue } from "@/lib/spacing";
import { BAND_LABELS } from "@/lib/settings";
import type { BandKey } from "@/lib/settings";

/* ------------------------------------------------------------- orders */

export interface OrderLineInput {
  productId: string;
  quantity: string | number;
}

export interface CreateOrderInput {
  customerId: string;
  orderedAt?: Date;
  note?: string;
  lines: OrderLineInput[];
  userId?: string;
}

/**
 * ثبت سفارش.
 *
 * سه کار انجام می‌دهد: محاسبهٔ سود با Decimal، بستن وظایف باز چرخهٔ قبلی، و
 * بازمحاسبهٔ چرخهٔ خرید.
 */
export async function createOrder(input: CreateOrderInput) {
  if (input.lines.length === 0) throw new Error("سفارش باید حداقل یک ردیف داشته باشد");

  const productIds = input.lines.map((l) => l.productId);
  const products = await db.product.findMany({ where: { id: { in: productIds } } });
  const productById = new Map(products.map((p) => [p.id, p]));

  let subtotal = new Decimal(0);
  let totalCost = new Decimal(0);

  const items = input.lines.map((line) => {
    const product = productById.get(line.productId);
    if (!product) throw new Error("محصول انتخابی پیدا نشد");

    const quantity = dec(line.quantity);
    if (quantity.lessThanOrEqualTo(0)) throw new Error("تعداد باید بزرگ‌تر از صفر باشد");

    const unitPrice = product.unitPrice;
    const unitCostPrice = product.costPrice;

    const lineRevenue = round(quantity.times(unitPrice), 2);
    const lineCost = round(quantity.times(unitCostPrice), 2);
    const lineProfit = round(lineRevenue.minus(lineCost), 2);

    subtotal = subtotal.plus(lineRevenue);
    totalCost = totalCost.plus(lineCost);

    return {
      productId: product.id,
      quantity,
      unitPrice,
      unitCostPrice,
      lineRevenue,
      lineCost,
      lineProfit,
    };
  });

  const orderedAt = input.orderedAt ?? new Date();
  const number = await nextOrderNumber(orderedAt);

  const order = await db.order.create({
    data: {
      customerId: input.customerId,
      number,
      orderedAt,
      note: input.note,
      subtotal: round(subtotal, 2),
      totalCost: round(totalCost, 2),
      profit: round(subtotal.minus(totalCost), 2),
      createdById: input.userId,
      items: { create: items },
    },
    include: { items: true },
  });

  // ثبت سفارش، وظایف باز چرخهٔ قبلی این مشتری را می‌بندد
  const closed = await db.followUpTask.updateMany({
    where: { customerId: input.customerId, status: "open" },
    data: { status: "done", completedAt: orderedAt },
  });

  await db.decisionLog.create({
    data: {
      entityType: "order",
      entityId: order.id,
      decision: "created",
      detail: JSON.stringify({
        number,
        subtotal: order.subtotal.toString(),
        profit: order.profit.toString(),
        closedFollowUps: closed.count,
      }),
      userId: input.userId ?? null,
    },
  });

  await recomputeCyclesForCustomer(input.customerId);

  return order;
}

async function nextOrderNumber(date: Date): Promise<string> {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await db.order.count({
    where: { orderedAt: { gte: new Date(`${date.toISOString().slice(0, 10)}T00:00:00Z`) } },
  });
  return `SO-${stamp}-${String(count + 1).padStart(3, "0")}`;
}

/* ------------------------------------------------------------- cycles */

/**
 * بازمحاسبهٔ چرخهٔ خرید برای یک مشتری (یا همه).
 * مقدار ذخیره‌شده است چون کارتابل نباید برای هر نمایش همهٔ سفارش‌ها را بخواند.
 */
export async function recomputeCyclesForCustomer(customerId: string) {
  const settings = await getSettings();

  const orders = await db.order.findMany({
    where: { customerId, status: { not: "cancelled" } },
    include: { items: true },
    orderBy: { orderedAt: "asc" },
  });

  // گروه‌بندی خریدها بر اساس محصول
  const byProduct = new Map<string, Purchase[]>();
  for (const order of orders) {
    for (const item of order.items) {
      const list = byProduct.get(item.productId) ?? [];
      list.push({ date: order.orderedAt, quantity: item.quantity });
      byProduct.set(item.productId, list);
    }
  }

  const results = [];
  for (const [productId, purchases] of byProduct) {
    const result = computeCycle(purchases, { minSamples: settings.cycleMinSamples });

    const record = await db.purchaseCycle.upsert({
      where: { customerId_productId: { customerId, productId } },
      update: {
        medianCycleDays: result.medianCycleDays === null ? null : dec(result.medianCycleDays),
        meanCycleDays: result.meanCycleDays === null ? null : dec(result.meanCycleDays),
        sampleSize: result.sampleSize,
        totalQuantity: result.totalQuantity,
        lastPurchaseAt: result.lastPurchaseAt,
        expectedDate: result.expectedDate,
        dailyConsumption: round(result.dailyConsumption, 3),
        estimatedStock: round(result.estimatedStock, 3),
        status: result.status,
        computedAt: new Date(),
      },
      create: {
        customerId,
        productId,
        medianCycleDays: result.medianCycleDays === null ? null : dec(result.medianCycleDays),
        meanCycleDays: result.meanCycleDays === null ? null : dec(result.meanCycleDays),
        sampleSize: result.sampleSize,
        totalQuantity: result.totalQuantity,
        lastPurchaseAt: result.lastPurchaseAt,
        expectedDate: result.expectedDate,
        dailyConsumption: round(result.dailyConsumption, 3),
        estimatedStock: round(result.estimatedStock, 3),
        status: result.status,
      },
    });

    results.push({ ...record, suggested: suggestedOrderQuantity(result) });
  }

  return results;
}

export async function recomputeAllCycles() {
  const customers = await db.company.findMany({
    where: { orders: { some: {} } },
    select: { id: true },
  });

  for (const customer of customers) {
    await recomputeCyclesForCustomer(customer.id);
  }
  return customers.length;
}

/* --------------------------------------------------------- temperature */

export async function saveTemperatureEvaluation(input: {
  customerId: string;
  answers: Record<string, number>;
  note?: string;
  userId?: string;
}) {
  const settings = await getSettings();

  const result = evaluateTemperature({
    criteria: settings.temperatureCriteria,
    bands: settings.temperatureBands,
    coverageThreshold: settings.coverageThreshold,
    answers: input.answers,
  });

  const evaluation = await db.temperatureEvaluation.create({
    data: {
      customerId: input.customerId,
      rawScore: result.rawScore,
      coveredMax: result.coveredMax,
      coverage: round(result.coverage * 100, 1),
      isProvisional: result.isProvisional,
      band: result.band,
      answers: JSON.stringify(input.answers),
      note: input.note,
      evaluatedById: input.userId ?? null,
    },
  });

  await db.decisionLog.create({
    data: {
      entityType: "customer",
      entityId: input.customerId,
      decision: "temperature_evaluated",
      detail: JSON.stringify({
        rawScore: result.rawScore,
        coverage: result.coverage,
        band: result.band,
        provisional: result.isProvisional,
      }),
      userId: input.userId ?? null,
    },
  });

  return { evaluation, result };
}

/* ----------------------------------------------------------- cartable */

export interface CartableCard {
  customerId: string;
  customerName: string;
  industryType: string | null;
  band: BandKey;
  bandLabel: string;
  rawScore: number;
  coverage: number;
  isProvisional: boolean;
  productId: string | null;
  productName: string | null;
  cycleDays: number | null;
  daysUntil: number | null;
  expectedDate: string | null;
  stage: number;
  channel: string;
  priority: Priority;
  annualValue: number;
  annualValueEstimated: boolean;
  estimatedStock: number;
  suggestedQuantity: number | null;
  suggestedMessage: string;
  reasons: string[];
  attempts: number;
  ownerName: string | null;
  agreedDate: string | null;
}

export interface CartableOptions {
  assigneeId?: string;
  includeBlocked?: boolean;
}

/**
 * کارتابل روزانه.
 *
 * برای هر مشتری: آخرین دما، نزدیک‌ترین چرخهٔ خرید، و تصمیم ماتریس.
 * مشتری منع‌تماس هرگز کارت نمی‌گیرد.
 */
export async function buildCartable(options: CartableOptions = {}): Promise<CartableCard[]> {
  const settings = await getSettings();
  const today = new Date();

  const customers = await db.company.findMany({
    where: {
      ...(options.assigneeId ? { ownerId: options.assigneeId } : {}),
      orders: { some: {} },
    },
    include: {
      profile: true,
      owner: true,
      temperatureEvaluations: { orderBy: { evaluatedAt: "desc" }, take: 1 },
      purchaseCycles: {
        where: { expectedDate: { not: null } },
        include: { product: true },
        orderBy: { expectedDate: "asc" },
        take: 1,
      },
      orders: { orderBy: { orderedAt: "desc" }, take: 5, select: { subtotal: true } },
      followUpTasks: {
        where: { status: "open" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const cards: CartableCard[] = [];

  for (const customer of customers) {
    const profile = customer.profile;
    const evaluation = customer.temperatureEvaluations[0];
    const cycle = customer.purchaseCycles[0];

    if (!evaluation) continue; // بدون ارزیابی، تصمیمی وجود ندارد

    const band = evaluation.band as BandKey;

    const urgent = (() => {
      try {
        const answers = JSON.parse(evaluation.answers) as Record<string, number>;
        return isMaxAnswer(settings.temperatureCriteria, answers, "action");
      } catch {
        return false;
      }
    })();

    const decision = decideFollowUp(
      {
        band,
        expectedDate: cycle?.expectedDate ?? null,
        agreedNextContact: profile?.agreedNextContact ?? null,
        contactAllowed: profile?.contactAllowed ?? true,
        attempts: customer.followUpTasks[0]?.attempts ?? 0,
        urgent,
        today,
      },
      {
        matrix: settings.followupMatrix,
        channels: settings.followupChannels,
        maxUnansweredCalls: settings.safetyMaxUnansweredCalls,
      },
    );

    if (decision.blocked && !options.includeBlocked) continue;

    const cycleDays = cycle?.medianCycleDays ? Number(cycle.medianCycleDays.toString()) : null;

    const orderValues = customer.orders.map((o) => Number(o.subtotal.toString()));
    const avgOrderValue = orderValues.length
      ? orderValues.sort((a, b) => a - b)[Math.floor(orderValues.length / 2)]
      : 0;
    const value = annualValue(avgOrderValue, cycleDays);

    const template = settings.followupMessages[String(decision.stage)] ?? "";
    const message = renderMessage(template, {
      customer: customer.name,
      product: cycle?.product?.name ?? "",
      brand: "فیروزه",
      repName: customer.owner?.name ?? "",
    });

    cards.push({
      customerId: customer.id,
      customerName: customer.name,
      industryType: customer.industryType,
      band,
      bandLabel: BAND_LABELS[band] ?? band,
      rawScore: evaluation.rawScore,
      coverage: Number(evaluation.coverage.toString()),
      isProvisional: evaluation.isProvisional,
      productId: cycle?.productId ?? null,
      productName: cycle?.product?.name ?? null,
      cycleDays,
      daysUntil: decision.daysUntil,
      expectedDate: cycle?.expectedDate?.toISOString() ?? null,
      stage: decision.stage,
      channel: decision.channel,
      priority: decision.priority,
      annualValue: value.value,
      annualValueEstimated: value.estimated,
      estimatedStock: cycle ? Number(cycle.estimatedStock.toString()) : 0,
      suggestedQuantity: cycle?.medianCycleDays
        ? Math.ceil(
            Number(cycle.dailyConsumption.toString()) * Number(cycle.medianCycleDays.toString()),
          )
        : null,
      suggestedMessage: message,
      reasons: decision.reasons,
      attempts: customer.followUpTasks[0]?.attempts ?? 0,
      ownerName: customer.owner?.name ?? null,
      agreedDate: profile?.agreedNextContact?.toISOString() ?? null,
    });
  }

  const priorityRank: Record<Priority, number> = { P1: 0, P2: 1, P3: 2 };

  return cards.sort((a, b) => {
    const byPriority = priorityRank[a.priority] - priorityRank[b.priority];
    if (byPriority !== 0) return byPriority;
    const byDays = (a.daysUntil ?? 999) - (b.daysUntil ?? 999);
    if (byDays !== 0) return byDays;
    return b.annualValue - a.annualValue;
  });
}

/* ------------------------------------------------------------- spacing */

/** تولید یادآوری فاصله‌دار برای مشتریان خارج از چرخه. */
export async function generateSpacingTasks() {
  const settings = await getSettings();
  if (!settings.spacing.enabled) return { created: 0 };

  const customers = await db.company.findMany({
    where: { profile: { contactAllowed: true } },
    include: {
      profile: true,
      orders: { orderBy: { orderedAt: "desc" }, take: 1, select: { orderedAt: true } },
    },
  });

  let created = 0;
  const today = new Date();

  for (const customer of customers) {
    const lastOrder = customer.orders[0];
    if (!lastOrder) continue;

    // فقط کسانی که از چرخهٔ خرید خارج شده‌اند
    const daysSince = Math.round(
      (today.getTime() - lastOrder.orderedAt.getTime()) / 86_400_000,
    );
    if (daysSince < 21) continue;

    const open = await db.followUpTask.findFirst({
      where: { customerId: customer.id, source: "spacing", status: "open" },
    });
    if (open) continue;

    const plan = planSpacing(lastOrder.orderedAt, settings.spacing);
    if (!plan || !isSpacingDue(plan, today)) continue;

    const template = settings.followupMessages["1"] ?? "";
    await db.followUpTask.create({
      data: {
        customerId: customer.id,
        dueDate: plan.nextTouchDate,
        stage: 1,
        channel: "sms",
        priority: "P3",
        reason: `${daysSince} روز بدون خرید — یادآوری برند (بازهٔ ${plan.bucket?.maxDays} روز)`,
        inputs: JSON.stringify({
          daysSinceLastPurchase: daysSince,
          intervalDays: plan.intervalDays,
        }),
        suggestedMessage: renderMessage(template, {
          customer: customer.name,
          brand: "فیروزه",
        }),
        source: "spacing",
        assigneeId: null,
      },
    });
    created++;
  }

  return { created };
}

/* ---------------------------------------------------------- dashboard */

export async function salesKpis() {
  const [orders, cycles, evaluations] = await Promise.all([
    db.order.findMany({
      where: { status: { not: "cancelled" } },
      select: { subtotal: true, profit: true, orderedAt: true },
    }),
    db.purchaseCycle.findMany({ select: { status: true, expectedDate: true } }),
    db.company.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { orders: true } },
        temperatureEvaluations: { orderBy: { evaluatedAt: "desc" }, take: 1, select: { band: true } },
      },
    }),
  ]);

  const revenue = sum(orders.map((o) => o.subtotal));
  const profit = sum(orders.map((o) => o.profit));

  const bandCounts: Record<string, number> = { cold: 0, warm: 0, hot: 0, veryHot: 0 };
  for (const customer of evaluations) {
    const band = customer.temperatureEvaluations[0]?.band;
    if (band && band in bandCounts) bandCounts[band]++;
  }

  const overdue = cycles.filter((c) => c.status === "overdue").length;

  return {
    orderCount: orders.length,
    revenue,
    profit,
    marginPercent: revenue.isZero() ? new Decimal(0) : round(profit.dividedBy(revenue).times(100), 1),
    bandCounts,
    overdue,
    learning: cycles.filter((c) => c.status === "learning").length,
  };
}
