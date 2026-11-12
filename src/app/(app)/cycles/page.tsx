import Link from "next/link";
import { Package } from "lucide-react";
import { db } from "@/server/db";
import { requireUser } from "@/server/auth";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Panel, PanelHeader, EmptyState } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { formatDate, isOverdue } from "@/lib/date";

export const metadata = { title: "چرخهٔ خرید" };
export const dynamic = "force-dynamic";

function formatStock(value: string) {
  return Number(value).toLocaleString("fa-IR", { maximumFractionDigits: 1 });
}

export default async function CyclesPage() {
  await requireUser();

  const cycles = await db.purchaseCycle.findMany({
    include: { customer: true, product: true },
    orderBy: [{ status: "asc" }, { expectedDate: "asc" }],
  });

  const groups = {
    overdue: cycles.filter((c) => c.status === "overdue"),
    active: cycles.filter((c) => c.status === "active"),
    learning: cycles.filter((c) => c.status === "learning"),
  };

  return (
    <>
      <PageHeader
        title="چرخهٔ خرید"
        description={`${cycles.length.toLocaleString(
          "fa-IR",
        )} ترکیب مشتری × محصول · ${groups.overdue.length.toLocaleString("fa-IR")} تأخیر`}
      />
      <PageBody className="flex flex-col gap-5">
        {(
          [
            ["overdue", "تأخیرخورده", "clay"],
            ["active", "فعال", "turquoise"],
            ["learning", "در حال یادگیری", "neutral"],
          ] as const
        ).map(([key, label, tone]) => {
          const rows = groups[key];
          return (
            <Panel key={key}>
              <PanelHeader
                title={label}
                subtitle={`${rows.length.toLocaleString("fa-IR")} مورد`}
                action={<Badge tone={tone}>{rows.length.toLocaleString("fa-IR")}</Badge>}
              />
              <div className="rule mx-5" />
              {rows.length === 0 ? (
                <EmptyState icon={<Package size={18} />} title="موردی نیست" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-right">
                    <thead>
                      <tr className="border-b border-line bg-surface-2/60">
                        {["مشتری", "محصول", "چرخه", "خرید بعدی", "موجودی تخمینی", "نمونه"].map((h) => (
                          <th key={h} className="px-4 py-2 text-[11px] font-medium text-ink-faint">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((cycle) => {
                        const overdue = isOverdue(cycle.expectedDate);
                        return (
                          <tr key={cycle.id} className="border-b border-line last:border-0">
                            <td className="px-4 py-2.5">
                              <Link
                                href={`/companies/${cycle.customerId}`}
                                className="text-[12.5px] text-ink hover:text-turquoise"
                              >
                                {cycle.customer.name}
                              </Link>
                            </td>
                            <td className="px-4 py-2.5 text-[12px] text-ink-soft">
                              {cycle.product.name}
                            </td>
                            <td className="tnum px-4 py-2.5 text-[12px] text-ink-soft">
                              {cycle.medianCycleDays?.toString() ?? "—"} روز
                            </td>
                            <td
                              className={`tnum px-4 py-2.5 text-[12px] ${overdue ? "text-clay" : "text-ink-soft"}`}
                            >
                              {formatDate(cycle.expectedDate, "d MMM yyyy")}
                            </td>
                            <td className="tnum px-4 py-2.5 text-[12px] text-ink-soft">
                              {cycle.status === "learning"
                                ? "—"
                                : Number(cycle.estimatedStock.toString()).toLocaleString("fa-IR", {
                                    maximumFractionDigits: 1,
                                  })}
                            </td>
                            <td className="tnum px-4 py-2.5 text-[11.5px] text-ink-faint">
                              {cycle.sampleSize.toLocaleString("fa-IR")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          );
        })}
      </PageBody>
    </>
  );
}
