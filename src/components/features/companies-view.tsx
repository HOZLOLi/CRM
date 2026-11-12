"use client";

import * as React from "react";
import { ResourceTable, type ColumnDef, type FieldDef } from "./resource-table";
import { Badge } from "@/components/ui/badge";

export interface CompanyRow {
  id: string;
  name: string;
  industry: string | null;
  city: string | null;
  domain: string | null;
  phone: string | null;
  contactCount: number;
  dealCount: number;
}

const fields: FieldDef[] = [
  { name: "name", label: "نام شرکت", required: true, full: true },
  { name: "industry", label: "صنعت" },
  { name: "size", label: "اندازه", type: "select", options: [
    { value: "1-10", label: "۱ تا ۱۰" },
    { value: "11-50", label: "۱۱ تا ۵۰" },
    { value: "51-200", label: "۵۱ تا ۲۰۰" },
    { value: "201-1000", label: "۲۰۱ تا ۱۰۰۰" },
    { value: "1000+", label: "بیش از ۱۰۰۰" },
  ] },
  { name: "city", label: "شهر" },
  { name: "phone", label: "تلفن", type: "tel" },
  { name: "domain", label: "دامنه", placeholder: "example.ir" },
  { name: "website", label: "وب‌سایت", placeholder: "https://" },
  { name: "notes", label: "یادداشت", type: "textarea", full: true },
];

export function CompaniesView({ rows }: { rows: CompanyRow[] }) {
  const [data, setData] = React.useState(rows);

  const columns: ColumnDef<CompanyRow>[] = [
    {
      key: "name",
      label: "شرکت",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{row.name}</p>
          <p dir="ltr" className="truncate text-left text-[11.5px] text-ink-faint">
            {row.domain ?? "—"}
          </p>
        </div>
      ),
    },
    {
      key: "industry",
      label: "صنعت",
      render: (row) => (row.industry ? <Badge tone="neutral">{row.industry}</Badge> : <span className="text-ink-faint">—</span>),
    },
    { key: "city", label: "شهر", render: (row) => <span className="text-ink-soft">{row.city ?? "—"}</span> },
    {
      key: "phone",
      label: "تلفن",
      compact: true,
      render: (row) => (
        <span dir="ltr" className="tnum block text-left text-[12.5px] text-ink-soft">
          {row.phone ?? "—"}
        </span>
      ),
    },
    {
      key: "counts",
      label: "مخاطب / معامله",
      render: (row) => (
        <span className="tnum text-[12.5px] text-ink-soft">
          {row.contactCount.toLocaleString("fa-IR")} / {row.dealCount.toLocaleString("fa-IR")}
        </span>
      ),
    },
  ];

  return (
    <ResourceTable
      rows={data}
      columns={columns}
      searchKeys={["name", "industry", "city", "domain"]}
      searchPlaceholder="جست‌وجوی شرکت، صنعت یا شهر…"
      createFields={fields}
      createEndpoint="/api/companies"
      createLabel="شرکت جدید"
      emptyTitle="هنوز شرکتی ثبت نشده"
      emptyDescription="شرکت‌ها را اضافه کنید تا مخاطبین و معاملات به آن‌ها وصل شوند."
      onCreated={(row) => {
        const created = row as unknown as {
          id: string;
          name: string;
          industry: string | null;
          city: string | null;
          domain: string | null;
          phone: string | null;
        };
        setData((current) => [
          { ...created, contactCount: 0, dealCount: 0 },
          ...current,
        ]);
      }}
    />
  );
}
