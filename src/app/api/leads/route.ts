import { db } from "@/server/db";
import { leadSchema } from "@/lib/validators";
import { guard, ok, handleError, serialize } from "@/server/api/http";

export async function GET() {
  const { response } = await guard();
  if (response) return response;
  const leads = await db.lead.findMany({ include: { owner: true }, orderBy: { updatedAt: "desc" } });
  return ok(serialize(leads));
}

export async function POST(request: Request) {
  const { user, response } = await guard();
  if (response) return response;
  try {
    const data = leadSchema.parse(await request.json());
    const lead = await db.lead.create({
      data: { ...data, email: data.email || null, ownerId: data.ownerId ?? user!.id },
    });
    return ok(serialize(lead), 201);
  } catch (error) {
    return handleError(error);
  }
}
