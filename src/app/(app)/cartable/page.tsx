import { requireUser } from "@/server/auth";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Cartable } from "@/components/features/cartable";
import { buildCartable } from "@/server/sales-engine";

export const metadata = { title: "کارتابل امروز" };
export const dynamic = "force-dynamic";

export default async function CartablePage() {
  const user = await requireUser();
  const cards = await buildCartable();

  const p1 = cards.filter((c) => c.priority === "P1").length;
  const overdue = cards.filter((c) => (c.daysUntil ?? 1) <= 0).length;

  return (
    <>
      <PageHeader
        title="کارتابل امروز"
        description={
          cards.length === 0
            ? "هیچ پیگیری‌ای برای امروز نیست."
            : `${cards.length.toLocaleString("fa-IR")} مشتری برای پیگیری${
                p1 ? ` · ${p1.toLocaleString("fa-IR")} مورد اولویت ۱` : ""
              }${overdue ? ` · ${overdue.toLocaleString("fa-IR")} مورد تأخیر` : ""}`
        }
      />
      <PageBody>
        <Cartable initial={cards} />
      </PageBody>
    </>
  );
}
