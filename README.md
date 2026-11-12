# فیروزه — CRM

CRM سبک و سریع برای تیم‌های فروش ایرانی. فارسی، راست‌به‌چپ، واکنش‌گرا (موبایل و ویندوز)،
با قیف فروش کانبان و دستیار هوش مصنوعی که داده‌های خودت را می‌شناسد.

- 📄 [سند مفهومی و معماری](docs/CONCEPT.md)
- 🎨 جهت بصری: «فیروزه و زعفران» — فیروزهٔ کاشی روی کاغذ سرد
- 💰 همهٔ مبالغ با `Decimal` محاسبه می‌شوند، نه `number`

## راه‌اندازی

```bash
npm install          # نصب وابستگی‌ها
npm run setup        # ساخت دیتابیس + داده نمونه
npm run dev          # http://localhost:3000
```

### حساب‌های نمونه

| ایمیل | نقش | گذرواژه |
|---|---|---|
| `admin@firoozeh.ir` | مدیر سیستم | `demo1234` |
| `manager@firoozeh.ir` | مدیر فروش | `demo1234` |
| `rep@firoozeh.ir` | کارشناس فروش | `demo1234` |

## پیکربندی

فایل `.env` را از `.env.example` بساز (یا ویرایش کن):

```ini
DATABASE_URL="file:./dev.db"
AUTH_SECRET="یک-رشته-تصادفی-بلند"
AI_BASE_URL="https://openrouter.ai/api/v1"
AI_API_KEY="sk-..."
AI_MODEL="openai/gpt-4o-mini"
```

> بدون `AI_API_KEY` همه‌چیز کار می‌کند؛ فقط صفحهٔ دستیار غیرفعال می‌ماند.

## اسکریپت‌ها

| دستور | کار |
|---|---|
| `npm run dev` | سرور توسعه |
| `npm run build` | ساخت پروداکشن |
| `npm run setup` | `prisma generate` + `db push` + `seed` |
| `npm run db:push` | همگام‌سازی اسکیما با دیتابیس |
| `npm run db:seed` | دادهٔ نمونه |
| `npm run db:studio` | Prisma Studio |
| `npm run typecheck` | بررسی تایپ |

## ساختار

```
src/
  app/                صفحات و Route Handlers
    (app)/            پوستهٔ اپ — داشبورد، معاملات، مخاطبین، …
    api/              REST API
  components/
    ui/               پایه‌های طراحی (Button، Input، Panel، …)
    layout/           پوستهٔ اپ (ریل، نوار پایین، هدر)
    features/         کامپوننت‌های هر قابلیت
  lib/                پول (Decimal)، تاریخ جلالی، اعتبارسنجی
  server/             دیتابیس، احراز هویت، سرویس‌ها، هوش مصنوعی
  modules/            رجیستری ماژول‌ها ← برای افزودن/حذف بخش‌ها
prisma/               اسکیما و seed
docs/                 سند مفهومی
```

## افزودن یک ماژول

1. صفحه را بساز: `src/app/(app)/<id>/page.tsx`
2. در `src/modules/registry.ts` یک آبجکت به `MODULES` اضافه کن
3. تمام — در ناوبری، نوار پایین و کشوی موبایل ظاهر می‌شود

برای حذف یک ماژول: `enabled: false`.

## هوش مصنوعی

هر نقطهٔ پایانی سازگار با OpenAI کار می‌کند:

| ارائه‌دهنده | `AI_BASE_URL` |
|---|---|
| OpenRouter | `https://openrouter.ai/api/v1` |
| OpenAI | `https://api.openai.com/v1` |
| Ollama (محلی) | `http://localhost:11434/v1` |
| LM Studio (محلی) | `http://localhost:1234/v1` |

## انتقال به PostgreSQL

1. در `prisma/schema.prisma` مقدار `provider` را به `postgresql` تغییر بده
2. `DATABASE_URL` را به رشتهٔ اتصال Postgres تغییر بده
3. `npm run db:push && npm run db:seed`

## اسکیل‌های عامل (Agent Skills)

این پروژه با این اسکیل‌ها ساخته و بازبینی می‌شود (نصب در `~/.pi/agent/skills/`):

- `web-design-guidelines` — بازبینی رابط کاربری طبق راهنمای Vercel
- `improve-animations` — فلسفهٔ حرکت امیل کوالسکی
- `frontend-design` — جهت‌گیری بصری متمایز
- `find-skills` — کشف اسکیل‌های جدید
- `graphify` — نقشهٔ دانش کدبیس

نصب مجدد:

```bash
bash scripts/install-skills.sh
```
