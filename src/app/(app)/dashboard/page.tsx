import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  CircleDollarSign,
  Target,
  TrendingUp,
  CheckCircle2,
  Phone,
  Mail,
  Users,
  StickyNote,
  GitBranch,
} from "lucide-react";
import { db } from "@/server/db";
import { requireUser } from "@/server/auth";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Stat, StatGrid } from "@/components/ui/stat";
import { Panel, PanelHeader, EmptyState } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatMoney, dec, sum, weightedValue } from "@/lib/money";
import { formatDate, formatRelative, isOverdue } from "@/lib/date";
import { cn } from "@/lib/utils";

export const metadata = { title: "داشبورد" };
export const dynamic = "force-dynamic";

const ACTIVITY_ICON = {
  call: Phone,
  meeting: Users,
  email: Mail,
  note: StickyNote,
  stage_change: GitBranch,
  system: CheckCircle2,
} as const;

const PRIORITY_TONE = {
  urgent: "clay",
  high: "saffron",
  normal: "neutral",
  low: "neutral",
} as const;

const PRIORITY_LABEL = {
  urgent: "فوری",
  high: "بالا",
  normal: "معمولی",
  low: "کم",
} as const;

export default async function DashboardPage() {
  const user = await requireUser();

  const [deals, stages, tasks, activities, counts] = await Promise.all([
    db.deal.findMany({
      include: { company: true, owner: true, stage: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.stage.findMany({ orderBy: { order: "asc" } }),
    db.task.findMany({
      where: { status: "open" },
      include: { deal: true, assignee: true },
      orderBy: [{ dueDate: "asc" }],
      take: 6,
    }),
    db.activity.findMany({
      include: { user: true, deal: true },
      orderBy: { occurredAt: "desc" },
      take: 7,
    }),
    Promise.all([
      db.company.count(),
      db.contact.count(),
      db.lead.count({ where: { status: { in: ["new", "contacted", "qualified"] } } }),
    ]),
  ]);

  const [companyCount, contactCount, openLeadCount] = counts;

  const openDeals = deals.filter((d) => d.status === "open");
  const wonDeals = deals.filter((d) => d.status === "won");
  const lostDeals = deals.filter((d) => d.status === "lost");

  const pipelineValue = sum(openDeals.map((d) => d.amount));
  const weighted = sum(openDeals.map((d) => weightedValue(d.amount, d.probability)));
  const wonValue = sum(wonDeals.map((d) => d.amount));

  const closedCount = wonDeals.length + lostDeals.length;
  const winRate = closedCount === 0 ? 0 : Math.round((wonDeals.length / closedCount) * 100);

  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate));

  const byStage = stages.map((stage) => {
    const stageDeals = openDeals.filter((d) => d.stageId === stage.id);
    return {
      stage,
      count: stageDeals.length,
      value: sum(stageDeals.map((d) => d.amount)),
    };
  });
  const maxStageValue = Math.max(1, ...byStage.map((s) => s.value.toNumber()));

  const topDeals = [...openDeals]
    .sort((a, b) => dec(b.amount).comparedTo(dec(a.amount)))
    .slice(0, 5);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "صبح بخیر";
    if (hour < 17) return "وقت بخیر";
    return "شب بخیر";
  })();

  return (
    <>
      <PageHeader
        title={`${greeting}، ${user.name.split(" ")[0]}`}
        description={`${formatDate(new Date(), "EEEE d MMMM yyyy")} — ${openDeals.length} معامله باز در قیف فروش.`}
        actions={
          <Link
            href="/deals"
            className="inline-flex h-9 items-center gap-1.5 rounded-[7px] border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:border-line-strong"
          >
            قیف فروش
            <ArrowUpRight size={15} />
          </Link>
        }
      />

      <PageBody className="flex flex-col gap-5">
        <StatGrid>
          <Stat
            label="ارزش قیف فروش"
            value={formatMoney(pipelineValue, { compact: true })}
            hint={`${openDeals.length} معامله`}
          />
          <Stat
            label="ارزش وزنی"
            value={formatMoney(weighted, { compact: true })}
            hint="بر اساس احتمال هر مرحله"
          />
          <Stat
            label="نرخ برد"
            value={`${winRate.toLocaleString("fa-IR")}٪`}
            hint={`${wonDeals.length} برده از ${closedCount} بسته‌شده`}
          />
          <Stat
            label="وظایف سررسیدشده"
            value={overdueTasks.length.toLocaleString("fa-IR")}
            hint={overdueTasks.length > 0 ? "نیاز به پیگیری" : "همه چیز مرتب است"}
          />
        </StatGrid>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          {/* ------------------------------------------------ pipeline */}
          <Panel>
            <PanelHeader
              title="قیف فروش"
              subtitle="ارزش معاملات باز در هر مرحله"
              action={
                <Link
                  href="/deals"
                  className="text-[12px] font-medium text-turquoise hover:underline"
                >
                  مشاهده همه
                </Link>
              }
            />
            <div className="rule mx-5" />
            <div className="flex flex-col gap-3.5 px-5 py-5">
              {byStage.map(({ stage, count, value }) => {
                const width = Math.max(2, (value.toNumber() / maxStageValue) * 100);
                return (
                  <div key={stage.id} className="group">
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="text-[12.5px] font-medium text-ink">{stage.name}</span>
                      <span className="tnum text-[12px] text-ink-faint">
                        {formatMoney(value, { compact: true })}
                        <span className="mx-1.5 text-line-strong">·</span>
                        {count.toLocaleString("fa-IR")}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-[var(--dur-4)] ease-[var(--ease-out-expo)]",
                          stage.tone === "saffron"
                            ? "bg-saffron"
                            : stage.tone === "moss"
                              ? "bg-moss"
                              : "bg-turquoise",
                        )}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* ------------------------------------------------ tasks */}
          <Panel>
            <PanelHeader
              title="کارهای امروز"
              subtitle={`${tasks.length} وظیفه باز`}
              action={
                <Link href="/tasks" className="text-[12px] font-medium text-turquoise hover:underline">
                  همه
                </Link>
              }
            />
            <div className="rule mx-5" />
            {tasks.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 size={20} />}
                title="وظیفه‌ای باقی نمانده"
                description="همه کارهای امروز انجام شده است."
              />
            ) : (
              <ul className="divide-y divide-line">
                {tasks.map((task) => {
                  const overdue = isOverdue(task.dueDate);
                  return (
                    <li key={task.id} className="flex items-start gap-3 px-5 py-3">
                      <span
                        className={cn(
                          "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                          overdue ? "bg-clay" : "bg-line-strong",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] text-ink">{task.title}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-faint">
                          <CalendarClock size={11} />
                          {formatDate(task.dueDate, "d MMM")}
                          {overdue ? <span className="text-clay">· سررسید گذشته</span> : null}
                        </p>
                      </div>
                      <Badge tone={PRIORITY_TONE[task.priority as keyof typeof PRIORITY_TONE] ?? "neutral"}>
                        {PRIORITY_LABEL[task.priority as keyof typeof PRIORITY_LABEL] ?? task.priority}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.35fr]">
          {/* ------------------------------------------------ top deals */}
          <Panel>
            <PanelHeader title="بزرگ‌ترین معاملات" subtitle="بر اساس مبلغ" />
            <div className="rule mx-5" />
            <ul className="divide-y divide-line">
              {topDeals.map((deal) => (
                <li key={deal.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">{deal.title}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-ink-faint">
                      {deal.company?.name ?? "بدون شرکت"}
                      {deal.stage ? ` · ${deal.stage.name}` : ""}
                    </p>
                  </div>
                  <span className="tnum shrink-0 text-[12.5px] font-medium text-ink">
                    {formatMoney(deal.amount, { compact: true })}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* ------------------------------------------------ activity */}
          <Panel>
            <PanelHeader title="آخرین فعالیت‌ها" subtitle="رویدادهای اخیر تیم" />
            <div className="rule mx-5" />
            <ul className="divide-y divide-line">
              {activities.map((activity) => {
                const Icon =
                  ACTIVITY_ICON[activity.type as keyof typeof ACTIVITY_ICON] ?? CheckCircle2;
                return (
                  <li key={activity.id} className="flex items-start gap-3 px-5 py-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-faint">
                      <Icon size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] text-ink">{activity.subject}</p>
                      <p className="mt-0.5 truncate text-[11.5px] text-ink-faint">
                        {activity.deal?.title ?? "—"}
                        <span className="mx-1.5 text-line-strong">·</span>
                        {formatRelative(activity.occurredAt)}
                      </p>
                    </div>
                    {activity.user ? (
                      <Avatar name={activity.user.name} hue={activity.user.avatarHue} size={24} />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        {/* ------------------------------------------------ counts strip */}
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[10px] border border-line bg-line">
          {[
            { icon: CircleDollarSign, label: "شرکت‌ها", value: companyCount, href: "/companies" },
            { icon: Users, label: "مخاطبین", value: contactCount, href: "/contacts" },
            { icon: Target, label: "سرنخ‌های فعال", value: openLeadCount, href: "/leads" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 bg-surface px-4 py-4 transition-colors hover:bg-surface-2"
            >
              <item.icon size={16} className="text-ink-faint" />
              <div>
                <p className="tnum text-[17px] font-medium leading-none text-ink">
                  {item.value.toLocaleString("fa-IR")}
                </p>
                <p className="mt-1 text-[11.5px] text-ink-faint">{item.label}</p>
              </div>
              <TrendingUp
                size={14}
                className="mr-auto text-line-strong transition-colors group-hover:text-turquoise"
              />
            </Link>
          ))}
        </div>
      </PageBody>
    </>
  );
}
