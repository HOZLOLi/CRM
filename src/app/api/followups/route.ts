import { z } from "zod";
import { db } from "@/server/db";
import { guard, ok, fail, handleError } from "@/server/api/http";
import { buildCartable } from "@/server/sales-engine";

export const dynamic = "force-dynamic";

const schema = z.object({
  customerId: z.string().min(1),
  action: z.enum(["done", "attempt", "skip", "create"]),
  stage: z.number().int().min(1).max(7).optional(),
  channel: z.enum(["call", "sms", "whatsapp"]).optional(),
  priority: z.enum(["P1", "P2", "P3"]).optional(),
  reason: z.string().optional(),
  suggestedMessage: z.string().optional(),
});

export async function POST(request: Request) {
  const { user, response } = await guard();
  if (response) return response;

  try {
    const body = schema.parse(await request.json());

    const open = await db.followUpTask.findFirst({
      where: { customerId: body.customerId, status: "open" },
      orderBy: { createdAt: "desc" },
    });

    // منع تماس یک قانون سخت است: هیچ اقدامی مجاز نیست
    const profile = await db.customerProfile.findUnique({
      where: { companyId: body.customerId },
    });
    if (profile && !profile.contactAllowed) {
      return fail("این مشتری درخواست عدم تماس داده است", 409);
    }

    if (body.action === "done" || body.action === "skip") {
      if (open) {
        await db.followUpTask.update({
          where: { id: open.id },
          data: {
            status: body.action === "done" ? "done" : "skipped",
            completedAt: new Date(),
          },
        });
      } else {
        return fail("وظیفهٔ بازی برای این مشتری وجود ندارد", 404);
      }
    }

    if (body.action === "attempt") {
      if (open) {
        await db.followUpTask.update({
          where: { id: open.id },
          data: { attempts: { increment: 1 } },
        });
      } else {
        await db.followUpTask.create({
          data: {
            customerId: body.customerId,
            dueDate: new Date(),
            stage: body.stage ?? 3,
            channel: body.channel ?? "call",
            priority: body.priority ?? "P3",
            reason: body.reason ?? "تماس پیگیری",
            suggestedMessage: body.suggestedMessage,
            attempts: 1,
            assigneeId: user!.id,
          },
        });
      }
    }

    if (body.action === "create") {
      await db.followUpTask.create({
        data: {
          customerId: body.customerId,
          dueDate: new Date(),
          stage: body.stage ?? 1,
          channel: body.channel ?? "call",
          priority: body.priority ?? "P3",
          reason: body.reason ?? "افزودن دستی به کارتابل",
          suggestedMessage: body.suggestedMessage,
          assigneeId: user!.id,
        },
      });
    }

    await db.decisionLog.create({
      data: {
        entityType: "customer",
        entityId: body.customerId,
        decision: `followup_${body.action}`,
        detail: JSON.stringify({ stage: body.stage, channel: body.channel }),
        userId: user!.id,
      },
    });

    return ok({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request: Request) {
  const { user, response } = await guard();
  if (response) return response;

  const url = new URL(request.url);
  const mine = url.searchParams.get("mine") === "1";
  const cards = await buildCartable(mine ? { assigneeId: user!.id } : {});
  return ok(cards);
}
