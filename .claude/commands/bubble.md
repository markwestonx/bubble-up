---
description: Launch the BubbleUp Manager with full story and documentation management
allowed-tools: Bash(node:*), Bash(cd:*)
---

🔐 **Authentication Required**: This command will prompt for email and password
⚠️ **RBAC Enforced**: All operations respect your role permissions (Admin, Editor, Contributor, Read-Only)

Run the interactive BubbleUp Manager: cd C:\Users\m\OneDrive\Desktop\bubbleup && node bubble-story-creator.js

**Core Features (1-6):**
1. ➕ Add a story - Create new user stories with full details
2. ❌ Delete a story - Remove stories from backlog (⚠️ Admin role required)
3. ✏️  Edit a story - Update story details and acceptance criteria
4. 📁 Add a new project - Create new projects with epics
5. 🔍 View/search stories - Search and filter backlog items
6. 📊 Change status - Update story workflow status

**Additional Features (7-11):**
7. 👥 Reassign story - Change story assignee
8. ⚡ Update priority/effort - Modify story priority and effort points
9. ⭐ Mark as "Next up" - Flag stories for immediate attention
10. 📈 View project stats - See project analytics and metrics
11. 📚 Add documentation - Attach documentation to stories (build logs, test results, decisions, etc.)

**Story Creation Includes:**
- Project selection
- User assignment
- Epic selection
- User story text
- Acceptance criteria
- Priority, effort, business value
- Technical notes and dependencies
- Sequential ID generation

**Documentation Types Supported:**
- Design documents, plans, progress updates
- Test results, build logs, technical notes
- Decision logs, requirements, feedback
- Success/error reports
