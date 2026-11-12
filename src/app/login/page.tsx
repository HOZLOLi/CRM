import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { LoginForm } from "@/components/features/login-form";

export const metadata = { title: "ورود" };

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect("/dashboard");

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      {/* form side */}
      <div className="flex items-center justify-center px-6 py-12">
        <LoginForm />
      </div>

      {/* ledger side — the one place we spend boldness */}
      <div className="relative hidden overflow-hidden border-r border-line bg-surface lg:block">
        <div className="absolute inset-0 grid-paper opacity-70" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="max-w-md">
            <p className="text-[11px] font-medium tracking-wide text-turquoise">
              نسخه ۰٫۱ — پیش‌نمایش
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-[34px] leading-[1.25] text-ink">
              هر معامله یک داستان است.
              <br />
              <span className="text-ink-faint">فیروزه آن را مرتب نگه می‌دارد.</span>
            </h2>
            <p className="mt-5 max-w-sm text-[13.5px] leading-7 text-ink-soft">
              قیف فروش، مخاطبین، شرکت‌ها، وظایف و یک دستیار هوش مصنوعی که داده‌های خودت را
              می‌شناسد — همه در یک فضای کاری سبک و سریع.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[10px] border border-line bg-line">
            {[
              { value: "۱۰", label: "معامله فعال" },
              { value: "۸", label: "شرکت" },
              { value: "۷", label: "وظیفه باز" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface px-4 py-5">
                <p className="tnum font-[family-name:var(--font-display)] text-[26px] leading-none text-ink">
                  {stat.value}
                </p>
                <p className="mt-2 text-[11.5px] text-ink-faint">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
