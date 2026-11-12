import { db } from "@/server/db";
import { requireUser } from "@/server/auth";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { OrdersView, type OrderRow } from "@/components/features/orders-view";
import { AiInsight } from "@/components/features/ai-insight";
import { isAiConfigured } from "@/server/ai/provider";

export const metadata = { title: "سفارش‌ها" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireUser();

  const [orders, customers, products] = await Promise.all([
    db.order.findMany({
      include: {
        customer: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { orderedAt: "desc" },
      take: 100,
    }),
    db.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, unit: true, unitPrice: true, costPrice: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    number: o.number,
    customerId: o.customerId,
    customerName: o.customer.name,
    orderedAt: o.orderedAt.toISOString(),
    subtotal: o.subtotal.toString(),
    profit: o.profit.toString(),
    items: o.items.map((i) => ({ name: i.product.name, quantity: i.quantity.toString() })),
  }));

  return (
    <>
      <PageHeader
        title="سفارش‌ها"
        description="ثبت سفارش، محاسبهٔ آنی سود، و به‌روزرسانی خودکار چرخهٔ خرید."
      />
      <PageBody className="flex flex-col gap-5">
        <AiInsight
          scope="orders"
          title="تحلیل سفارش‌ها"
          configured={isAiConfigured()}
          suggestions={[
            "کدام محصول بیشترین سود را دارد؟",
            "حاشیهٔ سود کدام سفارش پایین است و چرا؟",
            "چه محصولی را باید در پیشنهاد بعدی برجسته کنم؟",
          ]}
        />
        <OrdersView
          initial={rows}
          customers={customers}
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            unit: p.unit,
            unitPrice: p.unitPrice.toString(),
            costPrice: p.costPrice.toString(),
          }))}
        />
      </PageBody>
    </>
  );
}
