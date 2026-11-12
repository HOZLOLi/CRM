import { db } from "@/server/db";
import { companySchema } from "@/lib/validators";
import { guard, ok, fail, handleError, serialize } from "@/server/api/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await guard();
  if (response) return response;
  const { id } = await params;

  try {
    const data = companySchema.partial().parse(await request.json());
    const company = await db.company.update({ where: { id }, data });
    await db.auditLog.create({
      data: {
        entityType: "company",
        entityId: id,
        action: "update",
        diff: JSON.stringify(data),
        userId: user!.id,
      },
    });
    return ok(serialize(company));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await guard();
  if (response) return response;
  const { id } = await params;

  try {
    await db.company.delete({ where: { id } });
    await db.auditLog.create({
      data: { entityType: "company", entityId: id, action: "delete", userId: user!.id },
    });
    return ok({ ok: true });
  } catch {
    return fail("حذف شرکت ممکن نشد", 400);
  }
}
