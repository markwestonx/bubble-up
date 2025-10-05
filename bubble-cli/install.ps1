# BubbleUp CLI - One-Command Installer (Windows PowerShell)
# Usage: irm https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/install.ps1 | iex

$ErrorActionPreference = "Stop"

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         🎯 BubbleUp CLI - Quick Installer                    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Determine install location
$desktopPath = [Environment]::GetFolderPath("Desktop")
if (Test-Path "$desktopPath") {
    $installDir = "$desktopPath\bubbleup-cli"
} else {
    $installDir = "$HOME\bubbleup-cli"
}

Write-Host "📁 Installing to: $installDir" -ForegroundColor Yellow
Write-Host ""

# Create directory
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Set-Location $installDir

# Download files
Write-Host "📥 Downloading BubbleUp CLI files..." -ForegroundColor Yellow
$baseUrl = "https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli"

Invoke-WebRequest -Uri "$baseUrl/package.json" -OutFile "package.json"
Invoke-WebRequest -Uri "$baseUrl/bubble.js" -OutFile "bubble.js"
Invoke-WebRequest -Uri "$baseUrl/setup.js" -OutFile "setup.js"
Invoke-WebRequest -Uri "$baseUrl/.env.template" -OutFile ".env.template"

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies (just @supabase/supabase-js)..." -ForegroundColor Yellow
npm install --silent

# Check for .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host ""
    Write-Host "⚠️  Creating .env.local from template..." -ForegroundColor Yellow
    Copy-Item ".env.template" ".env.local"
    Write-Host "   Please edit $installDir\.env.local with your Supabase credentials" -ForegroundColor Red
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ INSTALLATION COMPLETE!                 ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. Edit .env.local with your Supabase service key" -ForegroundColor White
Write-Host "   2. Run the setup wizard:" -ForegroundColor White
Write-Host "      cd $installDir" -ForegroundColor Gray
Write-Host "      node setup.js" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Test the CLI:" -ForegroundColor White
Write-Host "      node bubble.js" -ForegroundColor Gray
Write-Host ""
Write-Host "   4. (Optional) Add /bubble slash command to Claude Code" -ForegroundColor White
Write-Host ""
