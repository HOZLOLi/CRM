@echo off
setlocal
cd /d "%~dp0.."

if not exist "data"    mkdir "data"
if not exist "backups" mkdir "backups"

echo.
echo === فیروزه CRM ===
node --env-file-if-exists=.env scripts/check-env.mjs
if errorlevel 1 (
  echo.
  echo سرور اجرا نشد. فایل .env را اصلاح کنید.
  pause
  exit /b 1
)

node node_modules\next\dist\bin\next start -H 0.0.0.0
