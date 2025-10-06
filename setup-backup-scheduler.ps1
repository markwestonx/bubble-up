# BubbleUp Backup Scheduler Setup for Windows Task Scheduler
# Run this script as Administrator to set up automated hourly backups

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backupScript = Join-Path $scriptPath "automated-backup.js"
$nodePath = (Get-Command node).Source

Write-Host "================================" -ForegroundColor Cyan
Write-Host "BubbleUp Backup Scheduler Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host ""
    Write-Host "Right-click PowerShell and select 'Run as Administrator', then run this script again." -ForegroundColor Yellow
    Write-Host ""
    Pause
    Exit 1
}

Write-Host "Node.js path: $nodePath" -ForegroundColor Green
Write-Host "Backup script: $backupScript" -ForegroundColor Green
Write-Host ""

# Delete existing task if it exists
$existingTask = Get-ScheduledTask -TaskName "BubbleUp-Hourly-Backup" -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing backup task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName "BubbleUp-Hourly-Backup" -Confirm:$false
}

# Create scheduled task action
$action = New-ScheduledTaskAction -Execute $nodePath -Argument "`"$backupScript`"" -WorkingDirectory $scriptPath

# Create trigger for hourly backups between 07:00 and 00:00 UK time
# We'll create multiple triggers for each hour
$triggers = @()

# 07:00 to 23:00 (every hour on the hour)
for ($hour = 7; $hour -le 23; $hour++) {
    $trigger = New-ScheduledTaskTrigger -Daily -At ([datetime]::Today.AddHours($hour))
    $triggers += $trigger
}

# 00:00 (midnight)
$midnightTrigger = New-ScheduledTaskTrigger -Daily -At "00:00"
$triggers += $midnightTrigger

# Create task settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -MultipleInstances IgnoreNew

# Create principal (run whether user is logged on or not)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType S4U -RunLevel Highest

# Register the task
Write-Host "Creating scheduled task 'BubbleUp-Hourly-Backup'..." -ForegroundColor Cyan

# We need to register with first trigger, then add the rest
Register-ScheduledTask `
    -TaskName "BubbleUp-Hourly-Backup" `
    -Action $action `
    -Trigger $triggers[0] `
    -Settings $settings `
    -Principal $principal `
    -Description "Automated hourly backups for BubbleUp database (07:00-00:00 UK time) using Grandfather-Father-Son rotation" | Out-Null

# Add remaining triggers
$task = Get-ScheduledTask -TaskName "BubbleUp-Hourly-Backup"
for ($i = 1; $i -lt $triggers.Count; $i++) {
    $task.Triggers += $triggers[$i]
}
Set-ScheduledTask -InputObject $task | Out-Null

Write-Host ""
Write-Host "✅ Backup scheduler installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Schedule Details:" -ForegroundColor Cyan
Write-Host "   - Task Name: BubbleUp-Hourly-Backup" -ForegroundColor White
Write-Host "   - Frequency: Hourly from 07:00 to 00:00 UK time" -ForegroundColor White
Write-Host "   - Retention: Son 7 days, Father 28 days, Grandfather 84 days" -ForegroundColor White
Write-Host "   - Location: $scriptPath\backups" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Testing backup now..." -ForegroundColor Cyan
Write-Host ""

# Run a test backup
& $nodePath $backupScript

Write-Host ""
Write-Host "📌 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Check Task Scheduler to verify the task" -ForegroundColor White
Write-Host "   2. Check $scriptPath\backups for backup files" -ForegroundColor White
Write-Host "   3. Backups will run automatically every hour 07:00-00:00 UK time" -ForegroundColor White
Write-Host ""
Write-Host "To manually run a backup, use: npm run backup" -ForegroundColor Yellow
Write-Host "To view scheduled tasks: taskschd.msc" -ForegroundColor Yellow
Write-Host ""

Pause
