import { db } from "@/server/db";
import { contactSchema } from "@/lib/validators";
import { guard, ok, handleError, serialize } from "@/server/api/http";

export async function GET() {
  const { response } = await guard();
  if (response) return response;

  const contacts = await db.contact.findMany({
    include: { company: true, owner: true },
    orderBy: { updatedAt: "desc" },
  });
  return ok(serialize(contacts));
}

export async function POST(request: Request) {
  const { user, response } = await guard();
  if (response) return response;

  try {
    const data = contactSchema.parse(await request.json());
    const contact = await db.contact.create({
      data: {
        ...data,
        email: data.email || null,
        ownerId: data.ownerId ?? user!.id,
      },
    });
    await db.auditLog.create({
      data: { entityType: "contact", entityId: contact.id, action: "create", userId: user!.id },
    });
    return ok(serialize(contact), 201);
  } catch (error) {
    return handleError(error);
  }
}
