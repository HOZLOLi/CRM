import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "بدون اتصال" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-ink-faint">
        <WifiOff size={24} />
      </div>
      <div>
        <h1 className="text-[22px] text-ink">اتصال قطع است</h1>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-6 text-ink-soft">
          فیروزه به سرور مغازه دسترسی ندارد. اتصال شبکه یا روشن بودن سرور را بررسی کنید.
          صفحه‌هایی که قبلاً باز کرده‌اید از حافظه نمایش داده می‌شوند.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center rounded-[8px] bg-turquoise px-4 text-[13px] font-medium text-white"
      >
        تلاش دوباره
      </Link>
    </div>
  );
}
