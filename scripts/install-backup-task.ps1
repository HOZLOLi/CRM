<#
  پشتیبان‌گیری روزانه خودکار از دیتابیس.

  اجرا در PowerShell با دسترسی Administrator:
      powershell -ExecutionPolicy Bypass -File scripts\install-backup-task.ps1

  حذف:
      Unregister-ScheduledTask -TaskName "FiroozehCRM-Backup" -Confirm:$false
#>
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$taskName = "FiroozehCRM-Backup"
$time = "02:30"

$action = New-ScheduledTaskAction `
    -Execute "node.exe" `
    -Argument "--env-file-if-exists=.env scripts/backup.mjs --keep 14" `
    -WorkingDirectory $root

$trigger = New-ScheduledTaskTrigger -Daily -At $time
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
    -Settings $settings -Principal $principal -Force | Out-Null

Write-Host ""
Write-Host "✓ تسک '$taskName' ساخته شد — هر روز ساعت $time پشتیبان می‌گیرد (۱۴ نسخه نگه‌داری)." -ForegroundColor Green
Write-Host "  مقصد: $root\backups" -ForegroundColor Gray
Write-Host ""
