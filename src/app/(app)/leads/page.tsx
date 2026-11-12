import { db } from "@/server/db";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { LeadsView, type LeadRow } from "@/components/features/leads-view";

export const metadata = { title: "سرنخ‌ها" };
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await db.lead.findMany({
    include: { owner: true },
    orderBy: { updatedAt: "desc" },
  });

  const rows: LeadRow[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    source: l.source,
    status: l.status,
    score: l.score,
    ownerName: l.owner?.name ?? null,
  }));

  const qualified = leads.filter((l) => l.status === "qualified").length;

  return (
    <>
      <PageHeader
        title="سرنخ‌ها"
        description={`${leads.length.toLocaleString("fa-IR")} سرنخ، ${qualified.toLocaleString(
          "fa-IR",
        )} واجد شرایط.`}
      />
      <PageBody>
        <LeadsView rows={rows} />
      </PageBody>
    </>
  );
}
