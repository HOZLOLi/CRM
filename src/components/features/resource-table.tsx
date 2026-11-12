"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Search, X, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/panel";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "textarea" | "select" | "date";
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
  full?: boolean;
  defaultValue?: string;
}

export interface ColumnDef<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  /** Hidden below md. */
  compact?: boolean;
}

export interface ResourceTableProps<T extends { id: string }> {
  rows: T[];
  columns: ColumnDef<T>[];
  searchKeys: (keyof T)[];
  searchPlaceholder?: string;
  createFields?: FieldDef[];
  createEndpoint?: string;
  createLabel?: string;
  emptyTitle: string;
  emptyDescription?: string;
  /** Called with the created record so the parent can prepend it. */
  onCreated?: (row: T) => void;
  toolbar?: React.ReactNode;
}

export function ResourceTable<T extends { id: string }>({
  rows,
  columns,
  searchKeys,
  searchPlaceholder = "جست‌وجو…",
  createFields,
  createEndpoint,
  createLabel = "افزودن",
  emptyTitle,
  emptyDescription,
  onCreated,
  toolbar,
}: ResourceTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)),
    );
  }, [rows, query, searchKeys]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="pr-9"
            aria-label="جست‌وجو"
          />
        </div>
        {toolbar}
        {createFields && createEndpoint ? (
          <Button onClick={() => setCreating(true)} className="shrink-0">
            <Plus size={15} />
            {createLabel}
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-line bg-surface">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Inbox size={20} />}
            title={query ? "نتیجه‌ای پیدا نشد" : emptyTitle}
            description={query ? "عبارت دیگری را امتحان کنید." : emptyDescription}
          />
        ) : (
          <>
            {/* desktop table */}
            <table className="hidden w-full text-right md:table">
              <thead>
                <tr className="border-b border-line bg-surface-2/60">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        "px-4 py-2.5 text-[11.5px] font-medium text-ink-faint",
                        col.className,
                      )}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 transition-colors hover:bg-surface-2/50"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-4 py-3 text-[13px] text-ink", col.className)}>
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {filtered.map((row) => (
                <li key={row.id} className="px-4 py-3">
                  <div className="flex flex-col gap-1.5">
                    {columns
                      .filter((c) => !c.compact)
                      .map((col, index) => (
                        <div
                          key={col.key}
                          className={cn(
                            "flex items-baseline justify-between gap-3",
                            index === 0 && "text-[13.5px] font-medium text-ink",
                          )}
                        >
                          {index !== 0 && (
                            <span className="shrink-0 text-[11px] text-ink-faint">{col.label}</span>
                          )}
                          <span
                            className={cn(
                              "min-w-0 text-left",
                              index === 0 ? "text-right" : "text-[12.5px] text-ink-soft",
                            )}
                          >
                            {col.render(row)}
                          </span>
                        </div>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <p className="text-[11.5px] text-ink-faint">
        {filtered.length.toLocaleString("fa-IR")} از {rows.length.toLocaleString("fa-IR")} رکورد
      </p>

      <AnimatePresence>
        {creating && createFields && createEndpoint ? (
          <CreateDialog
            fields={createFields}
            endpoint={createEndpoint}
            title={createLabel}
            onClose={() => setCreating(false)}
            onCreated={(row) => {
              onCreated?.(row as T);
              setCreating(false);
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ dialog */

function CreateDialog({
  fields,
  endpoint,
  title,
  onClose,
  onCreated,
}: {
  fields: FieldDef[];
  endpoint: string;
  title: string;
  onClose: () => void;
  onCreated: (row: unknown) => void;
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
    const payload: Record<string, string> = {};
    for (const field of fields) {
      payload[field.name] = String(form.get(field.name) ?? "");
    }

    try {
      const res = await fetch(endpoint, {
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
      onCreated(data);
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
        aria-label={title}
        className="fixed inset-x-3 top-[6vh] z-50 mx-auto max-h-[88vh] w-auto max-w-[520px] overflow-y-auto rounded-[14px] border border-line bg-surface p-5 shadow-[var(--shadow-sheet)] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-faint hover:bg-surface-2"
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {fields.map((field) => (
              <Field
                key={field.name}
                label={field.label}
                hint={field.hint}
                className={field.full ? "sm:col-span-2" : undefined}
              >
                {field.type === "textarea" ? (
                  <Textarea
                    name={field.name}
                    required={field.required}
                    placeholder={field.placeholder}
                    defaultValue={field.defaultValue}
                  />
                ) : field.type === "select" ? (
                  <Select
                    name={field.name}
                    required={field.required}
                    defaultValue={field.defaultValue ?? field.options?.[0]?.value}
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    name={field.name}
                    type={field.type ?? "text"}
                    required={field.required}
                    placeholder={field.placeholder}
                    defaultValue={field.defaultValue}
                    dir={field.type === "email" || field.type === "tel" ? "ltr" : undefined}
                    className={
                      field.type === "email" || field.type === "tel" || field.type === "number"
                        ? "text-left"
                        : undefined
                    }
                  />
                )}
              </Field>
            ))}
          </div>

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
