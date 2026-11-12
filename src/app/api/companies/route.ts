import { db } from "@/server/db";
import { companySchema } from "@/lib/validators";
import { guard, ok, handleError, serialize } from "@/server/api/http";

export async function GET() {
  const { response } = await guard();
  if (response) return response;

  const companies = await db.company.findMany({
    include: { owner: true, _count: { select: { contacts: true, deals: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return ok(serialize(companies));
}

export async function POST(request: Request) {
  const { user, response } = await guard();
  if (response) return response;

  try {
    const data = companySchema.parse(await request.json());
    const company = await db.company.create({
      data: { ...data, ownerId: data.ownerId ?? user!.id },
    });
    await db.auditLog.create({
      data: { entityType: "company", entityId: company.id, action: "create", userId: user!.id },
    });
    return ok(serialize(company), 201);
  } catch (error) {
    return handleError(error);
  }
}
