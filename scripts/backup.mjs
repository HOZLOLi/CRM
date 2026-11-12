#!/usr/bin/env node
/**
 * Consistent SQLite backup without stopping the server.
 *
 * `VACUUM INTO` writes a defragmented, transactionally-consistent copy of the
 * database — safe to run while the app is serving requests, unlike copying the
 * file (which can capture a half-written WAL).
 *
 * Usage:
 *   node scripts/backup.mjs            # keep the last 14 snapshots
 *   node scripts/backup.mjs --keep 30
 */
import { PrismaClient } from "@prisma/client";
import { mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const keepIndex = args.indexOf("--keep");
const KEEP = keepIndex >= 0 ? Number(args[keepIndex + 1]) || 14 : 14;

const url = process.env.DATABASE_URL ?? "";
if (!url.startsWith("file:")) {
  console.error("✗ backup.mjs only handles SQLite. Use pg_dump for PostgreSQL.");
  process.exit(1);
}

const BACKUP_DIR = resolve(process.cwd(), "backups");
mkdirSync(BACKUP_DIR, { recursive: true });

const stamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace(/\..+$/, "")
  .replace("T", "-");
const target = join(BACKUP_DIR, `crm-${stamp}.db`);

const db = new PrismaClient();

try {
  // VACUUM INTO refuses to overwrite, so the timestamped name is the guard.
  await db.$executeRawUnsafe(`VACUUM INTO '${target.replace(/\\/g, "/")}'`);
  const size = (statSync(target).size / 1024).toFixed(0);
  console.log(`✓ backup → ${target} (${size} KB)`);
} catch (error) {
  console.error("✗ backup failed:", error.message);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}

// Rotate: newest first, delete anything past KEEP.
const files = readdirSync(BACKUP_DIR)
  .filter((f) => f.startsWith("crm-") && f.endsWith(".db"))
  .map((f) => ({ name: f, time: statSync(join(BACKUP_DIR, f)).mtimeMs }))
  .sort((a, b) => b.time - a.time);

for (const file of files.slice(KEEP)) {
  unlinkSync(join(BACKUP_DIR, file.name));
  console.log(`  removed old snapshot: ${file.name}`);
}

console.log(`  ${Math.min(files.length, KEEP)} snapshot(s) kept in backups/`);
