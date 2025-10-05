#!/bin/bash
# BubbleUp CLI - One-Command Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/install.sh | bash

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         🎯 BubbleUp CLI - Quick Installer                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Determine install location
if [ -d "$HOME/OneDrive/Desktop" ]; then
  INSTALL_DIR="$HOME/OneDrive/Desktop/bubbleup-cli"
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
curl -fsSL https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/package.json -o package.json
curl -fsSL https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/bubble.js -o bubble.js
curl -fsSL https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/setup.js -o setup.js
curl -fsSL https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/.env.template -o .env.template

# Install dependencies
echo ""
echo "📦 Installing dependencies (just @supabase/supabase-js)..."
npm install --silent

# Check for .env.local
if [ ! -f .env.local ]; then
  echo ""
  echo "⚠️  Creating .env.local from template..."
  cp .env.template .env.local
  echo "   Please edit $INSTALL_DIR/.env.local with your Supabase credentials"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ INSTALLATION COMPLETE!                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "   1. Edit .env.local with your Supabase service key"
echo "   2. Run the setup wizard:"
echo "      cd $INSTALL_DIR"
echo "      node setup.js"
echo ""
echo "   3. Test the CLI:"
echo "      node bubble.js"
echo ""
echo "   4. (Optional) Add /bubble slash command to Claude Code"
echo ""
