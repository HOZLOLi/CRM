import { z } from "zod";
import { db } from "@/server/db";
import { guard, ok, handleError, serialize } from "@/server/api/http";
import { createOrder } from "@/server/sales-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const { response } = await guard();
  if (response) return response;

  const orders = await db.order.findMany({
    include: {
      customer: { select: { id: true, name: true } },
      items: { include: { product: { select: { id: true, name: true } } } },
    },
    orderBy: { orderedAt: "desc" },
    take: 100,
  });
  return ok(serialize(orders));
}

const schema = z.object({
  customerId: z.string().min(1),
  orderedAt: z.string().optional(),
  note: z.string().optional(),
  lines: z
    .array(z.object({ productId: z.string().min(1), quantity: z.string().min(1) }))
    .min(1, "سفارش باید حداقل یک ردیف داشته باشد"),
});

export async function POST(request: Request) {
  const { user, response } = await guard();
  if (response) return response;

  try {
    const body = schema.parse(await request.json());
    const order = await createOrder({
      customerId: body.customerId,
      orderedAt: body.orderedAt ? new Date(body.orderedAt) : undefined,
      note: body.note,
      lines: body.lines,
      userId: user!.id,
    });
    return ok(serialize(order), 201);
  } catch (error) {
    return handleError(error);
  }
}
