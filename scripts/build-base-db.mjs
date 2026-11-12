#!/usr/bin/env node
/**
 * ساخت دیتابیس پایهٔ اپ دسکتاپ.
 *
 * یک فایل SQLite تمیز با اسکیما، سه کاربر و تنظیمات پیش‌فرض می‌سازد — بدون
 * دادهٔ نمایشی. اپ در اولین اجرا این فایل را در پوشهٔ کاربر کپی می‌کند.
 */
import { PrismaClient } from "@prisma/client";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { DEFAULT_SETTINGS, SETTING_GROUPS, SETTING_SCHEMAS } from "../src/lib/settings.ts";

const root = resolve(import.meta.dirname, "..");
const target = resolve(root, "desktop/base.db");

mkdirSync(resolve(root, "desktop"), { recursive: true });

for (const suffix of ["", "-journal", "-wal", "-shm"]) {
  const file = `${target}${suffix}`;
  if (existsSync(file)) rmSync(file);
}

const url = `file:${target.replace(/\\/g, "/")}`;
console.log("→ prisma db push →", target);
execFileSync("npx", ["prisma", "db", "push", "--skip-generate"], {
  cwd: root,
  env: { ...process.env, DATABASE_URL: url },
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.env.DATABASE_URL = url;
const db = new PrismaClient();

const password = await bcrypt.hash("demo1234", 10);

await db.user.createMany({
  data: [
    { email: "admin@firoozeh.ir", passwordHash: password, name: "مدیر سیستم", role: "admin", title: "مدیرعامل", avatarHue: 180 },
    { email: "manager@firoozeh.ir", passwordHash: password, name: "مدیر فروش", role: "manager", title: "مدیر فروش", avatarHue: 40 },
    { email: "rep@firoozeh.ir", passwordHash: password, name: "کارشناس فروش", role: "rep", title: "کارشناس فروش", avatarHue: 300 },
  ],
});

for (const key of Object.keys(SETTING_SCHEMAS)) {
  await db.setting.create({
    data: { key, group: SETTING_GROUPS[key], value: JSON.stringify(DEFAULT_SETTINGS[key]) },
  });
}

const pipeline = await db.pipeline.create({ data: { name: "قیف فروش اصلی", isDefault: true } });
const stageDefs = [
  { name: "تماس اولیه", order: 1, probability: 10, tone: "neutral" },
  { name: "نیازسنجی", order: 2, probability: 25, tone: "turquoise" },
  { name: "ارائه پیشنهاد", order: 3, probability: 50, tone: "turquoise" },
  { name: "مذاکره", order: 4, probability: 75, tone: "saffron" },
  { name: "قرارداد", order: 5, probability: 90, tone: "moss" },
];
for (const stage of stageDefs) {
  await db.stage.create({ data: { ...stage, pipelineId: pipeline.id } });
}

// کاتالوگ کالای پخش عمده — اپ از روز اول قابل استفاده باشد
await db.product.createMany({
  data: [
    { name: "ظرف فوم تک‌پرس درب‌دار", sku: "FM-1P", unitPrice: 1_480_000, costPrice: 1_250_000, unit: "بسته ۵۰۰ عددی", packSize: 500, taxRate: 9 },
    { name: "ظرف فوم دوپرس", sku: "FM-2P", unitPrice: 1_950_000, costPrice: 1_650_000, unit: "بسته ۵۰۰ عددی", packSize: 500, taxRate: 9 },
    { name: "لیوان کاغذی ۷ اونس", sku: "CP-7OZ", unitPrice: 1_120_000, costPrice: 900_000, unit: "کارتن ۱۰۰۰ عددی", packSize: 1000, taxRate: 9 },
    { name: "لیوان پلاستیکی شفاف", sku: "PL-CLR", unitPrice: 780_000, costPrice: 620_000, unit: "کارتن ۱۰۰۰ عددی", packSize: 1000, taxRate: 9 },
    { name: "سفره یکبارمصرف رولی", sku: "SF-ROL", unitPrice: 620_000, costPrice: 480_000, unit: "کارتن ۱۲ رول", packSize: 12, taxRate: 9 },
    { name: "قاشق و چنگال بسته‌بندی‌شده", sku: "CT-SET", unitPrice: 940_000, costPrice: 750_000, unit: "کارتن ۱۰۰۰ ست", packSize: 1000, taxRate: 9 },
  ],
});

// پاکسازی WAL تا فایل تک‌فایل و قابل انتقال باشد
await db.$queryRawUnsafe("PRAGMA wal_checkpoint(TRUNCATE);");
await db.$disconnect();

console.log(`✓ base.db ساخته شد (${(statSync(target).size / 1024).toFixed(0)} KB)`);
