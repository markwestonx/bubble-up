# 🎯 BubbleUp Story Creator - User Guide

The `/bubble` command provides a structured, interactive way to create perfectly formed user stories in BubbleUp.

## Quick Start

From anywhere in the project, run:

```bash
/bubble
```

Or using npm:

```bash
npm run bubble
```

Or directly:

```bash
node bubble-story-creator.js
```

## Features

### ✅ Automatic Creator Detection
- Always creates stories as **Mark Weston** when you run it
- Configured via `.bubbleup-config.json` in multiple locations
- Jinal can set up his own config for his machine

### 🧠 Smart User Lookup
When assigning stories, you can type:
- **Names**: "Jinal", "Mark", "mark"
- **Emails**: "jinal.shah@regulativ.ai"
- **Aliases**: "me", "myself", "JS", "MW"
- **Unassigned**: "unassigned" or just press Enter

Examples:
```
👥 Assign to: jinal
   ✅ Assigned to: Jinal Shah (jinal.shah@regulativ.ai)

👥 Assign to: me
   ✅ Assigned to: Mark Weston (mark.weston@regulativ.ai)

👥 Assign to: unassigned
   ✅ Unassigned
```

### 📋 Structured Prompts

The system walks you through:

1. **Project Selection** - Choose from all your projects
2. **Assignment** - Who should work on this?
3. **Epic Selection** - Project-specific epics or custom
4. **User Story** - Prompted to start with "As a..."
5. **Acceptance Criteria** - One per line, as many as needed
6. **Priority** - CRITICAL, HIGH, MEDIUM, LOW
7. **Effort** - Fibonacci points (1, 2, 3, 5, 8, 13)
8. **Business Value** - 1-10 scale
9. **Technical Notes** - Optional implementation details
10. **Dependencies** - Link to other story IDs
11. **Mark as Next** - Flag for "up next" prioritization

### 🎨 Example Session

```
🎯 BubbleUp Story Creator

👤 Creating as: Mark Weston (mark.weston@regulativ.ai)

📁 Select a project:
   1. Sales Genie
   2. BubbleUp
   3. GTM Spike
   4. ISO27001
   5. Horizon Xceed
   6. AI Governor

   Your choice (1-6): 4
   ✅ ISO27001

👥 Assign to (name/email or "unassigned"): jinal
   ✅ Assigned to: Jinal Shah (jinal.shah@regulativ.ai)

🎭 Select epic for ISO27001:
   1. Security Controls
   2. Compliance
   3. Documentation
   4. Audit
   5. Foundation
   6. Custom epic (type your own)

   Your choice: 1
   ✅ Security Controls

📝 User story (start with "As a..."): As a security officer, I need an automated vulnerability scanning dashboard so that I can monitor security posture in real-time

✅ Acceptance Criteria (one per line, empty line when done):
   1. Dashboard displays vulnerabilities by severity
   2. Real-time updates when vulnerabilities detected
   3. Integration with Nessus, Qualys, OpenVAS
   4.
   ✅ 3 criteria added

🔥 Priority:
   1. CRITICAL
   2. HIGH
   3. MEDIUM
   4. LOW

   Your choice (1-4): 2
   ✅ HIGH

💪 Effort (Fibonacci points):
   1. 1 points
   2. 2 points
   3. 3 points
   4. 5 points
   5. 8 points
   6. 13 points

   Your choice (1-6): 6
   ✅ 13 points

💰 Business value (1-10): 10
   ✅ 10/10

🔧 Technical notes (optional, press Enter to skip): Node.js backend with WebSocket real-time updates

🔗 Dependencies (story IDs, comma-separated, or press Enter):

⭐ Mark as "Next up"? (y/n): n

🚀 Creating story...

✅ Story created successfully!

═══════════════════════════════════════════════════════════════
📝 Story #1728057670
═══════════════════════════════════════════════════════════════
📁 Project:        ISO27001
🎭 Epic:           Security Controls
🔥 Priority:       HIGH
💪 Effort:         13 points
💰 Business Value: 10/10
👥 Assigned to:    Jinal Shah
👨‍💻 Created by:     Mark Weston
⭐ Next up:        No
📊 Status:         NOT_STARTED

📖 User Story:
   As a security officer, I need an automated vulnerability scanning dashboard so that I can monitor security posture in real-time

✅ Acceptance Criteria:
   1. Dashboard displays vulnerabilities by severity
   2. Real-time updates when vulnerabilities detected
   3. Integration with Nessus, Qualys, OpenVAS

🔧 Technical Notes:
   Node.js backend with WebSocket real-time updates

═══════════════════════════════════════════════════════════════

🌐 View in BubbleUp: http://localhost:3006
```

## Configuration

### User Mapping

The `.bubbleup-config.json` file is located in:
- Project root: `C:\Users\m\OneDrive\Desktop\bubbleup\.bubbleup-config.json`
- Desktop: `C:\Users\m\OneDrive\Desktop\.bubbleup-config.json`
- Home: `C:\Users\m\.bubbleup-config.json`

**Current User** (who creates the stories):
```json
{
  "currentUser": {
    "name": "Mark Weston",
    "email": "mark.weston@regulativ.ai",
    "uuid": "88c48796-c1a2-471d-808d-8f72f38d8359",
    "role": "Admin"
  }
}
```

**All Users** (for assignment):
```json
{
  "users": [
    {
      "name": "Jinal Shah",
      "firstName": "Jinal",
      "email": "jinal.shah@regulativ.ai",
      "uuid": "9e09e6b9-fa9d-4cb9-8583-22cbb50e55b5",
      "aliases": ["Jinal", "jinal", "JS"]
    }
  ]
}
```

### For Jinal

To set up on your machine:
1. Copy `.bubbleup-config.json` to your home directory
2. Update `currentUser` section with your details:
   ```json
   {
     "currentUser": {
       "name": "Jinal Shah",
       "email": "jinal.shah@regulativ.ai",
       "uuid": "9e09e6b9-fa9d-4cb9-8583-22cbb50e55b5",
       "role": "Editor"
     }
   }
   ```
3. Run `/bubble` - all stories will be created by you!

### Projects & Epics

Projects and their epics are defined in the config:

```json
{
  "projects": [
    {
      "name": "ISO27001",
      "epics": ["Security Controls", "Compliance", "Documentation", "Audit", "Foundation"]
    }
  ]
}
```

Add new projects or epics by editing the config file.

## Benefits

✅ **No more missing fields** - Walks you through every required field
✅ **Consistent format** - All stories follow the same structure
✅ **Smart assignment** - Type names naturally, not UUIDs
✅ **Creator tracking** - Automatically knows who you are
✅ **Fast entry** - Keyboard-driven, no mouse needed
✅ **Validation** - Ensures Fibonacci points, valid priorities, etc.
✅ **Instant visibility** - Story appears immediately in BubbleUp UI

## Slash Command Registration

The `/bubble` command is registered via:
- `.claude/commands/bubble.sh` - Shell script wrapper
- `.claude/commands.json` - Command metadata

Claude Code will auto-detect this and add `/bubble` to your available slash commands.

## Troubleshooting

**"Config not found" error:**
- Make sure `.bubbleup-config.json` exists in project root, Desktop, or home directory

**"User not found" when assigning:**
- Check spelling of name/email
- Verify user is in the `users` array in config
- Use "unassigned" if user not in system

**Story created but not appearing:**
- Refresh BubbleUp UI (http://localhost:3006)
- Check you selected the correct project
- Verify dev server is running (`npm run dev`)

**Permission errors:**
- Make sure `.claude/commands/bubble.sh` is executable
- Run: `chmod +x .claude/commands/bubble.sh`

---

**Need help?** Ask Claude to explain any part of the system or troubleshoot issues!
