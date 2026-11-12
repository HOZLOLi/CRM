import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSession } from "@/server/auth";

export async function guard() {
  const user = await getSession();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }) };
  }
  return { user, response: null };
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return fail(first?.message ?? "داده نامعتبر است", 422);
  }
  console.error("[api]", error);
  return fail("خطای سرور", 500);
}

/** Prisma Decimal → string for JSON transport. */
export function serialize<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) =>
      typeof v === "object" && v !== null && v.constructor?.name === "Decimal" ? v.toString() : v,
    ),
  );
}
