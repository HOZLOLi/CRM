import { db } from "@/server/db";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { TasksView, type TaskRow } from "@/components/features/tasks-view";
import { isOverdue } from "@/lib/date";

export const metadata = { title: "وظایف" };
export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await db.task.findMany({
    include: { assignee: true, deal: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  const rows: TaskRow[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    dueDate: t.dueDate?.toISOString() ?? null,
    priority: t.priority,
    status: t.status,
    dealTitle: t.deal?.title ?? null,
    assigneeName: t.assignee?.name ?? null,
  }));

  const open = tasks.filter((t) => t.status === "open");
  const overdue = open.filter((t) => isOverdue(t.dueDate));

  return (
    <>
      <PageHeader
        title="وظایف"
        description={`${open.length.toLocaleString("fa-IR")} وظیفه باز${
          overdue.length ? `، ${overdue.length.toLocaleString("fa-IR")} مورد سررسید گذشته` : ""
        }.`}
      />
      <PageBody>
        <TasksView rows={rows} />
      </PageBody>
    </>
  );
}
