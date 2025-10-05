# BubbleUp CLI - Standalone Installer (Vercel-hosted)
# Usage: irm https://your-app.vercel.app/cli/install.ps1 | iex

$ErrorActionPreference = "Stop"

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         🎯 BubbleUp CLI - Quick Installer                    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get the base URL from the script source
$baseUrl = "https://bubbleup.vercel.app/cli"

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
try {
    Invoke-WebRequest -Uri "$baseUrl/package.json" -OutFile "package.json"
    Invoke-WebRequest -Uri "$baseUrl/bubble.js" -OutFile "bubble.js"
    Invoke-WebRequest -Uri "$baseUrl/setup.js" -OutFile "setup.js"
    Invoke-WebRequest -Uri "$baseUrl/.env.template" -OutFile ".env.template"
} catch {
    Write-Host "❌ Failed to download files: $_" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install --silent
} catch {
    Write-Host "❌ Failed to install dependencies. Make sure Node.js is installed." -ForegroundColor Red
    exit 1
}

# Create .env.local from template
if (-not (Test-Path ".env.local")) {
    Write-Host ""
    Write-Host "⚙️  Creating .env.local from template..." -ForegroundColor Yellow
    Copy-Item ".env.template" ".env.local"
}

# Get Supabase key from user
Write-Host ""
Write-Host "🔑 Supabase Configuration" -ForegroundColor Cyan
Write-Host ""
$supabaseKey = Read-Host "Enter your Supabase service role key (or press Enter to configure later)"

if ($supabaseKey) {
    (Get-Content ".env.local") -replace 'your-service-role-key-here', $supabaseKey | Set-Content ".env.local"
    Write-Host "✅ Supabase key configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  You'll need to edit .env.local manually with your Supabase key" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ INSTALLATION COMPLETE!                 ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. Run the setup wizard:" -ForegroundColor White
Write-Host "      cd $installDir" -ForegroundColor Gray
Write-Host "      node setup.js" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Test the CLI:" -ForegroundColor White
Write-Host "      node bubble.js" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. (Optional) Add /bubble slash command to Claude Code" -ForegroundColor White
Write-Host "      The setup wizard will do this for you" -ForegroundColor Gray
Write-Host ""
Write-Host "📧 Questions? Contact Mark Weston (mark.weston@regulativ.ai)" -ForegroundColor Cyan
Write-Host ""
