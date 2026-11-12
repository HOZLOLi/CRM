import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { createSession, verifyPassword } from "@/server/auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ایمیل یا گذرواژه نامعتبر است" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "حسابی با این ایمیل پیدا نشد" }, { status: 401 });
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "گذرواژه نادرست است" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
