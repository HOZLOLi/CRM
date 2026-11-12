#!/usr/bin/env node
/**
 * Pre-flight check for a production start.
 *
 * Refuses to boot with a missing or placeholder AUTH_SECRET, and prints the
 * LAN address other devices in the shop should use.
 */
import { randomBytes } from "node:crypto";
import { networkInterfaces } from "node:os";

const problems = [];

const secret = (process.env.AUTH_SECRET ?? "").trim();
if (!secret) {
  problems.push("AUTH_SECRET is not set.");
} else if (secret.length < 32) {
  problems.push(`AUTH_SECRET is too short (${secret.length} chars, need 32+).`);
} else if (secret.includes("dev-only-insecure")) {
  problems.push("AUTH_SECRET is still the development placeholder.");
}

if (!process.env.DATABASE_URL) {
  problems.push("DATABASE_URL is not set.");
}

if (problems.length) {
  console.error("\n✗ Cannot start in production:\n");
  for (const problem of problems) console.error(`  • ${problem}`);
  console.error(`\n  Generate a secret with:\n    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"\n`);
  console.error(`  Suggested value: ${randomBytes(32).toString("hex")}\n`);
  process.exit(1);
}

const port = process.env.PORT ?? "3000";
const addresses = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => `http://${net.address}:${port}`);

console.log("\n✓ Environment OK");
console.log(`  Local:   http://localhost:${port}`);
for (const address of addresses) console.log(`  Network: ${address}   ← از دستگاه‌های دیگر این را باز کنید`);
console.log("");
