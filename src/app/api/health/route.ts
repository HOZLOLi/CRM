import { NextResponse } from "next/server";
import { db, dbReady } from "@/server/db";

export const dynamic = "force-dynamic";

/** Liveness + database reachability. Used by the deploy scripts and monitoring. */
export async function GET() {
  const started = Date.now();

  try {
    await dbReady();
    await db.$queryRawUnsafe("SELECT 1");
    const [users, deals] = await Promise.all([db.user.count(), db.deal.count()]);

    return NextResponse.json({
      ok: true,
      database: "up",
      latencyMs: Date.now() - started,
      records: { users, deals },
      version: process.env.npm_package_version ?? "0.1.0",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, database: "down", error: (error as Error).message },
      { status: 503 },
    );
  }
}
