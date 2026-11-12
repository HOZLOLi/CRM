import { db } from "@/server/db";
import { leadSchema } from "@/lib/validators";
import { guard, ok, fail, handleError, serialize } from "@/server/api/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await guard();
  if (response) return response;
  const { id } = await params;
  try {
    const data = leadSchema.partial().parse(await request.json());
    const lead = await db.lead.update({ where: { id }, data: { ...data, email: data.email || null } });
    return ok(serialize(lead));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await guard();
  if (response) return response;
  const { id } = await params;
  try {
    await db.lead.delete({ where: { id } });
    return ok({ ok: true });
  } catch {
    return fail("حذف سرنخ ممکن نشد", 400);
  }
}
