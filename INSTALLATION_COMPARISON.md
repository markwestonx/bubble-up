# BubbleUp CLI - Installation Methods Comparison

**TL;DR:** Use the **Standalone CLI** approach - it's 80x smaller and 20x faster to install.

---

## 📊 Comparison

| Aspect | Standalone CLI (New) | Full Application (Old) |
|--------|---------------------|------------------------|
| **Installation size** | ~5MB | ~400MB |
| **Dependencies** | 17 packages | 300+ packages |
| **Install time** | ~3 seconds | ~2-3 minutes |
| **Download method** | One curl/irm command | Clone full git repo |
| **Features** | All 10 CLI features | CLI + Web UI + Dev tools |
| **Requirements** | Node.js only | Node.js + Next.js + Build tools |
| **Updates** | Download 3 files | git pull + npm install |
| **Use case** | Just need `/bubble` command | Developing the web app |

---

## ✅ Recommended: Standalone CLI

### Installation

**Windows:**
```powershell
irm https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/install.ps1 | iex
```

**macOS/Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/install.sh | bash
```

### What It Includes

```
bubbleup-cli/
├── bubble.js             (32 KB - main CLI tool)
├── setup.js              (8 KB - setup wizard)
├── package.json          (2 dependencies)
└── node_modules/         (5 MB)
    ├── @supabase/supabase-js
    └── dotenv
```

### Pros
- ✅ **Tiny footprint:** 5MB vs 400MB
- ✅ **Fast install:** 3 seconds vs 3 minutes
- ✅ **Simple updates:** Download 3 files
- ✅ **No build step:** Just Node.js
- ✅ **Same functionality:** All 10 features work identically

### Cons
- ❌ No web UI (CLI only)
- ❌ Can't develop/modify the app

---

## 🔧 Alternative: Full Application

### Installation

```bash
cd C:\Users\<You>\OneDrive\Desktop
git clone https://github.com/markwestonx/bubble-up.git
cd bubble-up
npm install  # Takes 2-3 minutes, downloads 300+ packages
node setup-bubble-user.js
```

### What It Includes

```
bubble-up/
├── app/                  (Next.js application)
├── components/           (React components)
├── lib/                  (Utilities)
├── public/               (Static assets)
├── bubble-story-creator.js
├── setup-bubble-user.js
├── package.json          (30+ dependencies)
└── node_modules/         (400 MB)
```

### Pros
- ✅ Full web UI at localhost:3000
- ✅ Can develop/modify the application
- ✅ All source code available
- ✅ Can contribute to the project

### Cons
- ❌ **Massive:** 400MB installation
- ❌ **Slow:** 2-3 minute install
- ❌ **Overkill:** If you just need `/bubble` command
- ❌ **Requires build tools:** TypeScript, Next.js, etc.

---

## 🎯 Which Should You Use?

### Use **Standalone CLI** if:
- ✅ You just want to use the `/bubble` command
- ✅ You're on a new machine/user setup
- ✅ You don't need the web UI
- ✅ You want minimal installation

### Use **Full Application** if:
- ✅ You're developing BubbleUp features
- ✅ You need the web UI
- ✅ You're contributing to the codebase
- ✅ You want to customize the app

---

## 📝 Installation Instructions

### Standalone CLI
See: `bubble-cli/README.md`

### Full Application
See: `BUBBLE_COMMAND_SETUP.md`

---

## 🔄 Migration

Already have the full app installed? You can switch to standalone:

```bash
# Backup your configs
cp .env.local ~/bubbleup-cli/.env.local.backup
cp ~/.bubbleup-config.json ~/.bubbleup-config.json.backup

# Install standalone
curl -fsSL https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/install.sh | bash

# Restore configs
cp ~/bubbleup-cli/.env.local.backup ~/bubbleup-cli/.env.local
cp ~/.bubbleup-config.json.backup ~/.bubbleup-config.json

# Update slash command path in ~/.claude/commands/bubble.md
```

---

## ❓ FAQ

### Q: Will both methods work the same?
**A:** Yes, identical functionality. The CLI tool is the same file (`bubble.js`), just different installation methods.

### Q: Can I have both installed?
**A:** Yes, but you'll need to choose which one your `/bubble` slash command points to.

### Q: Which one does the API use?
**A:** Both use the same Supabase API endpoints. The CLI is just a client.

### Q: How do I update?
**Standalone:**
```bash
cd bubbleup-cli
curl -O https://raw.githubusercontent.com/markwestonx/bubble-up/main/bubble-cli/bubble.js
```

**Full app:**
```bash
cd bubble-up
git pull
npm install
```

### Q: What if I need both CLI and web UI?
**A:** Install the full application. It includes everything.

---

**Recommendation:** Start with **Standalone CLI**. If you later need the web UI or want to contribute code, install the full application.

**Version:** 1.0.0
**Last Updated:** 2025-10-05
