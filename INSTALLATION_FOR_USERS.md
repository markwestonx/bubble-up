# 🎯 BubbleUp CLI - Installation Guide for Users

**Simple installation guide for team members (no GitHub access needed)**

---

## ⚡ Quick Install

### Windows Users (PowerShell)

1. Open PowerShell (right-click Start → Windows PowerShell)

2. Run this command:
```powershell
irm https://bubble-up.vercel.app/cli/install.ps1 | iex
```

3. When prompted, enter your **Supabase service role key** (ask Mark if you don't have it)

4. Run the setup wizard:
```powershell
cd Desktop\bubbleup-cli
node setup.js
```

5. Follow the prompts to enter:
   - Your full name
   - Your email
   - Your Supabase UUID (ask Mark)
   - Aliases (shortcuts like "me", your first name, etc.)

6. Restart Claude Code

7. Test by typing `/bubble` in Claude Code

---

### macOS/Linux Users (Terminal)

1. Open Terminal

2. Run this command:
```bash
curl -fsSL https://bubble-up.vercel.app/cli/install.sh | bash
```

3. When prompted, enter your **Supabase service role key** (ask Mark if you don't have it)

4. Run the setup wizard:
```bash
cd ~/Desktop/bubbleup-cli
node setup.js
```

5. Follow the prompts to enter:
   - Your full name
   - Your email
   - Your Supabase UUID (ask Mark)
   - Aliases (shortcuts like "me", your first name, etc.)

6. Restart Claude Code

7. Test by typing `/bubble` in Claude Code

---

## 📋 What You Need Before Installing

Before you start, make sure you have:

1. ✅ **Node.js installed** (version 18 or higher)
   - Check: Open terminal/PowerShell and type `node --version`
   - If not installed: Download from https://nodejs.org

2. ✅ **Claude Code installed**
   - Download from https://claude.ai/claude-code

3. ✅ **Your credentials** (ask Mark Weston for these):
   - Supabase service role key
   - Your Supabase user UUID

---

## 🎯 Using BubbleUp CLI

Once installed, you can use the `/bubble` command in Claude Code to access all features:

### Main Features

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

### Quick Start

```
In Claude Code, type: /bubble
Select an option from the menu
Follow the prompts
```

---

## 🛠 Troubleshooting

### "node: command not found"
**Problem:** Node.js is not installed

**Solution:** Download and install Node.js from https://nodejs.org

### "Failed to download files"
**Problem:** Cannot reach Vercel deployment

**Solution:**
1. Check your internet connection
2. Confirm the URL is correct: https://bubble-up.vercel.app
3. Contact Mark if the problem persists

### "Config not found" when running /bubble
**Problem:** Setup wizard wasn't completed

**Solution:**
```bash
cd Desktop\bubbleup-cli    # Windows
cd ~/Desktop/bubbleup-cli   # Mac/Linux
node setup.js
```

### "/bubble command not working"
**Problem:** Slash command not set up

**Solution:**
1. Run the setup wizard: `node setup.js`
2. The wizard automatically creates the `/bubble` command
3. Restart Claude Code
4. Try typing `/bubble` again

### "Invalid Supabase credentials"
**Problem:** Wrong service role key or missing .env.local

**Solution:**
```bash
cd Desktop\bubbleup-cli    # Windows
cd ~/Desktop/bubbleup-cli   # Mac/Linux

# Edit .env.local with the correct key
notepad .env.local         # Windows
nano .env.local            # Mac/Linux
```

Make sure it contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://bzqgoppjuynxfyrrhsbg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-actual-key-here
```

---

## 🔄 Updating BubbleUp CLI

To get the latest version:

### Windows
```powershell
cd Desktop\bubbleup-cli
curl.exe -O https://bubble-up.vercel.app/cli/bubble.js
curl.exe -O https://bubble-up.vercel.app/cli/setup.js
npm install
```

### macOS/Linux
```bash
cd ~/Desktop/bubbleup-cli
curl -O https://bubble-up.vercel.app/cli/bubble.js
curl -O https://bubble-up.vercel.app/cli/setup.js
npm install
```

Your `.env.local` and `.bubbleup-config.json` files are preserved during updates.

---

## 💡 Tips

### Quick Assignment
When creating stories, you can assign to yourself by typing `me` instead of your full name.

You can also use any alias you set up during installation.

### Finding Story IDs
Use option 5 (View/search stories) to find story IDs, then use other options to edit/delete/update them.

### Multiple Operations
The menu loops, so you can perform multiple operations in one session without restarting.

---

## 📞 Support

**Having issues or questions?**

- **Contact:** Mark Weston
- **Email:** mark.weston@regulativ.ai

Please include:
- What you were trying to do
- The exact error message you saw
- Your operating system (Windows/Mac/Linux)

---

## 🔐 Security Note

**Important:** Never share your credentials:
- Keep your `.env.local` file private
- Don't commit it to any repository
- Don't share your Supabase service role key with anyone outside the team

---

**Version:** 1.0.0
**Last Updated:** 2025-10-05
