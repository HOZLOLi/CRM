import { db } from "@/server/db";
import { taskSchema } from "@/lib/validators";
import { guard, ok, handleError, serialize } from "@/server/api/http";

export async function GET() {
  const { response } = await guard();
  if (response) return response;
  const tasks = await db.task.findMany({
    include: { assignee: true, deal: true, contact: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });
  return ok(serialize(tasks));
}

export async function POST(request: Request) {
  const { user, response } = await guard();
  if (response) return response;
  try {
    const data = taskSchema.parse(await request.json());
    const task = await db.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority,
        status: data.status,
        assigneeId: data.assigneeId ?? user!.id,
        dealId: data.dealId ?? null,
        contactId: data.contactId ?? null,
      },
    });
    return ok(serialize(task), 201);
  } catch (error) {
    return handleError(error);
  }
}
