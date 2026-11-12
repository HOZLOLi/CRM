#!/usr/bin/env node
/**
 * آماده‌سازی بستهٔ دسکتاپ.
 *
 * خروجی standalone نکست را با استاتیک، فونت‌ها، موتور پریزما و دیتابیس پایه
 * کنار هم می‌گذارد تا Electron بتواند بدون هیچ نصبی اجرایش کند.
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const stage = resolve(root, ".desktop-build");
const standalone = resolve(root, ".next/standalone");

if (!existsSync(standalone)) {
  console.error("✗ .next/standalone وجود ندارد — ابتدا `npm run build` را اجرا کنید.");
  process.exit(1);
}

if (!existsSync(resolve(root, "desktop/base.db"))) {
  console.error("✗ desktop/base.db وجود ندارد — ابتدا `npm run desktop:db` را اجرا کنید.");
  process.exit(1);
}

console.log("→ پاک‌سازی staging…");
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });

console.log("→ کپی سرور standalone…");
cpSync(standalone, resolve(stage, "server"), { recursive: true });

console.log("→ کپی فایل‌های استاتیک…");
cpSync(resolve(root, ".next/static"), resolve(stage, "server/.next/static"), { recursive: true });

console.log("→ کپی public (فونت‌ها، آیکون‌ها، service worker)…");
cpSync(resolve(root, "public"), resolve(stage, "server/public"), { recursive: true });

console.log("→ کپی موتور پریزما…");
const prismaEngine = resolve(root, "node_modules/.prisma");
if (existsSync(prismaEngine)) {
  cpSync(prismaEngine, resolve(stage, "server/node_modules/.prisma"), { recursive: true });
}
const prismaSchema = resolve(root, "prisma/schema.prisma");
cpSync(prismaSchema, resolve(stage, "server/prisma/schema.prisma"));

console.log("→ حذف وابستگی‌های غیرضروری…");
for (const dir of ["typescript", "@types", "caniuse-lite", "eslint", "vitest", "electron"]) {
  const target = resolve(stage, "server/node_modules", dir);
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
}

console.log("→ کپی دیتابیس پایه…");
cpSync(resolve(root, "desktop/base.db"), resolve(stage, "base.db"));

// نسخه را از package.json به اپ دسکتاپ منتقل کن
const version = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).version;
writeFileSync(
  resolve(root, "desktop/package.json"),
  JSON.stringify(
    {
      name: "firoozeh",
      productName: "فیروزه",
      version,
      description: "CRM پخش عمده ظروف یکبارمصرف",
      main: "main.js",
      author: "Firoozeh",
    },
    null,
    2,
  ) + "\n",
  "utf8",
);

// بسته‌بندی سرور در یک آرشیو — electron-builder پوشه‌های نقطه‌دار (.next) و
// node_modules را در extraResources فیلتر می‌کند، آرشیو از این مشکل در امان است.
console.log("→ ساخت آرشیو سرور (tar.gz)…");
const archive = resolve(stage, "server.tar.gz");
rmSync(archive, { force: true });
const tarBin =
  process.platform === "win32" && existsSync("C:/Windows/System32/tar.exe")
    ? "C:/Windows/System32/tar.exe"
    : "tar";
execFileSync(tarBin, ["-czf", archive, "-C", resolve(stage, "server"), "."], {
  stdio: "inherit",
});

console.log("✓ آماده است → .desktop-build/");
