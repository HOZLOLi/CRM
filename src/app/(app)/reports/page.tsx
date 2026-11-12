import Link from "next/link";
import { Crown, Swords, MessageSquareWarning, UserCheck } from "lucide-react";
import { db } from "@/server/db";
import { requireUser } from "@/server/auth";
import { salesKpis } from "@/server/sales-engine";
import { isAiConfigured } from "@/server/ai/provider";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Panel, PanelHeader, EmptyState } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { AiInsight } from "@/components/features/ai-insight";
import { formatMoney, dec, sum } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata = { title: "گزارش‌ها" };
export const dynamic = "force-dynamic";

const OBJECTION_LABEL: Record<string, string> = {
  price: "قیمت",
  quality: "کیفیت",
  settlement: "شرایط تسویه",
  hasStock: "موجودی دارد",
  competitor: "رقیب",
  other: "سایر",
};

const INDUSTRY_LABEL: Record<string, string> = {
  restaurant: "رستوران",
  fastfood: "فست‌فود",
  catering: "کترینگ",
  hall: "تالار",
  heyat: "هیئت",
  other: "سایر",
};

export default async function ReportsPage() {
  await requireUser();

  const [kpis, customers, objections, reps, ordersByRep] = await Promise.all([
    salesKpis(),
    db.company.findMany({
      include: {
        profile: true,
        orders: { select: { subtotal: true, profit: true, orderedAt: true } },
      },
    }),
    db.followUpTask.groupBy({
      by: ["objection"],
      where: { objection: { not: null } },
      _count: { objection: true },
    }),
    db.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, avatarHue: true, role: true },
    }),
    db.order.groupBy({
      by: ["createdById"],
      _count: { id: true },
      _sum: { subtotal: true, profit: true },
    }),
  ]);

  // ---------------------------------------------------------- top buyers
  const buyers = customers
    .map((customer) => {
      const revenue = sum(customer.orders.map((o) => o.subtotal));
      const profit = sum(customer.orders.map((o) => o.profit));
      return { customer, revenue, profit, count: customer.orders.length };
    })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.revenue.comparedTo(a.revenue))
    .slice(0, 8);

  const maxRevenue = buyers[0]?.revenue.toNumber() ?? 1;

  // ---------------------------------------------------------- competitor loyal
  const loyal = customers
    .filter((customer) => customer.profile?.competitorName)
    .map((customer) => ({
      customer,
      loyalty: customer.profile?.competitorLoyalty ?? 0,
      readiness: customer.profile?.switchReadiness ?? 0,
      revenue: sum(customer.orders.map((o) => o.subtotal)),
    }))
    .sort((a, b) => b.loyalty - a.loyalty || b.revenue.comparedTo(a.revenue))
    .slice(0, 8);

  // ---------------------------------------------------------- objections
  const objectionTotal = objections.reduce((acc, row) => acc + row._count.objection, 0);
  const objectionRows = objections
    .map((row) => ({
      key: row.objection as string,
      count: row._count.objection,
    }))
    .sort((a, b) => b.count - a.count);

  // ---------------------------------------------------------- rep performance
  const repRows = reps.map((rep) => {
    const orders = ordersByRep.find((row) => row.createdById === rep.id);
    const customerCount = customers.filter(
      (c) => c.orders.length > 0 && c.orders.some((o) => true),
    ).length;
    return {
      rep,
      orderCount: orders?._count.id ?? 0,
      revenue: orders?._sum.subtotal ?? dec(0),
      profit: orders?._sum.profit ?? dec(0),
      customerCount,
    };
  });

  const followupByAssignee = await db.followUpTask.groupBy({
    by: ["assigneeId", "status"],
    _count: { id: true },
  });

  function followupsFor(userId: string, status: string) {
    return (
      followupByAssignee.find((row) => row.assigneeId === userId && row.status === status)?._count
        .id ?? 0
    );
  }

  return (
    <>
      <PageHeader
        title="گزارش‌ها"
        description="تحلیل دادهٔ واقعی: مشتریان پرخرید، رقبا، دلایل عدم خرید و عملکرد تیم."
      />

      <PageBody className="flex flex-col gap-5">
        <AiInsight
          scope="orders"
          title="تحلیل سفارش‌ها و حاشیهٔ سود"
          configured={isAiConfigured()}
          suggestions={[
            "کدام محصول بیشترین سود را دارد؟",
            "حاشیهٔ سود کدام سفارش پایین است و چرا؟",
            "چه محصولی را باید در پیشنهاد بعدی برجسته کنم؟",
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {/* ------------------------------------------------ top buyers */}
          <Panel>
            <PanelHeader
              title="مشتریان پرخرید"
              subtitle={`${buyers.length.toLocaleString("fa-IR")} مشتری برتر بر پایهٔ درآمد`}
              action={<Crown size={15} className="text-saffron" />}
            />
            <div className="rule mx-5" />
            {buyers.length === 0 ? (
              <EmptyState title="سفارشی ثبت نشده" />
            ) : (
              <ul className="divide-y divide-line">
                {buyers.map((row, index) => (
                  <li key={row.customer.id} className="px-5 py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={`/companies/${row.customer.id}`}
                        className="flex min-w-0 items-center gap-2 text-[13px] text-ink hover:text-turquoise"
                      >
                        <span className="tnum w-4 shrink-0 text-[11px] text-ink-faint">
                          {(index + 1).toLocaleString("fa-IR")}
                        </span>
                        <span className="truncate">{row.customer.name}</span>
                      </Link>
                      <span className="tnum shrink-0 text-[12.5px] text-ink">
                        {formatMoney(row.revenue, { compact: true })}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full bg-turquoise"
                          style={{ width: `${Math.max(3, (row.revenue.toNumber() / maxRevenue) * 100)}%` }}
                        />
                      </div>
                      <span className="tnum text-[10.5px] text-moss">
                        سود {formatMoney(row.profit, { compact: true })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* ------------------------------------------------ competitor loyal */}
          <Panel>
            <PanelHeader
              title="وفادار به رقبا"
              subtitle="مشتریانی که تأمین‌کنندهٔ دیگری دارند"
              action={<Swords size={15} className="text-clay" />}
            />
            <div className="rule mx-5" />
            {loyal.length === 0 ? (
              <EmptyState title="پروندهٔ رقیبی ثبت نشده" />
            ) : (
              <ul className="divide-y divide-line">
                {loyal.map((row) => (
                  <li key={row.customer.id} className="flex items-center gap-3 px-5 py-2.5">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/companies/${row.customer.id}`}
                        className="truncate text-[13px] text-ink hover:text-turquoise"
                      >
                        {row.customer.name}
                      </Link>
                      <p className="truncate text-[11.5px] text-ink-faint">
                        رقیب: {row.customer.profile?.competitorName}
                        <span className="mx-1.5 text-line-strong">·</span>
                        {INDUSTRY_LABEL[row.customer.industryType ?? ""] ?? "—"}
                      </p>
                    </div>
                    <div className="shrink-0 text-left">
                      <p className="text-[10.5px] text-ink-faint">وفاداری</p>
                      <Dots value={row.loyalty} tone="clay" />
                    </div>
                    <div className="shrink-0 text-left">
                      <p className="text-[10.5px] text-ink-faint">آمادگی</p>
                      <Dots value={row.readiness} tone="turquoise" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* ------------------------------------------------ objections */}
          <Panel>
            <PanelHeader
              title="دلایل عدم خرید"
              subtitle={`${objectionTotal.toLocaleString("fa-IR")} پیگیری رد‌شده با دلیل ثبت‌شده`}
              action={<MessageSquareWarning size={15} className="text-saffron" />}
            />
            <div className="rule mx-5" />
            {objectionRows.length === 0 ? (
              <EmptyState
                title="دلیلی ثبت نشده"
                description="وقتی فروشنده پیگیری را رد می‌کند، دلیل را انتخاب می‌کند و اینجا ثبت می‌شود."
              />
            ) : (
              <div className="flex flex-col gap-3 px-5 py-4">
                {objectionRows.map((row) => (
                  <div key={row.key}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-[12px] text-ink-soft">
                        {OBJECTION_LABEL[row.key] ?? row.key}
                      </span>
                      <span className="tnum text-[11.5px] text-ink-faint">
                        {row.count.toLocaleString("fa-IR")} ·{" "}
                        {Math.round((row.count / Math.max(1, objectionTotal)) * 100).toLocaleString(
                          "fa-IR",
                        )}
                        ٪
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-saffron"
                        style={{ width: `${Math.max(3, (row.count / Math.max(1, objectionTotal)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* ------------------------------------------------ rep performance */}
          <Panel>
            <PanelHeader
              title="عملکرد کارشناسان"
              subtitle="سفارش، سود و پیگیری"
              action={<UserCheck size={15} className="text-turquoise" />}
            />
            <div className="rule mx-5" />
            <ul className="divide-y divide-line">
              {repRows.map((row) => (
                <li key={row.rep.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={row.rep.name} hue={row.rep.avatarHue} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-ink">{row.rep.name}</p>
                    <p className="tnum text-[11.5px] text-ink-faint">
                      {row.orderCount.toLocaleString("fa-IR")} سفارش ·{" "}
                      {followupsFor(row.rep.id, "done").toLocaleString("fa-IR")} پیگیری انجام‌شده
                    </p>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="tnum text-[12.5px] text-ink">
                      {formatMoney(row.revenue, { compact: true })}
                    </p>
                    <p className="tnum text-[11px] text-moss">
                      سود {formatMoney(row.profit, { compact: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* ------------------------------------------------ summary strip */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line lg:grid-cols-4">
          {[
            ["درآمد کل", formatMoney(kpis.revenue, { compact: true })],
            ["سود ناخالص", formatMoney(kpis.profit, { compact: true })],
            [
              "حاشیهٔ سود",
              `${kpis.marginPercent.toNumber().toLocaleString("fa-IR", { maximumFractionDigits: 1 })}٪`,
            ],
            ["تأخیرها", kpis.overdue.toLocaleString("fa-IR")],
          ].map(([label, value]) => (
            <div key={label} className="bg-surface px-4 py-4">
              <p className="text-[11px] text-ink-faint">{label}</p>
              <p className="tnum mt-1 text-[17px] font-medium text-ink">{value}</p>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}

function Dots({ value, tone }: { value: number; tone: "clay" | "turquoise" }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} از ۵`}>
      {[1, 2, 3, 4, 5].map((level) => (
        <span
          key={level}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            level <= value ? (tone === "clay" ? "bg-clay" : "bg-turquoise") : "bg-line",
          )}
        />
      ))}
    </span>
  );
}
