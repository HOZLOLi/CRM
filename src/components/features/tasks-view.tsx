"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, CalendarClock, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, isOverdue } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Field, Select, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/panel";

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  dealTitle: string | null;
  assigneeName: string | null;
}

const PRIORITY: Record<
  string,
  { label: string; tone: "neutral" | "turquoise" | "saffron" | "clay" | "moss" }
> = {
  urgent: { label: "فوری", tone: "clay" },
  high: { label: "بالا", tone: "saffron" },
  normal: { label: "معمولی", tone: "neutral" },
  low: { label: "کم", tone: "neutral" },
};

const EASE = [0.16, 1, 0.3, 1] as const;

export function TasksView({ rows }: { rows: TaskRow[] }) {
  const [data, setData] = React.useState(rows);
  const [creating, setCreating] = React.useState(false);
  const [filter, setFilter] = React.useState<"open" | "done" | "all">("open");

  const visible = data.filter((t) =>
    filter === "all" ? true : filter === "open" ? t.status === "open" : t.status === "done",
  );

  async function toggle(task: TaskRow) {
    const next = task.status === "done" ? "open" : "done";
    setData((current) => current.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => {});
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-[8px] border border-line bg-surface p-0.5">
          {(
            [
              ["open", "باز"],
              ["done", "انجام‌شده"],
              ["all", "همه"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-[6px] px-3 py-1.5 text-[12.5px] transition-colors duration-[var(--dur-2)]",
                filter === value
                  ? "bg-turquoise-soft font-medium text-turquoise"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <Button className="mr-auto" onClick={() => setCreating(true)}>
          <Plus size={15} />
          وظیفه جدید
        </Button>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-line bg-surface">
        {visible.length === 0 ? (
          <EmptyState
            icon={<Check size={20} />}
            title="وظیفه‌ای نیست"
            description="برای پیگیری مشتری‌ها یک وظیفه بسازید."
          />
        ) : (
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {visible.map((task) => {
                const done = task.status === "done";
                const overdue = !done && isOverdue(task.dueDate);
                const priority = PRIORITY[task.priority] ?? PRIORITY.normal;

                return (
                  <motion.li
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="flex items-start gap-3 px-4 py-3"
                  >
                    <button
                      onClick={() => toggle(task)}
                      aria-label={done ? "بازگرداندن" : "انجام شد"}
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-[var(--dur-2)]",
                        done
                          ? "border-moss bg-moss text-white"
                          : "border-line-strong text-transparent hover:border-turquoise hover:text-turquoise",
                      )}
                    >
                      <Check size={12} strokeWidth={3} />
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-[13.5px] leading-5",
                          done ? "text-ink-faint line-through" : "text-ink",
                        )}
                      >
                        {task.title}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-ink-faint">
                        {task.dueDate ? (
                          <span className={cn("flex items-center gap-1", overdue && "text-clay")}>
                            <CalendarClock size={11} />
                            {formatDate(task.dueDate, "d MMM")}
                            {overdue ? " · سررسید گذشته" : ""}
                          </span>
                        ) : null}
                        {task.dealTitle ? <span>· {task.dealTitle}</span> : null}
                        {task.assigneeName ? <span>· {task.assigneeName}</span> : null}
                      </p>
                    </div>

                    {!done ? <Badge tone={priority.tone}>{priority.label}</Badge> : null}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <AnimatePresence>
        {creating && (
          <NewTaskDialog
            onClose={() => setCreating(false)}
            onCreated={(task) => {
              setData((current) => [task, ...current]);
              setCreating(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NewTaskDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (task: TaskRow) => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      dueDate: String(form.get("dueDate") ?? ""),
      priority: String(form.get("priority") ?? "normal"),
    };

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ثبت ناموفق بود");
        setPending(false);
        return;
      }
      onCreated({
        id: data.id,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        status: data.status,
        dealTitle: null,
        assigneeName: null,
      });
    } catch {
      setError("ارتباط با سرور برقرار نشد");
      setPending(false);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px]"
      />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.24, ease: EASE }}
        role="dialog"
        aria-modal="true"
        aria-label="وظیفه جدید"
        className="fixed inset-x-3 top-[10vh] z-50 mx-auto max-h-[80vh] w-auto max-w-[440px] overflow-y-auto rounded-[14px] border border-line bg-surface p-5 shadow-[var(--shadow-sheet)] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-[16px] font-semibold text-ink">وظیفه جدید</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-faint hover:bg-surface-2"
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <Field label="عنوان">
            <Input name="title" required autoFocus placeholder="مثلاً تماس پیگیری با مشتری" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="سررسید">
              <Input name="dueDate" type="date" dir="ltr" className="text-left" />
            </Field>
            <Field label="اولویت">
              <Select name="priority" defaultValue="normal">
                {Object.entries(PRIORITY).map(([value, p]) => (
                  <option key={value} value={value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="توضیح">
            <Textarea name="description" />
          </Field>

          {error ? (
            <p className="rounded-[7px] bg-clay-soft px-3 py-2 text-[12.5px] text-clay" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "در حال ثبت…" : "ثبت"}
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
