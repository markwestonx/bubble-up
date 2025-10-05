# 🚀 BubbleUp Manager - Quick Start

**5-Minute Setup for New Users**

---

## ⚡ Super Quick Setup

```bash
# 1. Clone repo
cd C:\Users\<YourUsername>\OneDrive\Desktop
git clone https://github.com/markwestonx/bubble-up.git
cd bubble-up

# 2. Install
npm install

# 3. Run setup wizard
node setup-bubble-user.js

# 4. Restart Claude Code

# 5. Test
/bubble
```

---

## 📝 Manual Setup (If Wizard Fails)

### 1. Create `.bubbleup-config.json`

Save this to `C:\Users\<You>\.bubbleup-config.json`:

```json
{
  "currentUser": {
    "name": "YOUR NAME",
    "email": "your.email@regulativ.ai",
    "uuid": "YOUR-UUID-HERE",
    "role": "Admin"
  },
  "users": [ /* ask Mark for full user list */ ],
  "projects": [ /* ask Mark for project list */ ],
  "priorities": ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
  "statuses": ["NOT_STARTED", "IN_PROGRESS", "TESTING", "BLOCKED", "DONE"],
  "effortPoints": [1, 2, 3, 5, 8, 13]
}
```

### 2. Create Slash Command

Save to `C:\Users\<You>\.claude\commands\bubble.md`:

```markdown
---
description: BubbleUp story manager
allowed-tools: Bash(node:*), Bash(cd:*)
---

cd C:\Users\<You>\OneDrive\Desktop\bubbleup && node bubble-story-creator.js
```

### 3. Get Environment File

Ask Mark for `.env.local` credentials.

---

## 🎯 Features at a Glance

| # | Feature | What it does |
|---|---------|--------------|
| 1 | ➕ Add story | Create new story |
| 2 | ❌ Delete story | Remove story |
| 3 | ✏️ Edit story | Modify any field |
| 4 | 📁 Add project | New project + story |
| 5 | 🔍 Search | Find stories |
| 6 | 📊 Change status | Quick updates |
| 7 | 👥 Reassign | Change assignee |
| 8 | ⚡ Priority/Effort | Quick P/E update |
| 9 | ⭐ Next up | Flag story |
| 10 | 📈 Stats | View analytics |

---

## 💡 Pro Tips

**Assigning Stories:**
- Type `me` to assign to yourself
- Type first name to assign to teammate
- Type `unassigned` for no assignment

**Finding Story IDs:**
- Use option 5 (Search) first
- Note the ID, then use other options

**Quick Workflows:**
1. `/bubble` → `1` → Create story
2. `/bubble` → `6` → Quick status change
3. `/bubble` → `5` → Browse backlog

---

## 🆘 Getting Help

**Common Issues:**

❌ "Config not found"
→ Check `.bubbleup-config.json` exists in home directory

❌ "/bubble not found"
→ Restart Claude Code after creating `bubble.md`

❌ "Wrong creator"
→ Update `currentUser` in your config

**Need Support?**
→ Contact Mark Weston (mark.weston@regulativ.ai)

---

**📖 Full Documentation:** See `BUBBLE_COMMAND_SETUP.md`
