# 🎯 BubbleUp CLI - Standalone Installation

**Lightweight CLI tool for BubbleUp backlog management**

No need to clone the entire Next.js application - this is a standalone package with only the essential dependencies.

---

## ⚡ Quick Install

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/install.ps1 | iex
```

### macOS/Linux (Bash)
```bash
curl -fsSL https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/install.sh | bash
```

---

## 📦 What Gets Installed

**Total size: ~5MB** (vs 400MB+ for full Next.js app)

```
bubbleup-cli/
├── package.json          (2 dependencies only)
├── bubble.js            (main CLI tool)
├── setup.js             (setup wizard)
├── .env.template        (Supabase config template)
└── node_modules/
    ├── @supabase/supabase-js
    └── dotenv
```

---

## 🚀 Manual Installation

If you prefer manual installation:

```bash
# 1. Create directory
mkdir bubbleup-cli
cd bubbleup-cli

# 2. Download files
curl -O https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/package.json
curl -O https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/bubble.js
curl -O https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/setup.js
curl -O https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/.env.template

# 3. Install dependencies (just 2 packages)
npm install

# 4. Configure environment
cp .env.template .env.local
# Edit .env.local with your Supabase credentials

# 5. Run setup wizard
node setup.js

# 6. Test
node bubble.js
```

---

## ⚙️ Setup Steps

### 1. Configure Supabase

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://bzqgoppjuynxfyrrhsbg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key-here
```

### 2. Run Setup Wizard

```bash
node setup.js
```

This will:
- ✅ Collect your user information
- ✅ Create `.bubbleup-config.json` in 3 locations
- ✅ Set up the `/bubble` slash command for Claude Code
- ✅ Validate your environment

### 3. Test the CLI

```bash
node bubble.js
```

---

## 🎯 Using with Claude Code

The setup wizard automatically creates:

**File:** `~/.claude/commands/bubble.md`

**Content:**
```markdown
---
description: BubbleUp story manager
allowed-tools: Bash(node:*), Bash(cd:*)
---

cd /path/to/bubbleup-cli && node bubble.js
```

After setup, just type `/bubble` in Claude Code!

---

## 📋 Features

All 10 features work identically to the full application:

**Core Features:**
1. ➕ Add a story
2. ❌ Delete a story
3. ✏️ Edit a story
4. 📁 Add a new project
5. 🔍 View/search stories
6. 📊 Change status

**Additional Features:**
7. 👥 Reassign story
8. ⚡ Update priority/effort
9. ⭐ Mark as "Next up"
10. 📈 View project stats

---

## 🔄 Updates

To update to the latest version:

```bash
cd bubbleup-cli

# Backup your configs
cp .env.local .env.local.backup
cp ~/.bubbleup-config.json ~/.bubbleup-config.json.backup

# Download latest files
curl -O https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/bubble.js
curl -O https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/setup.js
curl -O https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/package.json

# Update dependencies
npm install
```

Your `.env.local` and `.bubbleup-config.json` files are preserved.

---

## 🛠 Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### "Config not found"
```bash
node setup.js
```

### "/bubble command not working"
1. Check `~/.claude/commands/bubble.md` exists
2. Update the path in bubble.md to match your installation directory
3. Restart Claude Code

---

## 📊 Comparison: Standalone vs Full App

| Aspect | Standalone CLI | Full Next.js App |
|--------|---------------|------------------|
| **Installation size** | ~5MB | ~400MB |
| **Dependencies** | 2 packages | 300+ packages |
| **Install time** | < 10 seconds | 2-3 minutes |
| **Features** | All 10 CLI features | CLI + Web UI |
| **Requirements** | Node.js only | Node.js + dev tools |
| **Updates** | Download 2 files | git pull + rebuild |

**When to use standalone:** You only need the `/bubble` command for backlog management

**When to use full app:** You're developing the web UI or working on the BubbleUp codebase

---

## 📞 Support

- **Issues:** https://github.com/markwestonx/bubble-up/issues
- **Email:** mark.weston@regulativ.ai

---

**Version:** 1.0.0
**Last Updated:** 2025-10-05
