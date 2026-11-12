"use client";

import * as React from "react";
import { ResourceTable, type ColumnDef, type FieldDef } from "./resource-table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface ContactRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
  title: string | null;
  tags: string | null;
  companyName: string | null;
  ownerName: string | null;
  ownerHue: number;
}

const fields: FieldDef[] = [
  { name: "firstName", label: "نام", required: true },
  { name: "lastName", label: "نام خانوادگی", required: true },
  { name: "email", label: "ایمیل", type: "email" },
  { name: "mobile", label: "موبایل", type: "tel", placeholder: "0912…" },
  { name: "title", label: "سمت" },
  { name: "companyId", label: "شرکت", type: "select", options: [] },
  { name: "tags", label: "برچسب‌ها", hint: "با کاما جدا کنید", full: true },
  { name: "notes", label: "یادداشت", type: "textarea", full: true },
];

export function ContactsView({
  rows,
  companies,
}: {
  rows: ContactRow[];
  companies: { id: string; name: string }[];
}) {
  const [data, setData] = React.useState(rows);

  const columns: ColumnDef<ContactRow>[] = [
    {
      key: "name",
      label: "نام",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={`${row.firstName} ${row.lastName}`} hue={row.ownerHue} size={28} />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">
              {row.firstName} {row.lastName}
            </p>
            <p className="truncate text-[11.5px] text-ink-faint">{row.title ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      label: "شرکت",
      render: (row) => <span className="text-ink-soft">{row.companyName ?? "—"}</span>,
    },
    {
      key: "mobile",
      label: "موبایل",
      render: (row) => (
        <span dir="ltr" className="tnum block text-left text-[12.5px] text-ink-soft">
          {row.mobile ?? "—"}
        </span>
      ),
    },
    {
      key: "email",
      label: "ایمیل",
      compact: true,
      render: (row) => (
        <span dir="ltr" className="block truncate text-left text-[12px] text-ink-faint">
          {row.email ?? "—"}
        </span>
      ),
    },
    {
      key: "tags",
      label: "برچسب",
      compact: true,
      render: (row) =>
        row.tags ? (
          <div className="flex flex-wrap gap-1">
            {row.tags.split(",").slice(0, 2).map((tag) => (
              <Badge key={tag} tone="turquoise">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-ink-faint">—</span>
        ),
    },
  ];

  return (
    <ResourceTable
      rows={data}
      columns={columns}
      searchKeys={["firstName", "lastName", "email", "mobile", "companyName"]}
      searchPlaceholder="جست‌وجوی نام، ایمیل یا شرکت…"
      createFields={fields.map((f) =>
        f.name === "companyId"
          ? { ...f, options: companies.map((c) => ({ value: c.id, label: c.name })) }
          : f,
      )}
      createEndpoint="/api/contacts"
      createLabel="مخاطب جدید"
      emptyTitle="هنوز مخاطبی ثبت نشده"
      emptyDescription="اولین مخاطب را اضافه کنید تا پیگیری‌ها شروع شود."
      onCreated={(row) => {
        const created = row as unknown as {
          id: string;
          firstName: string;
          lastName: string;
          email: string | null;
          mobile: string | null;
          title: string | null;
          tags: string | null;
          companyId: string | null;
        };
        setData((current) => [
          {
            id: created.id,
            firstName: created.firstName,
            lastName: created.lastName,
            email: created.email,
            mobile: created.mobile,
            title: created.title,
            tags: created.tags,
            companyName: companies.find((c) => c.id === created.companyId)?.name ?? null,
            ownerName: null,
            ownerHue: 180,
          },
          ...current,
        ]);
      }}
    />
  );
}
