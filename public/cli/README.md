# BubbleUp CLI - Installation Files

This directory contains the standalone BubbleUp CLI files hosted on Vercel.

## Quick Install

### Windows (PowerShell)
```powershell
irm https://bubble-up.vercel.app/cli/install.ps1 | iex
```

### macOS/Linux (Bash)
```bash
curl -fsSL https://bubble-up.vercel.app/cli/install.sh | bash
```

## What Gets Installed

The installer downloads and sets up:
- `bubble.js` - Main CLI tool (all 11 features including documentation)
- `setup.js` - User setup wizard
- `package.json` - Minimal dependencies
- `.env.template` - Supabase configuration template

Total installation size: ~5MB

## Manual Installation

If you prefer to download files manually:

1. Download the files:
   - https://bubble-up.vercel.app/cli/package.json
   - https://bubble-up.vercel.app/cli/bubble.js
   - https://bubble-up.vercel.app/cli/setup.js
   - https://bubble-up.vercel.app/cli/.env.template

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.template .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. Run setup wizard:
   ```bash
   node setup.js
   ```

## Support

- Contact: Mark Weston
- Email: mark.weston@regulativ.ai

## Version

Version: 1.1.0
Last Updated: 2025-10-09
