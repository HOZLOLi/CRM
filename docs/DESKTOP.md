# اپ دسکتاپ فیروزه

نسخهٔ نصب‌شدنی ویندوز با دیتابیس اختصاصی خودش. هیچ اینترنت، مرورگر، ترمینال یا
نصب Node لازم نیست.

## نصب

فایل `Firoozeh-Setup-<version>.exe` را از بخش **Releases** بگیر و اجرا کن.

- میان‌بر روی دسکتاپ و منوی استارت ساخته می‌شود
- دیتابیس در `%APPDATA%\Firoozeh\crm.db` ساخته می‌شود
- ورود اولیه: `manager@firoozeh.ir` / `demo1234`

## داده کجاست؟

```
%APPDATA%\Firoozeh\
├── crm.db            ← دیتابیس (کل دادهٔ تو)
├── auth.secret       ← راز امضای نشست
├── runtime\server\   ← سرور استخراج‌شده
├── server.log        ← لاگ سرور
└── Cache, ...        ← حافظهٔ مرورگر داخلی
```

> **پشتیبان:** فقط `crm.db` را کپی کن. یا از منوی برنامه → «پوشهٔ داده» را باز کن.

## ساخت مجدد از سورس

```bash
npm ci
npm run desktop:db       # ساخت دیتابیس پایه (اسکیما + کاربران + کالاها)
npm run desktop:build    # build + بسته‌بندی → release/Firoozeh-Setup-x.y.z.exe
```

| دستور | کار |
|---|---|
| `npm run desktop:db` | ساخت `desktop/base.db` |
| `npm run desktop:prepare` | build + آماده‌سازی `.desktop-build/` |
| `npm run desktop:build` | همه‌چیز + ساخت installer |
| `npm run desktop:dev` | اجرای Electron با سرور محلی |

## معماری بسته

```
Electron (پنجره + منو)
   └─ spawn: electron-as-node  →  server.js (Next.js standalone)
                                       └─ SQLite در AppData
```

- سرور روی `127.0.0.1` و پورت آزاد (پیش‌فرض ۳۴۱۱۵) اجرا می‌شود
- `AUTH_SECRET` یک‌بار ساخته و پایدار می‌ماند
- `COOKIE_SECURE=false` چون روی `http://127.0.0.1` است
- سرور از `server.tar.gz` در اولین اجرا استخراج می‌شود
  (electron-builder پوشه‌های نقطه‌دار و `node_modules` را در `extraResources` فیلتر می‌کند)

## عیب‌یابی

| نشانه | راه‌حل |
|---|---|
| صفحهٔ سفید | `%APPDATA%\Firoozeh\server.log` را ببین |
| «سرور بالا نیامد» | پورت ۳۴۱۱۵ اشغال است؛ برنامه بعدی را می‌بندد و پورت بعدی را می‌گیرد |
| ریست کامل | پوشهٔ `%APPDATA%\Firoozeh` را پاک کن (همهٔ داده می‌رود) |
