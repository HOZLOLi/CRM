<#
  اجرای خودکار فیروزه با روشن شدن ویندوز.

  اجرا در PowerShell با دسترسی Administrator:
      powershell -ExecutionPolicy Bypass -File scripts\install-autostart.ps1

  حذف:
      Unregister-ScheduledTask -TaskName "FiroozehCRM" -Confirm:$false
#>
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$script = Join-Path $PSScriptRoot "start-server.cmd"
$taskName = "FiroozehCRM"

if (-not (Test-Path $script)) { throw "start-server.cmd پیدا نشد: $script" }

$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$script`"" -WorkingDirectory $root
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit (New-TimeSpan -Days 0)

# اجرا با بالاترین دسترسی، بدون نیاز به ورود کاربر
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
    -Settings $settings -Principal $principal -Force | Out-Null

Write-Host ""
Write-Host "✓ تسک '$taskName' ساخته شد — فیروزه با روشن شدن ویندوز اجرا می‌شود." -ForegroundColor Green
Write-Host "  اجرای دستی همین حالا:  Start-ScheduledTask -TaskName $taskName" -ForegroundColor Gray
Write-Host "  مشاهده وضعیت:          Get-ScheduledTask -TaskName $taskName" -ForegroundColor Gray
Write-Host ""
