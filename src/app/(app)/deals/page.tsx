import { db } from "@/server/db";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { DealsBoard, type BoardDeal, type BoardStage } from "@/components/features/deals-board";
import { formatMoney, sum } from "@/lib/money";

export const metadata = { title: "قیف فروش" };
export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const [stages, deals, companies] = await Promise.all([
    db.stage.findMany({ orderBy: { order: "asc" } }),
    db.deal.findMany({
      where: { status: "open" },
      include: { company: true, owner: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const boardStages: BoardStage[] = stages.map((s) => ({
    id: s.id,
    name: s.name,
    order: s.order,
    probability: s.probability,
    tone: s.tone,
  }));

  const boardDeals: BoardDeal[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    amount: d.amount.toString(),
    probability: d.probability,
    status: d.status,
    expectedCloseDate: d.expectedCloseDate?.toISOString() ?? null,
    companyName: d.company?.name ?? null,
    ownerName: d.owner?.name ?? null,
    ownerHue: d.owner?.avatarHue ?? 180,
    stageId: d.stageId,
  }));

  const total = sum(deals.map((d) => d.amount));

  return (
    <>
      <PageHeader
        title="قیف فروش"
        description={`${deals.length.toLocaleString("fa-IR")} معامله باز به ارزش ${formatMoney(total, {
          compact: true,
        })}`}
      />
      <PageBody>
        <DealsBoard stages={boardStages} initialDeals={boardDeals} companies={companies} />
      </PageBody>
    </>
  );
}
