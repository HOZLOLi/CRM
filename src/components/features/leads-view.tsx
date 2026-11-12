"use client";

import * as React from "react";
import { ResourceTable, type ColumnDef, type FieldDef } from "./resource-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface LeadRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  score: number;
  ownerName: string | null;
}

const STATUS: Record<string, { label: string; tone: "neutral" | "turquoise" | "saffron" | "clay" | "moss" }> = {
  new: { label: "جدید", tone: "neutral" },
  contacted: { label: "تماس گرفته‌شده", tone: "turquoise" },
  qualified: { label: "واجد شرایط", tone: "moss" },
  unqualified: { label: "رد شده", tone: "clay" },
  converted: { label: "تبدیل‌شده", tone: "saffron" },
};

const SOURCE: Record<string, string> = {
  manual: "دستی",
  website: "وب‌سایت",
  referral: "معرفی",
  campaign: "کمپین",
  inbound: "ورودی",
};

const fields: FieldDef[] = [
  { name: "name", label: "نام سرنخ", required: true, full: true },
  { name: "companyName", label: "شرکت" },
  { name: "email", label: "ایمیل", type: "email" },
  { name: "phone", label: "تلفن", type: "tel" },
  { name: "score", label: "امتیاز (۰ تا ۱۰۰)", type: "number", defaultValue: "0" },
  {
    name: "source",
    label: "منبع",
    type: "select",
    options: Object.entries(SOURCE).map(([value, label]) => ({ value, label })),
  },
  {
    name: "status",
    label: "وضعیت",
    type: "select",
    options: Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label })),
  },
  { name: "notes", label: "یادداشت", type: "textarea", full: true },
];

export function LeadsView({ rows }: { rows: LeadRow[] }) {
  const [data, setData] = React.useState(rows);

  const columns: ColumnDef<LeadRow>[] = [
    {
      key: "name",
      label: "سرنخ",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{row.name}</p>
          <p dir="ltr" className="truncate text-left text-[11.5px] text-ink-faint">
            {row.email ?? row.phone ?? "—"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "وضعیت",
      render: (row) => {
        const s = STATUS[row.status] ?? { label: row.status, tone: "neutral" as const };
        return <Badge tone={s.tone}>{s.label}</Badge>;
      },
    },
    {
      key: "score",
      label: "امتیاز",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-1 w-14 overflow-hidden rounded-full bg-surface-2">
            <div
              className={cn(
                "h-full rounded-full",
                row.score >= 70 ? "bg-moss" : row.score >= 40 ? "bg-saffron" : "bg-clay",
              )}
              style={{ width: `${row.score}%` }}
            />
          </div>
          <span className="tnum text-[12px] text-ink-soft">{row.score.toLocaleString("fa-IR")}</span>
        </div>
      ),
    },
    {
      key: "source",
      label: "منبع",
      compact: true,
      render: (row) => <span className="text-[12.5px] text-ink-soft">{SOURCE[row.source] ?? row.source}</span>,
    },
    {
      key: "owner",
      label: "مسئول",
      compact: true,
      render: (row) => <span className="text-[12.5px] text-ink-soft">{row.ownerName ?? "—"}</span>,
    },
  ];

  return (
    <ResourceTable
      rows={data}
      columns={columns}
      searchKeys={["name", "email", "phone"]}
      searchPlaceholder="جست‌وجوی سرنخ…"
      createFields={fields}
      createEndpoint="/api/leads"
      createLabel="سرنخ جدید"
      emptyTitle="هنوز سرنخی ثبت نشده"
      emptyDescription="سرنخ‌ها را اضافه کنید تا به معامله تبدیل شوند."
      onCreated={(row) => {
        const created = row as unknown as LeadRow;
        setData((current) => [{ ...created, ownerName: null }, ...current]);
      }}
    />
  );
}
