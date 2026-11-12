import { db } from "@/server/db";
import { requireUser } from "@/server/auth";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { MODULES } from "@/modules/registry";
import { isAiConfigured, getModelId } from "@/server/ai/provider";
import { getSettings } from "@/server/settings";
import { SettingsEditor } from "@/components/features/settings-editor";
import { AiInsight } from "@/components/features/ai-insight";
import { formatDate } from "@/lib/date";

export const metadata = { title: "تنظیمات" };
export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  admin: "مدیر سیستم",
  manager: "مدیر فروش",
  rep: "کارشناس فروش",
};

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getSettings();
  const [users, counts] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "asc" } }),
    Promise.all([
      db.company.count(),
      db.contact.count(),
      db.deal.count(),
      db.task.count(),
      db.activity.count(),
    ]),
  ]);

  const [companies, contacts, deals, tasks, activities] = counts;
  const aiReady = isAiConfigured();

  return (
    <>
      <PageHeader title="تنظیمات" description="حساب، تیم، ماژول‌ها و پیکربندی هوش مصنوعی." />

      <PageBody className="flex flex-col gap-5">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* profile */}
          <Panel>
            <PanelHeader title="حساب من" subtitle="اطلاعات کاربری فعلی" />
            <div className="rule mx-5" />
            <div className="flex items-center gap-3 px-5 py-5">
              <Avatar name={user.name} hue={user.avatarHue} size={48} />
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-ink">{user.name}</p>
                <p dir="ltr" className="text-left text-[12px] text-ink-faint">
                  {user.email}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge tone="turquoise">{ROLE_LABEL[user.role] ?? user.role}</Badge>
                  {user.title ? <Badge tone="neutral">{user.title}</Badge> : null}
                </div>
              </div>
            </div>
          </Panel>

          {/* ai */}
          <Panel>
            <PanelHeader
              title="هوش مصنوعی"
              subtitle="ارائه‌دهنده سازگار با OpenAI"
              action={
                <Badge tone={aiReady ? "moss" : "saffron"}>{aiReady ? "فعال" : "غیرفعال"}</Badge>
              }
            />
            <div className="rule mx-5" />
            <div className="flex flex-col gap-2.5 px-5 py-5 text-[12.5px]">
              <Row label="مدل" value={getModelId()} mono />
              <Row label="آدرس پایه" value={process.env.AI_BASE_URL ?? "—"} mono />
              <Row
                label="کلید API"
                value={process.env.AI_API_KEY ? "تنظیم شده" : "تنظیم نشده"}
              />
              <p className="mt-1 leading-6 text-ink-faint">
                برای تغییر، فایل <code dir="ltr">.env</code> را ویرایش کنید. هر ارائه‌دهنده‌ای که
                API سازگار با OpenAI دارد پشتیبانی می‌شود: OpenRouter، OpenAI، Ollama، LM Studio.
              </p>
            </div>
          </Panel>
        </div>

        {/* engine settings */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-[16px] font-semibold text-ink">موتور فروش دوره‌ای</h2>
            <Badge tone="turquoise">قابل ویرایش</Badge>
          </div>
          <p className="mb-4 max-w-2xl text-[12.5px] leading-6 text-ink-soft">
            وزن‌ها، آستانه‌ها، ماتریس تصمیم و متن‌ها همه از همین‌جا کنترل می‌شوند.
            تغییرات بلافاصله در کارتابل و ارزیابی مشتریان اثر می‌گذارد.
          </p>
          <AiInsight
            scope="settings"
            title="راهنمای تنظیمات"
            configured={aiReady}
            suggestions={[
              "این وزن‌ها چه اثری روی کارتابل می‌گذارند؟",
              "اگر آستانهٔ «داغ» را از ۷۴ به ۶۵ کم کنم چه می‌شود؟",
              "پیشنهاد می‌کنی چه چیزی را در ماتریس تغییر دهم؟",
            ]}
            className="mb-4"
          />
          <SettingsEditor initial={settings} />
        </div>

        {/* team */}
        <Panel>
          <PanelHeader title="تیم" subtitle={`${users.length.toLocaleString("fa-IR")} کاربر`} />
          <div className="rule mx-5" />
          <ul className="divide-y divide-line">
            {users.map((member) => (
              <li key={member.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={member.name} hue={member.avatarHue} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{member.name}</p>
                  <p dir="ltr" className="truncate text-left text-[11.5px] text-ink-faint">
                    {member.email}
                  </p>
                </div>
                <Badge tone={member.role === "admin" ? "saffron" : "neutral"}>
                  {ROLE_LABEL[member.role] ?? member.role}
                </Badge>
                <span className="hidden text-[11.5px] text-ink-faint sm:block">
                  {formatDate(member.createdAt, "d MMM yyyy")}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* modules */}
        <Panel>
          <PanelHeader
            title="ماژول‌ها"
            subtitle="فعال یا غیرفعال کردن بخش‌ها از src/modules/registry.ts"
          />
          <div className="rule mx-5" />
          <ul className="divide-y divide-line">
            {MODULES.map((module) => (
              <li key={module.id} className="flex items-center gap-3 px-5 py-3">
                <module.icon size={16} className="text-ink-faint" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-ink">{module.label}</p>
                  <p className="text-[11.5px] text-ink-faint">{module.description}</p>
                </div>
                <Badge tone={module.enabled ? "moss" : "neutral"}>
                  {module.enabled ? "فعال" : "خاموش"}
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>

        {/* data */}
        <Panel>
          <PanelHeader title="داده‌ها" subtitle="حجم فعلی پایگاه داده" />
          <div className="rule mx-5" />
          <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-5">
            {[
              ["شرکت", companies],
              ["مخاطب", contacts],
              ["معامله", deals],
              ["وظیفه", tasks],
              ["فعالیت", activities],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-surface px-4 py-4">
                <p className="tnum text-[19px] font-medium leading-none text-ink">
                  {Number(value).toLocaleString("fa-IR")}
                </p>
                <p className="mt-1.5 text-[11.5px] text-ink-faint">{label}</p>
              </div>
            ))}
          </div>
        </Panel>
      </PageBody>
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-ink-faint">{label}</span>
      <span
        dir={mono ? "ltr" : undefined}
        className={`min-w-0 truncate text-left text-ink ${mono ? "font-mono text-[11.5px]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
