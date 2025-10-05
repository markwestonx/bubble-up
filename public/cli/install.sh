#!/bin/bash
# BubbleUp CLI - Standalone Installer (Vercel-hosted)
# Usage: curl -fsSL https://your-app.vercel.app/cli/install.sh | bash

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         🎯 BubbleUp CLI - Quick Installer                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Base URL for downloads
BASE_URL="https://bubble-up.vercel.app/cli"

# Determine install location
if [ -d "$HOME/Desktop" ]; then
  INSTALL_DIR="$HOME/Desktop/bubbleup-cli"
else
  INSTALL_DIR="$HOME/bubbleup-cli"
fi

echo "📁 Installing to: $INSTALL_DIR"
echo ""

# Create directory
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Download files
echo "📥 Downloading BubbleUp CLI files..."
curl -fsSL "$BASE_URL/package.json" -o package.json || { echo "❌ Failed to download package.json"; exit 1; }
curl -fsSL "$BASE_URL/bubble.js" -o bubble.js || { echo "❌ Failed to download bubble.js"; exit 1; }
curl -fsSL "$BASE_URL/setup.js" -o setup.js || { echo "❌ Failed to download setup.js"; exit 1; }
curl -fsSL "$BASE_URL/.env.template" -o .env.template || { echo "❌ Failed to download .env.template"; exit 1; }

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --silent || { echo "❌ Failed to install dependencies. Make sure Node.js is installed."; exit 1; }

# Create .env.local from template
if [ ! -f .env.local ]; then
  echo ""
  echo "⚙️  Creating .env.local from template..."
  cp .env.template .env.local
fi

# Get Supabase key from user
echo ""
echo "🔑 Supabase Configuration"
echo ""
read -p "Enter your Supabase service role key (or press Enter to configure later): " SUPABASE_KEY

if [ ! -z "$SUPABASE_KEY" ]; then
  sed -i.bak "s/your-service-role-key-here/$SUPABASE_KEY/" .env.local
  rm .env.local.bak 2>/dev/null || true
  echo "✅ Supabase key configured"
else
  echo "⚠️  You'll need to edit .env.local manually with your Supabase key"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ INSTALLATION COMPLETE!                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "   1. Run the setup wizard:"
echo "      cd $INSTALL_DIR"
echo "      node setup.js"
echo ""
echo "   2. Test the CLI:"
echo "      node bubble.js"
echo ""
echo "   3. (Optional) Add /bubble slash command to Claude Code"
echo "      The setup wizard will do this for you"
echo ""
echo "📧 Questions? Contact Mark Weston (mark.weston@regulativ.ai)"
echo ""
