---
name: firoozeh-workflow
description: How to work on the فیروزه CRM repository — repo map, commands, the exact recipe for adding a module or an entity, the commit-and-push rule after every change, and how to keep the graphify knowledge graph fresh. Use at the start of any task in this repository.
---

# فیروزه — گردش کار توسعه

## درخواست ویژگی از کاربر

کاربر ویژگی‌ها را با زبان طبیعی و بدون ساختار می‌فرستد. کار تو این است که آن را
به مسیر ثابت زیر ببری — `docs/BACKLOG.md` تنها مرجع است:

```
📥 ثبت (F-00N)  →  📝 مشخصات + تعریف تمام‌شد  →  🔨 ساخت  →  🧪 تست  →  ✅ push
```

- در قدم 📝، «تعریف تمام شد» را با جمله‌های **قابل مشاهده** بنویس
  («مبلغ فاکتور با تخفیف ردیفی درست جمع می‌شود»)، نه فنی («فیلد discount اضافه شود»).
- اگر تصمیمی مبهم است، **قبل از کدنویسی** یک سؤال بپرس، نه سه سؤال.
- ترتیب ساخت: اسکیما → مهاجرت → Zod → API → ویو → صفحه → رجیستری → seed → تست.
- تست دستی اجباری: مسیر اصلی + یک مسیر خطا + نمایش روی ۳۹۰px و ۱۴۴۰px.

## قانون طلایی

> **بعد از هر تغییر کارکردنی: `commit` + `push`.**
>
> دلیل: این پروژه در چند نشست و توسط چند عامل هوش مصنوعی توسعه می‌یابد. اگر
> تغییر روی دیسک بماند، نشست بعدی نمی‌داند چه اتفاقی افتاده. تاریخچهٔ گیت
> حافظهٔ مشترک ماست.

قبل از push همیشه:

```bash
npx tsc --noEmit && npx vitest run && npx next build
```

اگر یکی شکست خورد، **push نکن** — اول درستش کن.

## نقشهٔ مخزن

```
src/
  app/
    (app)/            پوستهٔ اپ — هر پوشه یک ماژول
      layout.tsx      ← AppShell + احراز هویت
      dashboard/      صفحهٔ اصلی
      deals/          کانبان
      contacts/ companies/ leads/ tasks/ assistant/ settings/
    api/              Route Handlers (مرز HTTP)
    login/            صفحهٔ ورود (بیرون از پوسته)
    offline/          صفحهٔ آفلاین PWA
    globals.css       ← تمام توکن‌های طراحی
    layout.tsx        ← فونت‌ها، RTL، تم، ثبت service worker
    manifest.ts       ← PWA
  components/
    ui/               پایه‌ها — Button, Input, Badge, Panel, Stat, Avatar
    layout/           AppShell, PageHeader, ServiceWorkerRegistrar
    features/         کامپوننت‌های هر قابلیت (deals-board, resource-table, …)
  lib/
    money.ts          ← تمام محاسبات مالی (Decimal). تنها راه مجاز.
    date.ts           ← تاریخ جلالی
    validators.ts     ← اسکیمای Zod مشترک فرانت/بک
    utils.ts          ← cn, initials
  server/
    db.ts             ← Prisma singleton + تنظیم SQLite (WAL)
    auth.ts           ← JWT + bcrypt + کوکی
    env.ts            ← اعتبارسنجی env + تشخیص HTTPS
    api/http.ts       ← guard, ok, fail, handleError, serialize
    ai/provider.ts    ← لایهٔ انتزاعی هوش مصنوعی
  modules/registry.ts ← ← ← فهرست ماژول‌ها (ناوبری از اینجا ساخته می‌شود)
prisma/
  schema.prisma       ← ۱۵ مدل
  seed.ts             ← دادهٔ نمونهٔ فارسی
scripts/              ← استقرار، پشتیبان، اسکیل‌ها
docs/                 ← CONCEPT.md, DEPLOY.md, BACKLOG.md
.agents/skills/       ← اسکیل‌های این پروژه (نسخه‌بندی‌شده)
graphify-out/         ← نقشهٔ دانش کدبیس
```

## دستورها

| دستور | کار |
|---|---|
| `npm run dev` | توسعه روی `0.0.0.0:3000` |
| `npm run build` | `prisma generate` + ساخت پروداکشن |
| `npm run start:prod` | بررسی env + اجرای پروداکشن |
| `npm run setup` | generate + db push + seed |
| `npm run db:push` | همگام‌سازی اسکیما |
| `npm run db:seed` | دادهٔ نمونه (⚠️ همه چیز را پاک می‌کند) |
| `npm run db:backup` | پشتیبان بدون توقف |
| `npm test` | Vitest |
| `npm run typecheck` | tsc |

## دستور پخت ۱ — افزودن یک ماژول جدید

مثال: «محصولات» در `/products`

1. **صفحه** بساز: `src/app/(app)/products/page.tsx`
   ```tsx
   import { PageHeader, PageBody } from "@/components/layout/page-header";
   export const metadata = { title: "محصولات" };
   export const dynamic = "force-dynamic";
   export default async function ProductsPage() {
     return (<><PageHeader title="محصولات" /><PageBody>…</PageBody></>);
   }
   ```
2. **ثبت در رجیستری**: `src/modules/registry.ts` → یک آبجکت به `MODULES` اضافه کن
   ```ts
   { id: "products", label: "محصولات", href: "/products", icon: Package,
     group: "work", enabled: true, description: "کاتالوگ کالا و خدمات" }
   ```
3. تمام. ناوبری دسکتاپ، نوار پایین موبایل و کشو خودکار به‌روز می‌شوند.

برای **حذف** یک ماژول: `enabled: false` — پوشه را پاک نکن.

## دستور پخت ۲ — افزودن یک موجودیت (entity)

مثال: `Product` (از قبل در اسکیما هست، ولی روند این است)

1. **اسکیما** — `prisma/schema.prisma` مدل را اضافه کن
   - بدون `enum` (SQLite)
   - مبلغ → `Decimal`، هرگز `Float`
   - `createdAt` / `updatedAt` / `ownerId` / ایندکس روی فیلدهای جست‌وجو
2. `npx prisma db push`
3. **اعتبارسنجی** — `src/lib/validators.ts` یک `xxxSchema` با Zod
4. **API** — `src/app/api/xxx/route.ts` (GET, POST) و `[id]/route.ts` (PATCH, DELETE)
   ```ts
   const { user, response } = await guard();
   if (response) return response;
   try { const data = xxxSchema.parse(await request.json()); … }
   catch (error) { return handleError(error); }
   ```
   - همیشه `serialize()` روی خروجی (Decimal → string)
   - همیشه `auditLog.create` برای create/update/delete
5. **ویو** — `src/components/features/xxx-view.tsx` با `ResourceTable`
6. **صفحه** — `src/app/(app)/xxx/page.tsx` که داده را از Prisma می‌خواند و به ویو می‌دهد
7. **رجیستری** — ماژول را ثبت کن
8. **seed** — `prisma/seed.ts` چند رکورد نمونهٔ فارسی اضافه کن
9. **تست** — اگر منطق مالی دارد، در `src/lib/money.test.ts` یا فایل تست جدید

## دستور پخت ۳ — افزودن یک قابلیت هوش مصنوعی

1. تابع در `src/server/ai/provider.ts` (مثلاً `buildXxxContext()`)
2. اگر endpoint جدید است: `src/app/api/ai/xxx/route.ts` با `streamText`
3. در `SYSTEM_PROMPT` صریح بنویس که فقط بر پایهٔ دادهٔ داده‌شده پاسخ دهد
4. کلیدها فقط در `.env` — هرگز در کد یا گیت

## قوانین سخت (نقض = باگ)

| # | قانون |
|---|---|
| ۱ | **پول هرگز `number` نیست.** فقط `Decimal` از `src/lib/money.ts`. |
| ۲ | **هیچ کوئری Prisma در کامپوننت کلاینت.** داده از Server Component یا API. |
| ۳ | **هر Route Handler با `guard()` شروع می‌شود.** |
| ۴ | **هر ورودی با Zod پارس می‌شود.** |
| ۵ | **`.env` و `data/` و `backups/` هرگز commit نمی‌شوند.** |
| ۶ | **هیچ رنگ hex در کامپوننت.** فقط توکن. |
| ۷ | **هیچ `ease-in`، هیچ `transition: all`.** |
| ۸ | **ورودی‌ها `text-[16px]` روی موبایل.** |
| ۹ | **بعد از هر تغییر: typecheck + test + build + commit + push.** |
| ۱۰ | **نقشهٔ دانش خودکار سینک می‌شود** — هوک‌ها انجامش می‌دهند |

## نقشهٔ دانش (graphify)

`graphify-out/` یک گراف از کدبیس است تا عامل بعدی بدون خواندن همهٔ فایل‌ها
معماری را بفهمد.

```bash
graphify query "deal stage move kanban"             # پرسش از گراف
graphify explain "createSession"                    # توضیح یک نماد و همسایه‌هایش
graphify path "DealsBoard" "db"                     # کوتاه‌ترین مسیر بین دو نماد
graphify affected "money.ts"                        # چه چیزهایی از این تغییر می‌کنند
graphify god-nodes --top 10                         # گره‌های اصلی معماری
graphify update .                                   # به‌روزرسانی بعد از تغییر کد (بدون هزینه)
```

> **نکته:** شناسه‌های کد انگلیسی‌اند، پس پرسش را با **کلیدواژهٔ انگلیسی** بده
> (`deal`, `money`, `auth`, `kanban`) نه فارسی. برای پرسش فارسی نتیجه‌ای برنمی‌گردد.

**به‌روزرسانی خودکار است.** هوک‌های `pre-commit` و `pre-push` گراف را سینک
می‌کنند و در همان کامیت می‌گذارند. لازم نیست دستی کاری کنی.

اگر روی ماشین جدیدی هستی:

```bash
npm install
npm run hooks:install     # ← یک‌بار، واجب
```

فقط اگر graphify نصب نیست (`command -v graphify`)، دستی اجرا کن:

```bash
pip install graphifyy
```

`GRAPH_REPORT.md` را بخوان — فهرست گره‌های اصلی و جوامع را دارد.

## اسکیل‌های موجود

در `.agents/skills/` (نسخه‌بندی‌شده، همراه مخزن):

| اسکیل | کِی استفاده شود |
|---|---|
| `firoozeh-design` | **هر** تغییر ظاهری — رنگ، تایپ، کامپوننت، انیمیشن |
| `firoozeh-workflow` | شروع هر تسک — نقشه، دستورها، قوانین |
| `web-design-guidelines` | بازبینی UI طبق راهنمای Vercel |
| `improve-animations` | بازبینی و برنامهٔ بهبود حرکت |
| `frontend-design` | جهت‌گیری بصری برای صفحهٔ کاملاً جدید |
| `find-skills` | وقتی قابلیتی کم است و اسکیل آماده می‌خواهی |
| `graphify` | پرسش از معماری، ساخت/به‌روزرسانی گراف |

## پیام کامیت

```
<type>(<scope>): <توضیح کوتاه فارسی>

- جزئیات
- جزئیات
```

`type`: `feat` `fix` `refactor` `docs` `test` `chore` `perf` `a11y`
`scope`: `deals` `contacts` `auth` `design` `deploy` `ai` `db` `graph`

## بررسی بصری

قبل از تحویل هر تغییر UI، اسکرین‌شات بگیر:

```bash
npm run build && npx next start -p 3100 &
# سپس با playwright-core و Chrome نصب‌شده روی ویندوز
```

مسیر Chrome: `C:/Program Files/Google/Chrome/Application/chrome.exe`
ورود: `manager@firoozeh.ir` / `demo1234`
اندازه‌ها: `1440×900` (دسکتاپ) و `390×844` (موبایل)
