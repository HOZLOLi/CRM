"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Trash2, Loader2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Select, Field } from "@/components/ui/input";
import { formatMoney, dec, mul, round } from "@/lib/money";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface OrderProduct {
  id: string;
  name: string;
  unit: string;
  unitPrice: string;
  costPrice: string;
}

export interface OrderCustomer {
  id: string;
  name: string;
}

interface Line {
  key: string;
  productId: string;
  quantity: string;
}

const newLine = (): Line => ({
  key: Math.random().toString(36).slice(2),
  productId: "",
  quantity: "1",
});

export function OrderForm({
  customers,
  products,
  onCreated,
  onClose,
}: {
  customers: OrderCustomer[];
  products: OrderProduct[];
  onCreated: () => void;
  onClose: () => void;
}) {
  const [customerId, setCustomerId] = React.useState(customers[0]?.id ?? "");
  const [orderedAt, setOrderedAt] = React.useState(
    new Date().toISOString().slice(0, 10),
  );
  const [lines, setLines] = React.useState<Line[]>([{ ...newLine(), productId: products[0]?.id ?? "" }]);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const productById = React.useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  // پیش‌نمایش با همان Decimal سرور — نه حساب شناور
  const totals = React.useMemo(() => {
    let revenue = dec(0);
    let cost = dec(0);

    for (const line of lines) {
      const product = productById.get(line.productId);
      if (!product) continue;
      const quantity = dec(line.quantity || "0");
      revenue = revenue.plus(mul(quantity, product.unitPrice));
      cost = cost.plus(mul(quantity, product.costPrice));
    }

    const profit = revenue.minus(cost);
    return {
      revenue: round(revenue, 2),
      cost: round(cost, 2),
      profit: round(profit, 2),
      margin: revenue.isZero() ? dec(0) : round(profit.dividedBy(revenue).times(100), 1),
    };
  }, [lines, productById]);

  const valid = customerId && lines.every((l) => l.productId && dec(l.quantity || "0").greaterThan(0));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          orderedAt: new Date(orderedAt).toISOString(),
          lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ثبت سفارش ناموفق بود");
        return;
      }
      onCreated();
    } catch {
      setError("ارتباط با سرور برقرار نشد");
    } finally {
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
        initial={{ opacity: 0, y: 12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.985 }}
        transition={{ duration: 0.24, ease: EASE }}
        role="dialog"
        aria-modal="true"
        aria-label="سفارش جدید"
        className="fixed inset-x-3 top-[5vh] z-50 mx-auto max-h-[90vh] w-auto max-w-[600px] overflow-y-auto rounded-[14px] border border-line bg-surface p-5 shadow-[var(--shadow-sheet)] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">سفارش جدید</h2>
            <p className="mt-0.5 text-[12px] text-ink-faint">
              سود هر ردیف و کل، همان لحظه محاسبه می‌شود
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-faint hover:bg-surface-2"
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="مشتری">
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="تاریخ سفارش">
              <Input
                type="date"
                dir="ltr"
                className="text-left"
                value={orderedAt}
                onChange={(e) => setOrderedAt(e.target.value)}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-ink-soft">ردیف‌ها</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setLines((prev) => [...prev, newLine()])}
              >
                <Plus size={14} />
                ردیف
              </Button>
            </div>

            <AnimatePresence initial={false}>
              {lines.map((line, index) => {
                const product = productById.get(line.productId);
                const quantity = dec(line.quantity || "0");
                const lineProfit = product
                  ? round(
                      mul(quantity, dec(product.unitPrice).minus(dec(product.costPrice))),
                      2,
                    )
                  : dec(0);

                return (
                  <motion.div
                    key={line.key}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    className="rounded-[9px] border border-line bg-surface-2/50 p-2.5"
                  >
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <Select
                          value={line.productId}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((l, i) =>
                                i === index ? { ...l, productId: e.target.value } : l,
                              ),
                            )
                          }
                          aria-label={`محصول ردیف ${index + 1}`}
                        >
                          <option value="">— انتخاب محصول —</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="w-24 shrink-0">
                        <Input
                          type="number"
                          min="0.001"
                          step="any"
                          dir="ltr"
                          className="text-center"
                          value={line.quantity}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((l, i) =>
                                i === index ? { ...l, quantity: e.target.value } : l,
                              ),
                            )
                          }
                          aria-label={`تعداد ردیف ${index + 1}`}
                        />
                      </div>

                      {lines.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                          className="flex h-10 w-9 shrink-0 items-center justify-center rounded-[7px] text-ink-faint transition-colors hover:bg-clay-soft hover:text-clay"
                          aria-label="حذف ردیف"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : null}
                    </div>

                    {product ? (
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-faint">
                        <span>{product.unit}</span>
                        <span className="tnum">
                          فروش {formatMoney(product.unitPrice, { compact: true })}
                        </span>
                        <span className="tnum">
                          خرید {formatMoney(product.costPrice, { compact: true })}
                        </span>
                        <span className="tnum ms-auto text-moss">
                          سود ردیف {formatMoney(lineProfit, { compact: true })}
                        </span>
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* totals */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[9px] border border-line bg-line sm:grid-cols-4">
            {[
              { label: "مبلغ کل", value: totals.revenue, className: "text-ink" },
              { label: "بهای تمام‌شده", value: totals.cost, className: "text-ink-soft" },
              { label: "سود ناخالص", value: totals.profit, className: "text-moss" },
              { label: "حاشیه", value: null, className: "text-ink" },
            ].map((cell) => (
              <div key={cell.label} className="bg-surface px-3 py-2.5">
                <p className="text-[10.5px] text-ink-faint">{cell.label}</p>
                <p className={cn("tnum mt-0.5 text-[13px] font-medium", cell.className)}>
                  {cell.value
                    ? formatMoney(cell.value, { compact: true })
                    : `${totals.margin.toNumber().toLocaleString("fa-IR", { maximumFractionDigits: 1 })}٪`}
                </p>
              </div>
            ))}
          </div>

          {error ? (
            <p className="rounded-[7px] bg-clay-soft px-3 py-2 text-[12.5px] text-clay" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" disabled={pending || !valid}>
              {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              ثبت سفارش
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
