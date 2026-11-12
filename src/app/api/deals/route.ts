import { db } from "@/server/db";
import { dealSchema } from "@/lib/validators";
import { guard, ok, handleError, serialize } from "@/server/api/http";
import { dec } from "@/lib/money";

export async function GET() {
  const { response } = await guard();
  if (response) return response;
  const deals = await db.deal.findMany({
    include: { company: true, contact: true, stage: true, owner: true },
    orderBy: { updatedAt: "desc" },
  });
  return ok(serialize(deals));
}

export async function POST(request: Request) {
  const { user, response } = await guard();
  if (response) return response;
  try {
    const data = dealSchema.parse(await request.json());
    const pipeline = await db.pipeline.findFirst({ where: { isDefault: true } });
    const stage =
      data.stageId ??
      (await db.stage.findFirst({ where: { pipelineId: pipeline?.id }, orderBy: { order: "asc" } }))?.id;

    const deal = await db.deal.create({
      data: {
        title: data.title,
        companyId: data.companyId ?? null,
        contactId: data.contactId ?? null,
        pipelineId: pipeline?.id ?? null,
        stageId: stage ?? null,
        amount: dec(data.amount),
        currency: data.currency,
        probability: data.probability,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        ownerId: data.ownerId ?? user!.id,
      },
    });
    return ok(serialize(deal), 201);
  } catch (error) {
    return handleError(error);
  }
}
