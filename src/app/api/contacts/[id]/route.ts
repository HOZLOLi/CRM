import { db } from "@/server/db";
import { contactSchema } from "@/lib/validators";
import { guard, ok, fail, handleError, serialize } from "@/server/api/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await guard();
  if (response) return response;
  const { id } = await params;

  try {
    const data = contactSchema.partial().parse(await request.json());
    const contact = await db.contact.update({
      where: { id },
      data: { ...data, email: data.email || null },
    });
    await db.auditLog.create({
      data: { entityType: "contact", entityId: id, action: "update", userId: user!.id },
    });
    return ok(serialize(contact));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await guard();
  if (response) return response;
  const { id } = await params;

  try {
    await db.contact.delete({ where: { id } });
    await db.auditLog.create({
      data: { entityType: "contact", entityId: id, action: "delete", userId: user!.id },
    });
    return ok({ ok: true });
  } catch {
    return fail("حذف مخاطب ممکن نشد", 400);
  }
}
