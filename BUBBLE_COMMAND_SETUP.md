# 🎯 BubbleUp Manager - Setup Guide for New Users

Complete installation guide for setting up the `/bubble` command on your machine.

---

## 📋 Prerequisites

Before you begin, ensure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ Git installed
- ✅ Claude Code installed
- ✅ Access to the BubbleUp GitHub repository
- ✅ Your Supabase user UUID (ask Mark if you don't have it)

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Clone the Repository

```bash
cd C:\Users\<YourUsername>\OneDrive\Desktop
git clone https://github.com/markwestonx/bubble-up.git
cd bubble-up
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Your Configuration File

Create `.bubbleup-config.json` in **THREE locations** (the tool searches in this order):

**Location 1: Project Root** (Required)
```bash
# Create in: C:\Users\<You>\OneDrive\Desktop\bubbleup\.bubbleup-config.json
```

**Location 2: Desktop** (Recommended)
```bash
# Create in: C:\Users\<You>\OneDrive\Desktop\.bubbleup-config.json
```

**Location 3: Home Directory** (Optional)
```bash
# Create in: C:\Users\<You>\.bubbleup-config.json
```

**Configuration Template:**
```json
{
  "currentUser": {
    "name": "YOUR NAME HERE",
    "email": "your.email@regulativ.ai",
    "uuid": "YOUR-UUID-HERE",
    "role": "Admin"
  },
  "users": [
    {
      "name": "Mark Weston",
      "firstName": "Mark",
      "lastName": "Weston",
      "email": "mark.weston@regulativ.ai",
      "alternateEmails": ["mark.x.weston@gmail.com"],
      "uuid": "88c48796-c1a2-471d-808d-8f72f38d8359",
      "aliases": ["Mark", "mark", "MW"]
    },
    {
      "name": "Jinal Shah",
      "firstName": "Jinal",
      "lastName": "Shah",
      "email": "jinal.shah@regulativ.ai",
      "alternateEmails": [],
      "uuid": "9e09e6b9-fa9d-4cb9-8583-22cbb50e55b5",
      "aliases": ["Jinal", "jinal", "JS"]
    },
    {
      "name": "YOUR NAME HERE",
      "firstName": "YOUR FIRST NAME",
      "lastName": "YOUR LAST NAME",
      "email": "your.email@regulativ.ai",
      "alternateEmails": [],
      "uuid": "YOUR-UUID-HERE",
      "aliases": ["YOUR NAME", "yourname", "YN", "me"]
    }
  ],
  "projects": [
    {
      "name": "Sales Genie",
      "epics": ["Lead Discovery", "Outreach", "Messaging", "Analytics", "Foundation"]
    },
    {
      "name": "BubbleUp",
      "epics": ["Foundation", "API", "Authentication", "Authorization", "UI/UX"]
    },
    {
      "name": "GTM Spike",
      "epics": ["Foundation", "Research", "Strategy"]
    },
    {
      "name": "ISO27001",
      "epics": ["Security Controls", "Compliance", "Documentation", "Audit", "Foundation"]
    },
    {
      "name": "Horizon Xceed",
      "epics": ["Deployment", "Infrastructure", "Foundation"]
    },
    {
      "name": "AI Governor",
      "epics": ["Authentication", "Governance", "Compliance", "Foundation"]
    },
    {
      "name": "SOC",
      "epics": ["Foundation", "Monitoring", "Incident Response", "Threat Detection", "Integration", "Compliance"]
    },
    {
      "name": "Cyber Essentials",
      "epics": ["Foundation", "Technical Controls", "Organizational Controls", "Certification", "Documentation"]
    }
  ],
  "priorities": ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
  "statuses": ["NOT_STARTED", "IN_PROGRESS", "TESTING", "BLOCKED", "DONE"],
  "effortPoints": [1, 2, 3, 5, 8, 13]
}
```

**⚠️ IMPORTANT:** Replace:
- `YOUR NAME HERE` with your actual name
- `your.email@regulativ.ai` with your email
- `YOUR-UUID-HERE` with your Supabase user UUID
- Add yourself to the `users` array
- Update `aliases` with nicknames you want to use

### Step 4: Set Up Environment Variables

Ensure `.env.local` exists in the project root with Supabase credentials:

```bash
# File: C:\Users\<You>\OneDrive\Desktop\bubbleup\.env.local
NEXT_PUBLIC_SUPABASE_URL=https://bzqgoppjuynxfyrrhsbg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<ask-mark-for-this-key>
```

**🔒 Security:** Never commit `.env.local` to Git!

### Step 5: Set Up the `/bubble` Slash Command

Create the global slash command file:

```bash
# Create directory if it doesn't exist
mkdir C:\Users\<You>\.claude\commands

# Copy the bubble command
copy C:\Users\<You>\OneDrive\Desktop\bubbleup\.claude\commands\bubble.md C:\Users\<You>\.claude\commands\bubble.md
```

**Or manually create:** `C:\Users\<You>\.claude\commands\bubble.md`

```markdown
---
description: Create a new user story in BubbleUp with interactive prompts
allowed-tools: Bash(node:*), Bash(cd:*)
---

Run the interactive BubbleUp story creator: cd C:\Users\<You>\OneDrive\Desktop\bubbleup && node bubble-story-creator.js

This will guide you through creating a user story with:
- Project selection
- User assignment
- Epic selection
- User story text
- Acceptance criteria
- Priority, effort, business value
- Technical notes and dependencies
- Sequential ID generation
```

**⚠️ IMPORTANT:** Replace `<You>` with your actual Windows username!

### Step 6: Restart Claude Code

Close and restart Claude Code to load the new slash command.

---

## ✅ Verify Installation

### Test the Configuration

```bash
cd C:\Users\<You>\OneDrive\Desktop\bubbleup
node bubble-story-creator.js
```

You should see:
```
╔═══════════════════════════════════════════════════════════════╗
║                   🎯 BubbleUp Manager                        ║
╚═══════════════════════════════════════════════════════════════╝

👤 User: YOUR NAME (your.email@regulativ.ai)
```

### Test the Slash Command

1. Open Claude Code
2. Type `/` and look for `bubble` in the autocomplete
3. Select `/bubble` or type it manually
4. The BubbleUp Manager menu should appear

---

## 📚 Usage Guide

### Main Menu Overview

```
📋 CORE FEATURES:
1. ➕ Add a story           - Create new story with full details
2. ❌ Delete a story        - Remove a story (with confirmation)
3. ✏️  Edit a story          - Modify any story field
4. 📁 Add a new project     - Create new project + first story
5. 🔍 View/search stories   - Filter and browse stories
6. 📊 Change status         - Quick status updates

⚡ ADDITIONAL FEATURES:
7. 👥 Reassign story        - Change who's working on it
8. ⚡ Update priority/effort - Quick P/E updates
9. ⭐ Mark as "Next up"     - Flag important stories
10. 📈 View project stats    - See backlog analytics
```

### Common Workflows

#### Create a New Story
1. Type `/bubble`
2. Select option `1` (Add a story)
3. Follow the prompts:
   - Choose project
   - Assign to user (type name, email, or "me")
   - Select epic
   - Write user story
   - Add acceptance criteria
   - Set priority, effort, business value
   - Add optional technical notes and dependencies

#### Quick Status Update
1. Type `/bubble`
2. Select option `6` (Change status)
3. Enter story ID
4. Select new status

#### View Stories by Project
1. Type `/bubble`
2. Select option `5` (View/search stories)
3. Choose filter option `1` (Project)
4. Select your project

---

## 🔍 Finding Your UUID

If you don't know your Supabase user UUID:

### Method 1: Ask Mark
Mark has admin access and can look it up for you.

### Method 2: Supabase Dashboard
1. Go to Supabase dashboard
2. Navigate to Authentication → Users
3. Find your email
4. Copy the UUID

### Method 3: SQL Query
```sql
SELECT id, email FROM auth.users WHERE email = 'your.email@regulativ.ai';
```

---

## 🛠 Troubleshooting

### "Config not found" Error
**Problem:** Tool can't find `.bubbleup-config.json`

**Solution:**
1. Check file exists in one of the three locations
2. Verify filename is exactly `.bubbleup-config.json` (note the leading dot)
3. Ensure it's valid JSON (use a JSON validator)

### ".env.local not found" Error
**Problem:** Environment file missing

**Solution:**
1. Create `.env.local` in project root
2. Get the `SUPABASE_SERVICE_ROLE_KEY` from Mark
3. Ensure no extra spaces or quotes

### "Wrong Created By" User
**Problem:** Stories show wrong creator

**Solution:**
1. Check `currentUser` in your config matches YOUR details
2. Verify your UUID is correct
3. Make sure you copied the config to the right location

### Slash Command Not Appearing
**Problem:** `/bubble` doesn't show in Claude Code

**Solution:**
1. Verify `bubble.md` exists in `C:\Users\<You>\.claude\commands\`
2. Check the file has correct YAML frontmatter
3. Restart Claude Code completely
4. Try typing `/bubble` manually (it might not autocomplete but still work)

### "Story not found" When Editing
**Problem:** Can't find story by ID

**Solution:**
1. Use option `5` (View/search) to find the story ID first
2. Verify you're in the correct project
3. Check the story actually exists in the database

---

## 🔄 Updating BubbleUp Manager

To get the latest features:

```bash
cd C:\Users\<You>\OneDrive\Desktop\bubbleup
git pull origin main
npm install
```

Your `.bubbleup-config.json` and `.env.local` will be preserved (they're gitignored).

---

## 👥 Multi-User Setup

Each user needs:
1. Their own `.bubbleup-config.json` with their details as `currentUser`
2. Access to the same `.env.local` (Supabase credentials)
3. Their own global `/bubble` slash command

Stories will be automatically attributed to whoever runs the command based on their `currentUser` config.

---

## 📞 Support

**Issues or Questions?**
- Contact: Mark Weston
- Email: mark.weston@regulativ.ai
- GitHub Issues: https://github.com/markwestonx/bubble-up/issues

---

## 🎓 Advanced Tips

### Use Aliases for Quick Assignment
In your config, add aliases you'll commonly type:
```json
"aliases": ["me", "myself", "john", "j"]
```

Then when assigning, just type `me` or `j` instead of full name.

### Quickly Find Story IDs
Use option `5` with filters to narrow down stories, then note the ID for editing/deleting.

### Batch Operations
The tool loops back to the main menu, so you can perform multiple operations in one session.

### Project-Specific Epics
When creating a new project, you can define custom epics. These will be suggested when creating stories in that project.

---

**Last Updated:** 2025-10-05
**Version:** 1.0.0
