# 🎯 BubbleUp CLI - Installation Instructions for Jinal

Hi Jinal,

Here's how to install the BubbleUp CLI tool on your machine. This will give you access to the `/bubble` command in Claude Code for managing the backlog.

---

## ⚡ Quick Install (Recommended)

### Step 1: Open PowerShell

Right-click the Start button → Select "Windows PowerShell"

### Step 2: Run the Installer

Copy and paste this command:

```powershell
irm https://bubble-up.vercel.app/cli/install.ps1 | iex
```

Press Enter and wait for it to download (~5MB).

### Step 3: Enter Supabase Key

When prompted, enter the Supabase service role key:
```
[Ask Mark for the key]
```

### Step 4: Run Setup Wizard

The installer will create a folder on your Desktop called `bubbleup-cli`.

Now run the setup wizard:

```powershell
cd Desktop\bubbleup-cli
node setup.js
```

### Step 5: Enter Your Information

The wizard will ask for:

1. **Your full name**: `Jinal Shah`
2. **Your email**: `jinal.shah@regulativ.ai`
3. **Your Supabase UUID**: `9e09e6b9-fa9d-4cb9-8583-22cbb50e55b5`
4. **Aliases** (shortcuts for assigning stories to yourself): `Jinal, jinal, JS, me`

### Step 6: Restart Claude Code

Close and reopen Claude Code completely.

### Step 7: Test

In Claude Code, type: `/bubble`

You should see the BubbleUp Manager menu with 10 options.

---

## 🎯 What You Can Do

Once installed, `/bubble` gives you access to:

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

## 💡 Quick Tips

### Assigning Stories to Yourself
When creating a story, type `me` to assign it to yourself (no need to type your full name).

### Finding Story IDs
Use option 5 (View/search stories) first to find the story ID, then use other options to edit/update it.

### Example Workflow
```
1. Type /bubble in Claude Code
2. Select option 1 (Add a story)
3. Choose project: Sales Genie
4. Assign to: me
5. Select epic: Lead Discovery
6. Write story: "As a user, I want to..."
7. Add acceptance criteria
8. Set priority: HIGH
9. Set effort: 5
10. Done!
```

---

## 🛠 Troubleshooting

### "/bubble command not found"
- Make sure you restarted Claude Code after running setup
- Check that `~/.claude/commands/bubble.md` exists
- Try typing `/bubble` manually (it might not autocomplete)

### "Config not found"
Run the setup wizard again:
```powershell
cd Desktop\bubbleup-cli
node setup.js
```

### "Invalid credentials"
Check that your `.env.local` file has the correct Supabase key:
```powershell
cd Desktop\bubbleup-cli
notepad .env.local
```

It should look like:
```env
NEXT_PUBLIC_SUPABASE_URL=https://bzqgoppjuynxfyrrhsbg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 📞 Need Help?

**Contact Mark Weston:**
- Email: mark.weston@regulativ.ai
- Include the exact error message and what you were trying to do

---

## 🔐 Important

**Keep your credentials private:**
- Don't share your `.env.local` file
- Don't share the Supabase service role key outside the team
- These files are already gitignored and won't be committed

---

**That's it!** Once set up, you can use `/bubble` anytime in Claude Code to manage stories.

Version: 1.0.0
Date: 2025-10-05
