import { db } from "@/server/db";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { CompaniesView, type CompanyRow } from "@/components/features/companies-view";

export const metadata = { title: "شرکت‌ها" };
export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await db.company.findMany({
    include: { _count: { select: { contacts: true, deals: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const rows: CompanyRow[] = companies.map((c) => ({
    id: c.id,
    name: c.name,
    industry: c.industry,
    city: c.city,
    domain: c.domain,
    phone: c.phone,
    contactCount: c._count.contacts,
    dealCount: c._count.deals,
  }));

  return (
    <>
      <PageHeader
        title="شرکت‌ها"
        description={`${companies.length.toLocaleString("fa-IR")} سازمان در پایگاه داده.`}
      />
      <PageBody>
        <CompaniesView rows={rows} />
      </PageBody>
    </>
  );
}
