"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderForm, type OrderCustomer, type OrderProduct } from "./order-form";
import { formatMoney, sum } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { Panel, PanelHeader, EmptyState } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";

export interface OrderRow {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  orderedAt: string;
  subtotal: string;
  profit: string;
  items: { name: string; quantity: string }[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function OrdersView({
  initial,
  customers,
  products,
}: {
  initial: OrderRow[];
  customers: OrderCustomer[];
  products: OrderProduct[];
}) {
  const [orders, setOrders] = React.useState(initial);
  const [open, setOpen] = React.useState(false);

  const revenue = sum(orders.map((o) => o.subtotal));
  const profit = sum(orders.map((o) => o.profit));

  async function refresh() {
    setOpen(false);
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = (await res.json()) as OrderRow[];
      setOrders(data);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-3 text-[12.5px] text-ink-soft">
          <span>
            {orders.length.toLocaleString("fa-IR")} سفارش
          </span>
          <span className="text-line-strong">|</span>
          <span className="tnum">درآمد {formatMoney(revenue, { compact: true })}</span>
          <span className="text-line-strong">|</span>
          <span className="tnum text-moss">سود {formatMoney(profit, { compact: true })}</span>
        </div>
        <Button className="mr-auto" onClick={() => setOpen(true)}>
          <Plus size={15} />
          سفارش جدید
        </Button>
      </div>

      <Panel className="mt-4 overflow-hidden">
        <PanelHeader title="سفارش‌ها" subtitle="آخرین ۱۰۰ سفارش" />
        <div className="rule mx-5" />

        {orders.length === 0 ? (
          <EmptyState title="هنوز سفارشی ثبت نشده" description="اولین سفارش را ثبت کنید." />
        ) : (
          <>
            <table className="hidden w-full text-right md:table">
              <thead>
                <tr className="border-b border-line bg-surface-2/60">
                  {["شماره", "مشتری", "تاریخ", "اقلام", "مبلغ", "سود"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[11.5px] font-medium text-ink-faint">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {orders.map((order) => (
                    <motion.tr
                      key={order.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-line last:border-0 transition-colors hover:bg-surface-2/50"
                    >
                      <td dir="ltr" className="tnum px-4 py-2.5 text-left text-[11.5px] text-ink-faint">
                        {order.number}
                      </td>
                      <td className="px-4 py-2.5 text-[13px] text-ink">{order.customerName}</td>
                      <td className="px-4 py-2.5 text-[12px] text-ink-soft">
                        {formatDate(order.orderedAt, "d MMM yyyy")}
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-2.5 text-[12px] text-ink-faint">
                        {order.items.map((i) => `${i.name} ×${i.quantity}`).join("، ")}
                      </td>
                      <td className="tnum px-4 py-2.5 text-[12.5px] text-ink">
                        {formatMoney(order.subtotal, { compact: true })}
                      </td>
                      <td className="tnum px-4 py-2.5 text-[12.5px] text-moss">
                        {formatMoney(order.profit, { compact: true })}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            <ul className="divide-y divide-line md:hidden">
              {orders.map((order) => (
                <li key={order.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-medium text-ink">{order.customerName}</span>
                    <span className="tnum text-[12px] text-ink">
                      {formatMoney(order.subtotal, { compact: true })}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-2 text-[11.5px]">
                    <span className="text-ink-faint">{formatDate(order.orderedAt, "d MMM yyyy")}</span>
                    <span className="tnum text-moss">
                      سود {formatMoney(order.profit, { compact: true })}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-ink-faint">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join("، ")}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <AnimatePresence>
        {open ? (
          <OrderForm
            customers={customers}
            products={products}
            onClose={() => setOpen(false)}
            onCreated={refresh}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
