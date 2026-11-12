# راهنمای استقرار فیروزه

هدف: یک دستگاه (PC یا مینی‌پی‌سی) در مغازه که سرور روی آن اجرا می‌شود، و بقیهٔ
دستگاه‌ها (تبلت صندوق، گوشی فروشنده، لپ‌تاپ مدیر) از طریق شبکه به آن وصل می‌شوند.

```
                    ┌──────────────────────────────┐
   تبلت صندوق ─────▶│                              │
   گوشی فروشنده ───▶│  PC سرور: next start         │──▶ data/crm.db
   لپ‌تاپ مدیر ─────▶│  192.168.1.50:3000           │──▶ backups/
                    └──────────────────────────────┘
                                  ▲
                                  │ Cloudflare Tunnel (اختیاری)
                                  │
                            crm.myshop.ir
```

> **مهم:** یک دیتابیس، یک منبع حقیقت. هیچ «سینک»ی لازم نیست چون نسخهٔ دومی وجود ندارد.

---

## ۰. پیش‌نیازها

| مورد | نسخه |
|---|---|
| Node.js | ۲۲ یا بالاتر (LTS) |
| ویندوز | ۱۰/۱۱ (یا لینوکس) |
| رم | ۲ گیگ کافی است |
| UPS | توصیهٔ جدی — برق رفتن وسط نوشتن در دیتابیس ریسک دارد |

---

## ۱. نصب اولیه

```bash
git clone https://github.com/HOZLOLi/CRM.git
cd CRM
npm ci
```

### ساخت فایل `.env`

```bash
cp .env.example .env
```

سپس `AUTH_SECRET` را پر کن:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

مقدار خروجی را در `.env` بگذار:

```ini
DATABASE_URL="file:../data/crm.db"
AUTH_SECRET="<رشتهٔ ۶۴ کاراکتری>"
COOKIE_SECURE="auto"
AI_BASE_URL="https://openrouter.ai/api/v1"
AI_API_KEY=""
AI_MODEL="openai/gpt-4o-mini"
```

> `COOKIE_SECURE="auto"` را دست نزن. روی LAN (http) کوکی `Secure` نمیشود و روی
> تونل (https) خودکار `Secure` میشود. اگر `true` بگذاری، ورود از تبلت‌های داخل
> مغازه شکست میخورد.

### ساخت دیتابیس و داده اولیه

```bash
npm run setup
```

### ساخت نسخهٔ پروداکشن

```bash
npm run build
```

### اجرا

```bash
npm run start:prod
```

خروجی چیزی شبیه این است:

```
✓ Environment OK
  Local:   http://localhost:3000
  Network: http://192.168.1.50:3000   ← از دستگاه‌های دیگر این را باز کنید
```

---

## ۲. اجرای خودکار با روشن شدن ویندوز

PowerShell را **با دسترسی Administrator** باز کن:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-autostart.ps1
```

این یک Scheduled Task با نام `FiroozehCRM` میسازد که با بوت سیستم و بدون نیاز به
ورود کاربر اجرا میشود.

```powershell
Start-ScheduledTask -TaskName FiroozehCRM      # اجرای دستی
Get-ScheduledTask  -TaskName FiroozehCRM      # وضعیت
Unregister-ScheduledTask -TaskName FiroozehCRM -Confirm:$false   # حذف
```

### فایروال ویندوز

یکبار اجازهٔ پورت ۳۰۰۰ را بده (PowerShell ادمین):

```powershell
New-NetFirewallRule -DisplayName "Firoozeh CRM" -Direction Inbound `
  -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private
```

> پروفایل `Private` کافی است — شبکهٔ مغازه را در ویندوز روی «Private» بگذار، نه «Public».

---

## ۳. پشتیبان‌گیری

### دستی

```bash
npm run db:backup
```

خروجی: `backups/crm-YYYYMMDD-HHmmss.db` — یک کپی سالم و فشرده‌شده از دیتابیس،
بدون نیاز به خاموش کردن سرور (`VACUUM INTO`).

### خودکار (روزانه ۰۲:۳۰، نگه‌داری ۱۴ نسخه)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-backup-task.ps1
```

### بازیابی

```bash
# ۱. سرور را متوقف کن
Stop-ScheduledTask -TaskName FiroozehCRM

# ۲. دیتابیس فعلی را کنار بگذار
move data\crm.db data\crm.db.broken

# ۳. آخرین پشتیبان را برگردان
copy backups\crm-20261112-023000.db data\crm.db

# ۴. سرور را روشن کن
Start-ScheduledTask -TaskName FiroozehCRM
```

> پشتیبان‌ها را روی **درایو دوم** یا فضای ابری هم کپی کن. پشتیبان روی همان دیسکی
> که خراب میشود، پشتیبان نیست.

---

## ۴. دسترسی از بیرون مغازه

### گزینهٔ الف — Cloudflare Tunnel (توصیه‌شده)

بدون IP ثابت، بدون port forwarding، با HTTPS خودکار.

```bash
winget install --id Cloudflare.cloudflared
cloudflared tunnel login
cloudflared tunnel create firoozeh
cloudflared tunnel route dns firoozeh crm.myshop.ir
cloudflared tunnel run --url http://localhost:3000 firoozeh
```

برای اجرای دائمی بهعنوان سرویس:

```powershell
cloudflared service install
```

چون ترافیک از تونل میآید، `x-forwarded-proto: https` ست میشود و کوکی خودکار
`Secure` میشود — نیازی به تغییر `.env` نیست.

### گزینهٔ ب — Tailscale (شبکهٔ خصوصی)

اگر نمیخواهی برنامه روی اینترنت عمومی باشد و فقط خودت/تیمت دسترسی داشته باشند:

```bash
winget install Tailscale.Tailscale
tailscale up
```

سپس از هر دستگاه عضو شبکه: `http://<tailscale-ip>:3000`

### ❌ گزینهٔ نامناسب — port forwarding

IP ثابت + گواهی TLS + سختسازی سرور روی دوش خودت. برای این پروژه توصیه نمیشود.

---

## ۵. نصب روی گوشی و ویندوز (PWA)

برنامه یک PWA کامل است:

- **اندروید (Chrome):** منو → «افزودن به صفحهٔ اصلی»
- **iOS (Safari):** دکمهٔ Share → «Add to Home Screen»
- **ویندوز (Chrome/Edge):** آیکون نصب در نوار آدرس → «Install»

بعد از نصب، تمامصفحه و بدون نوار مرورگر باز میشود. اگر اتصال قطع شود، صفحهٔ
«بدون اتصال» نمایش داده میشود و صفحههای بازشدهٔ قبلی از حافظه میآیند.

> PWA فقط روی **HTTPS یا localhost** نصب میشود. روی `http://192.168.1.50` مرورگر
> اجازهٔ نصب نمیدهد — برای نصب روی گوشی از تونل HTTPS استفاده کن.

---

## ۶. Docker (جایگزین)

اگر Docker داری:

```bash
docker compose up -d --build
docker compose logs -f
```

داده و پشتیبان روی میزبان میمانند: `./data` و `./backups`.
سلامت سرویس: `curl http://localhost:3000/api/health`

---

## ۷. عیب‌یابی

| نشانه | علت | راه‌حل |
|---|---|---|
| از تبلت لاگین نمیشود، از خود سرور میشود | کوکی `Secure` روی http | `COOKIE_SECURE="auto"` |
| `Cannot start in production: AUTH_SECRET` | `.env` ناقص | `AUTH_SECRET` را ست کن |
| `database is locked` | نوشتن همزمان زیاد | WAL و `busy_timeout` خودکار فعال است؛ اگر ادامه داشت به PostgreSQL مهاجرت کن |
| دستگاه‌های دیگر صفحه را باز نمیکنند | فایروال / پروفایل شبکه | قانون فایروال + شبکهٔ Private |
| `EADDRINUSE` | نمونهٔ قبلی هنوز بالاست | `Get-Process node \| Stop-Process` |
| فونت‌ها یا آیکون‌ها لود نمیشوند | کش مرورگر | `Ctrl+Shift+R` |

### بررسی سلامت

```bash
curl http://localhost:3000/api/health
# {"ok":true,"database":"up","latencyMs":3,"records":{"users":3,"deals":12}}
```

---

## ۸. چه زمانی به PostgreSQL مهاجرت کنیم؟

SQLite برای یک مغازه با ۵–۱۰ دستگاه همزمان کافی است. مهاجرت لازم میشود وقتی:

- بیش از ~۲۰ کاربر همزمان داری
- چند شعبه با دسترسی همزمان داری
- میخواهی سرور روی فضای ابری باشد و از چند جا وصل شوی

مهاجرت:

1. `prisma/schema.prisma` → `provider = "postgresql"`
2. `DATABASE_URL` → رشتهٔ اتصال Postgres
3. `npm run db:push && npm run db:seed`

هیچ کد اپلیکیشنی تغییر نمیکند.
