import { db } from "@/server/db";
import { taskSchema } from "@/lib/validators";
import { guard, ok, fail, handleError, serialize } from "@/server/api/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await guard();
  if (response) return response;
  const { id } = await params;

  try {
    const data = taskSchema.partial().parse(await request.json());
    const task = await db.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.status !== undefined && {
          status: data.status,
          completedAt: data.status === "done" ? new Date() : null,
        }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId || null }),
      },
    });
    return ok(serialize(task));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await guard();
  if (response) return response;
  const { id } = await params;

  try {
    await db.task.delete({ where: { id } });
    return ok({ ok: true });
  } catch {
    return fail("حذف وظیفه ممکن نشد", 400);
  }
}
