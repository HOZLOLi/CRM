import { db } from "@/server/db";
import { dealSchema } from "@/lib/validators";
import { guard, ok, fail, handleError, serialize } from "@/server/api/http";
import { dec } from "@/lib/money";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await guard();
  if (response) return response;
  const { id } = await params;

  try {
    const body = await request.json();
    const data = dealSchema.partial().parse(body);

    const current = await db.deal.findUnique({ where: { id } });
    if (!current) return fail("معامله پیدا نشد", 404);

    const stageChanged = data.stageId && data.stageId !== current.stageId;
    const stage = data.stageId ? await db.stage.findUnique({ where: { id: data.stageId } }) : null;

    const deal = await db.deal.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.companyId !== undefined && { companyId: data.companyId || null }),
        ...(data.contactId !== undefined && { contactId: data.contactId || null }),
        ...(data.stageId !== undefined && { stageId: data.stageId || null }),
        ...(data.amount !== undefined && { amount: dec(data.amount) }),
        ...(data.probability !== undefined && { probability: data.probability }),
        ...(stage && { probability: stage.probability }),
        ...(data.expectedCloseDate !== undefined && {
          expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        }),
        ...(body.status !== undefined && {
          status: body.status,
          closedAt: body.status === "open" ? null : new Date(),
        }),
      },
    });

    if (stageChanged && stage) {
      await db.activity.create({
        data: {
          type: "stage_change",
          subject: `انتقال به مرحله «${stage.name}»`,
          dealId: id,
          userId: user!.id,
        },
      });
    }

    return ok(serialize(deal));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await guard();
  if (response) return response;
  const { id } = await params;
  try {
    await db.deal.delete({ where: { id } });
    return ok({ ok: true });
  } catch {
    return fail("حذف معامله ممکن نشد", 400);
  }
}
