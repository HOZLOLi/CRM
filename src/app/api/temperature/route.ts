import { z } from "zod";
import { guard, ok, handleError } from "@/server/api/http";
import { saveTemperatureEvaluation } from "@/server/sales-engine";

export const dynamic = "force-dynamic";

const schema = z.object({
  customerId: z.string().min(1),
  answers: z.record(z.string(), z.number().int().min(0)),
  note: z.string().optional(),
});

export async function POST(request: Request) {
  const { user, response } = await guard();
  if (response) return response;

  try {
    const body = schema.parse(await request.json());
    const result = await saveTemperatureEvaluation({
      customerId: body.customerId,
      answers: body.answers,
      note: body.note,
      userId: user!.id,
    });
    return ok(
      {
        id: result.evaluation.id,
        rawScore: result.result.rawScore,
        coverage: result.result.coverage,
        isProvisional: result.result.isProvisional,
        band: result.result.band,
      },
      201,
    );
  } catch (error) {
    return handleError(error);
  }
}
