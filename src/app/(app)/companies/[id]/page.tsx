import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  User,
  Package,
  TrendingUp,
  ShieldOff,
  Swords,
} from "lucide-react";
import { db } from "@/server/db";
import { requireUser } from "@/server/auth";
import { getSettings } from "@/server/settings";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Panel, PanelHeader, EmptyState } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { TemperatureForm } from "@/components/features/temperature-form";
import { AiInsight } from "@/components/features/ai-insight";
import { isAiConfigured } from "@/server/ai/provider";
import { formatMoney, sum } from "@/lib/money";
import { formatDate, isOverdue } from "@/lib/date";
import { BAND_LABEL_FA } from "@/lib/temperature";
import { STAGE_LABELS, type BandKey } from "@/lib/settings";

export const dynamic = "force-dynamic";

const INDUSTRY_LABEL: Record<string, string> = {
  restaurant: "رستوران",
  fastfood: "فست‌فود",
  catering: "کترینگ",
  hall: "تالار",
  heyat: "هیئت",
  other: "سایر",
};

const BAND_TONE: Record<BandKey, "neutral" | "saffron" | "turquoise" | "clay"> = {
  cold: "neutral",
  warm: "saffron",
  hot: "turquoise",
  veryHot: "clay",
};

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const settings = await getSettings();

  const customer = await db.company.findUnique({
    where: { id },
    include: {
      profile: true,
      owner: true,
      contacts: true,
      orders: {
        include: { items: { include: { product: true } } },
        orderBy: { orderedAt: "desc" },
        take: 8,
      },
      purchaseCycles: {
        include: { product: true },
        orderBy: { expectedDate: "asc" },
      },
      temperatureEvaluations: { orderBy: { evaluatedAt: "desc" }, take: 5 },
      followUpTasks: { where: { status: "open" }, orderBy: { dueDate: "asc" } },
    },
  });

  if (!customer) notFound();

  const latest = customer.temperatureEvaluations[0];
  const band = (latest?.band ?? "cold") as BandKey;
  const orderTotal = sum(customer.orders.map((o) => o.subtotal));
  const orderProfit = sum(customer.orders.map((o) => o.profit));

  return (
    <>
      <PageHeader
        title={customer.name}
        description={
          [
            INDUSTRY_LABEL[customer.industryType ?? ""],
            customer.city,
            customer.owner?.name,
          ]
            .filter(Boolean)
            .join(" · ") || "بدون اطلاعات تکمیلی"
        }
        actions={
          <Link
            href="/companies"
            className="inline-flex h-9 items-center gap-1.5 rounded-[7px] border border-line bg-surface px-3 text-[12.5px] text-ink-soft transition-colors hover:border-line-strong"
          >
            <ArrowRight size={14} />
            بازگشت
          </Link>
        }
      />

      <PageBody className="flex flex-col gap-5">
        <AiInsight
          scope="customer"
          entityId={customer.id}
          title="تحلیل این مشتری"
          configured={isAiConfigured()}
          suggestions={[
            "وضعیت این مشتری را تحلیل کن و بگو اول چه کاری لازم است",
            "چطور می‌توانم این مشتری را از رقیب بگیرم؟",
            "پیش‌بینی خرید بعدی و مقدار پیشنهادی چقدر است؟",
          ]}
        />

        {/* warning strip */}
        {customer.profile && !customer.profile.contactAllowed ? (
          <div className="flex items-start gap-2.5 rounded-[10px] border border-clay/30 bg-clay-soft px-4 py-3">
            <ShieldOff size={16} className="mt-0.5 shrink-0 text-clay" />
            <div>
              <p className="text-[13px] font-medium text-clay">منع تماس فعال است</p>
              <p className="mt-0.5 text-[12px] text-clay/80">
                {customer.profile.blockReason ?? "مشتری درخواست عدم تماس داده است"} — هیچ وظیفهٔ
                تماسی برای این مشتری ساخته نمی‌شود.
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          {/* -------------------------------------------------- interview */}
          <Panel className="overflow-hidden">
            <PanelHeader
              title="مصاحبهٔ دمای مشتری"
              subtitle="۷ معیار، مجموع ۱۰۰ امتیاز — «اطلاعی ندارم» نمره را صفر نمی‌کند"
              action={
                latest ? (
                  <Badge tone={BAND_TONE[band]}>
                    {BAND_LABEL_FA[band]} · {latest.rawScore.toLocaleString("fa-IR")}
                  </Badge>
                ) : (
                  <Badge tone="neutral">بدون ارزیابی</Badge>
                )
              }
            />
            <div className="rule mx-5" />
            <TemperatureForm
              customerId={customer.id}
              criteria={settings.temperatureCriteria}
              bands={settings.temperatureBands}
              coverageThreshold={settings.coverageThreshold}
            />
          </Panel>

          <div className="flex flex-col gap-5">
            {/* ---------------------------------------------- profile */}
            <Panel>
              <PanelHeader title="پروندهٔ مشتری" subtitle="اطلاعات پایه و رقبا" />
              <div className="rule mx-5" />
              <div className="flex flex-col gap-2.5 px-5 py-4 text-[12.5px]">
                <Row icon={<Building2 size={13} />} label="صنف">
                  {INDUSTRY_LABEL[customer.industryType ?? ""] ?? "—"}
                </Row>
                <Row icon={<Phone size={13} />} label="تلفن" mono>
                  {customer.phone ?? "—"}
                </Row>
                <Row icon={<MapPin size={13} />} label="آدرس">
                  {customer.address ?? customer.city ?? "—"}
                </Row>
                <Row icon={<User size={13} />} label="کارشناس">
                  {customer.owner?.name ?? "—"}
                </Row>

                <div className="my-1 h-px bg-line" />

                <Row icon={<Swords size={13} />} label="تأمین‌کنندهٔ فعلی">
                  {customer.profile?.competitorName ?? "ثبت نشده"}
                </Row>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-faint">وفاداری به رقیب</span>
                  <Dots value={customer.profile?.competitorLoyalty ?? 0} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-faint">آمادگی جایگزینی</span>
                  <Dots value={customer.profile?.switchReadiness ?? 0} />
                </div>
              </div>
            </Panel>

            {/* ---------------------------------------------- contacts */}
            <Panel>
              <PanelHeader title="رابط‌ها" subtitle={`${customer.contacts.length} نفر`} />
              <div className="rule mx-5" />
              {customer.contacts.length === 0 ? (
                <EmptyState title="رابطی ثبت نشده" />
              ) : (
                <ul className="divide-y divide-line">
                  {customer.contacts.map((contact) => (
                    <li key={contact.id} className="flex items-center gap-3 px-5 py-2.5">
                      <Avatar name={`${contact.firstName} ${contact.lastName}`} hue={200} size={26} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] text-ink">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="truncate text-[11px] text-ink-faint">{contact.title ?? "—"}</p>
                      </div>
                      <span dir="ltr" className="tnum text-[11.5px] text-ink-soft">
                        {contact.mobile ?? ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>

        {/* -------------------------------------------------- orders */}
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Panel>
            <PanelHeader
              title="سفارش‌های اخیر"
              subtitle={`${customer.orders.length.toLocaleString("fa-IR")} سفارش · سود ${formatMoney(
                orderProfit,
                { compact: true },
              )}`}
            />
            <div className="rule mx-5" />
            {customer.orders.length === 0 ? (
              <EmptyState title="هنوز سفارشی ثبت نشده" />
            ) : (
              <ul className="divide-y divide-line">
                {customer.orders.map((order) => (
                  <li key={order.id} className="px-5 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <span dir="ltr" className="tnum text-[11.5px] text-ink-faint">
                        {order.number}
                      </span>
                      <span className="text-[12px] text-ink-soft">
                        {formatDate(order.orderedAt, "d MMM yyyy")}
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-3">
                      <span className="tnum text-[13px] font-medium text-ink">
                        {formatMoney(order.subtotal, { compact: true })}
                      </span>
                      <span className="tnum text-[11.5px] text-moss">
                        سود {formatMoney(order.profit, { compact: true })}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-ink-faint">
                      {order.items.map((i) => i.product.name).join("، ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="چرخهٔ خرید" subtitle="به‌ازای هر محصول" />
            <div className="rule mx-5" />
            {customer.purchaseCycles.length === 0 ? (
              <EmptyState title="چرخه‌ای محاسبه نشده" description="با ثبت سفارش ساخته می‌شود." />
            ) : (
              <ul className="divide-y divide-line">
                {customer.purchaseCycles.map((cycle) => {
                  const overdue = isOverdue(cycle.expectedDate);
                  return (
                    <li key={cycle.id} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-ink">
                          <Package size={12} className="shrink-0 text-ink-faint" />
                          <span className="truncate">{cycle.product.name}</span>
                        </span>
                        {cycle.status === "learning" ? (
                          <Badge tone="neutral">یادگیری</Badge>
                        ) : overdue ? (
                          <Badge tone="clay">تأخیر</Badge>
                        ) : (
                          <Badge tone="turquoise">فعال</Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[11.5px] text-ink-faint">
                        <span className="tnum">
                          چرخه {cycle.medianCycleDays?.toString() ?? "—"} روز
                        </span>
                        <span className="tnum">
                          خرید بعدی {formatDate(cycle.expectedDate, "d MMM")}
                        </span>
                        <span className="tnum">
                          موجودی{" "}
                          {cycle.status === "learning"
                            ? "—"
                            : Number(cycle.estimatedStock.toString()).toLocaleString("fa-IR", {
                                maximumFractionDigits: 1,
                              })}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        {/* -------------------------------------------------- history */}
        {customer.temperatureEvaluations.length > 0 ? (
          <Panel>
            <PanelHeader title="تاریخچهٔ ارزیابی" subtitle="روند دمای مشتری" />
            <div className="rule mx-5" />
            <ul className="divide-y divide-line">
              {customer.temperatureEvaluations.map((evaluation) => (
                <li key={evaluation.id} className="flex items-center gap-3 px-5 py-2.5">
                  <Badge tone={BAND_TONE[evaluation.band as BandKey] ?? "neutral"}>
                    {BAND_LABEL_FA[evaluation.band as BandKey] ?? evaluation.band}
                  </Badge>
                  <span className="tnum text-[12.5px] text-ink">
                    {evaluation.rawScore.toLocaleString("fa-IR")}
                  </span>
                  <span className="tnum text-[11.5px] text-ink-faint">
                    پوشش {Number(evaluation.coverage.toString()).toLocaleString("fa-IR")}٪
                  </span>
                  {evaluation.isProvisional ? <Badge tone="saffron">موقت</Badge> : null}
                  <span className="ms-auto text-[11.5px] text-ink-faint">
                    {formatDate(evaluation.evaluatedAt, "d MMM yyyy")}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        {/* -------------------------------------------------- open tasks */}
        {customer.followUpTasks.length > 0 ? (
          <Panel>
            <PanelHeader title="پیگیری‌های باز" subtitle={`${customer.followUpTasks.length} مورد`} />
            <div className="rule mx-5" />
            <ul className="divide-y divide-line">
              {customer.followUpTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 px-5 py-2.5">
                  <Badge tone="turquoise">
                    مرحله {task.stage.toLocaleString("fa-IR")} — {STAGE_LABELS[task.stage]}
                  </Badge>
                  <span className="text-[12px] text-ink-soft">{formatDate(task.dueDate, "d MMM")}</span>
                  <span className="ms-auto text-[11.5px] text-ink-faint">
                    {task.attempts.toLocaleString("fa-IR")} تماس
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        <div className="flex items-center gap-2 text-[11.5px] text-ink-faint">
          <TrendingUp size={12} />
          ارزش سفارش‌های اخیر: {formatMoney(orderTotal, { compact: true })}
        </div>
      </PageBody>
    </>
  );
}

function Row({
  icon,
  label,
  children,
  mono,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-ink-faint">
        {icon}
        {label}
      </span>
      <span
        dir={mono ? "ltr" : undefined}
        className={`min-w-0 truncate text-left text-ink ${mono ? "font-mono text-[11.5px]" : ""}`}
      >
        {children}
      </span>
    </div>
  );
}

function Dots({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${value} از ۵`}>
      {[1, 2, 3, 4, 5].map((level) => (
        <span
          key={level}
          className={`h-1.5 w-1.5 rounded-full ${level <= value ? "bg-turquoise" : "bg-line"}`}
        />
      ))}
    </span>
  );
}
