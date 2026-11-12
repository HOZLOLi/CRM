#!/usr/bin/env node
/**
 * Seeds the database only when it is empty.
 *
 * Safe to run on every container start: an existing shop database is never
 * touched, so a restart can never wipe real data.
 */
import { PrismaClient } from "@prisma/client";
import { spawnSync } from "node:child_process";

const db = new PrismaClient();

try {
  const users = await db.user.count();
  if (users > 0) {
    console.log(`✓ database already has ${users} user(s) — skipping seed`);
  } else {
    console.log("→ empty database, seeding demo data…");
    const result = spawnSync(process.execPath, ["prisma/seed.ts"], { stdio: "inherit" });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
} catch (error) {
  console.error("✗ ensure-seed failed:", error.message);
  process.exit(1);
} finally {
  await db.$disconnect();
}
