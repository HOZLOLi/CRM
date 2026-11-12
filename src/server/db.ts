import { PrismaClient } from "@prisma/client";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaReady?: Promise<void>;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * SQLite tuning for a small multi-device deployment (a shop LAN).
 *
 * - WAL lets readers and a writer work at the same time instead of blocking.
 * - busy_timeout makes a concurrent write wait instead of failing with
 *   "database is locked" — the single most common SQLite complaint.
 * - foreign_keys is off by default in SQLite; Prisma expects it on.
 *
 * Runs once per process, before the first query.
 */
async function tuneSqlite() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.startsWith("file:")) return; // PostgreSQL: nothing to do

  // Make sure the data directory exists before SQLite tries to create the file.
  const filePath = url.replace(/^file:/, "").split("?")[0];
  if (filePath && filePath !== ":memory:") {
    try {
      // Prisma resolves SQLite paths relative to the prisma/ directory.
      mkdirSync(dirname(resolve(process.cwd(), "prisma", filePath)), { recursive: true });
    } catch {
      /* read-only filesystem — let Prisma report the real error */
    }
  }

  try {
    await db.$queryRawUnsafe("PRAGMA journal_mode=WAL;");
    await db.$executeRawUnsafe("PRAGMA busy_timeout=5000;");
    await db.$executeRawUnsafe("PRAGMA foreign_keys=ON;");
    await db.$executeRawUnsafe("PRAGMA synchronous=NORMAL;");
  } catch (error) {
    console.warn("[db] SQLite tuning skipped:", (error as Error).message);
  }
}

/** Await this before serving traffic (used by the health check and scripts). */
export function dbReady() {
  globalForPrisma.prismaReady ??= tuneSqlite();
  return globalForPrisma.prismaReady;
}
