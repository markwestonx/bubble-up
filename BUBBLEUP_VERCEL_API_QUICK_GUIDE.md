# BubbleUp API Quick Guide (Vercel-Only)

**For colleagues who want to use BubbleUp API without local setup**

---

## 🚀 Getting Started

### What You Need
1. **BubbleUp Vercel URL**: `https://bubble-up.vercel.app`
2. **Your Supabase Auth Token**: Get from logging into BubbleUp
3. **HTTP Client**: curl, Postman, Insomnia, or Claude Code

### No Local Files Required
- ✅ No `.env.local` needed
- ✅ No `.bubbleup-config.json` needed
- ✅ No `npm install` needed
- ✅ Works from anywhere with internet

---

## 🔑 Getting Your Auth Token

### Option 1: Browser Dev Tools
1. Log into BubbleUp at `https://bubble-up.vercel.app`
2. Open browser DevTools (F12)
3. Go to **Application** → **Local Storage** → Your domain
4. Find `sb-*-auth-token` key
5. Copy the `access_token` value

### Option 2: Ask Admin
Contact Mark Weston to generate a token for you.

---

## 📋 Available Projects

Current projects in BubbleUp:
- Sales Genie
- BubbleUp
- GTM Spike
- ISO27001
- Horizon Xceed
- AI Governor
- SOC
- Cyber Essentials

Use the exact project name in API calls (case-sensitive).

---

## 🎯 Common Operations

### 1. Create a New Story

```bash
curl -X POST 'https://bubble-up.vercel.app/api/stories?project=Sales%20Genie' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "userStory": "As a user, I want to export data to CSV",
    "epic": "Foundation",
    "priority": "HIGH",
    "effort": 5,
    "businessValue": 8,
    "acceptanceCriteria": [
      "Export button visible",
      "CSV downloads correctly",
      "All fields included"
    ],
    "technicalNotes": "Use csv-writer library",
    "assignedTo": "user-uuid-or-null",
    "isNext": false
  }'
```

**Required Fields:**
- `userStory` (string)
- `epic` (string)
- `priority` (CRITICAL | HIGH | MEDIUM | LOW)
- `effort` (1, 2, 3, 5, 8, or 13)
- `businessValue` (1-10)

**Response:**
```json
{
  "id": "145",
  "created_at": "2025-10-05T12:00:00Z",
  "story": { ... }
}
```

---

### 2. Update an Existing Story

```bash
curl -X PUT 'https://bubble-up.vercel.app/api/stories/145?project=Sales%20Genie' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "IN_PROGRESS",
    "priority": "CRITICAL",
    "effort": 8
  }'
```

**Updatable Fields:** (all optional - only include what you want to change)
- `userStory`
- `epic`
- `priority`
- `status` (NOT_STARTED | IN_PROGRESS | TESTING | BLOCKED | COMPLETE)
- `effort`
- `businessValue`
- `acceptanceCriteria`
- `technicalNotes`
- `dependencies`
- `assignedTo`
- `isNext`

---

### 3. Get a Single Story

```bash
curl 'https://bubble-up.vercel.app/api/stories/145?project=Sales%20Genie' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

**Response:**
```json
{
  "story": {
    "id": "145",
    "project": "Sales Genie",
    "epic": "Foundation",
    "priority": "HIGH",
    "status": "NOT_STARTED",
    "user_story": "As a user...",
    "acceptance_criteria": ["..."],
    "effort": 5,
    "business_value": 8
  }
}
```

---

### 4. Delete a Story

```bash
curl -X DELETE 'https://bubble-up.vercel.app/api/stories/145?project=Sales%20Genie' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

**Response:**
```json
{
  "message": "Story deleted successfully",
  "deletedStory": { ... }
}
```

**⚠️ Permissions:** Only Admin or Editor roles can delete stories.

---

## 🔧 Using with Claude Code

Claude can call these APIs directly for you. Just tell Claude:

```
"Create a new BubbleUp story for Sales Genie:
- User story: As a sales rep, I need lead scoring
- Epic: Lead Discovery
- Priority: HIGH
- Effort: 8
- Business value: 9"
```

Claude will construct and execute the API call using your token.

---

## 📊 Task Management

### Create a Task for a Story

```bash
curl -X POST 'https://bubble-up.vercel.app/api/stories/145/tasks?project=Sales%20Genie' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Implement CSV export service",
    "description": "Create backend endpoint for CSV generation",
    "status": "To Do",
    "effort": 3,
    "assignedUserId": "user-uuid-or-null"
  }'
```

### Update Task Status

```bash
curl -X PATCH 'https://bubble-up.vercel.app/api/tasks/task-uuid/status?project=Sales%20Genie' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "In Progress",
    "progress": 50
  }'
```

**Valid Task Statuses:**
- To Do
- In Progress
- Blocked
- Done

---

## ⚠️ Common Errors

### 401 Unauthorized
**Problem:** Missing or invalid auth token
**Solution:** Get a fresh token from BubbleUp login

### 403 Forbidden
**Problem:** You don't have permission for this operation
**Solution:** Contact admin to upgrade your role to Editor or Admin

### 404 Not Found
**Problem:** Story doesn't exist or wrong project name
**Solution:** Check story ID and project name (case-sensitive)

### 422 Unprocessable Entity
**Problem:** Invalid field value (e.g., wrong priority, effort, or status)
**Solution:** Check API documentation for valid values

---

## 🎨 Valid Field Values

### Priority
- `CRITICAL`
- `HIGH`
- `MEDIUM`
- `LOW`

### Status
- `NOT_STARTED`
- `IN_PROGRESS`
- `TESTING`
- `BLOCKED`
- `COMPLETE`

### Effort (Fibonacci points)
- `1`, `2`, `3`, `5`, `8`, `13`

### Business Value
- Any number from `1` to `10`

---

## 🔗 Full API Reference

For complete API documentation including all endpoints and advanced features, see:
- `API.md` in the BubbleUp repository
- Or ask Mark for the full docs

---

## 💡 Tips

1. **Project names have spaces**: Use `%20` in URLs (e.g., `Sales%20Genie`)
2. **Story IDs are sequential**: Latest story = highest number
3. **Auth tokens expire**: Get a fresh token if you get 401 errors
4. **Test with Postman first**: Easier than curl for debugging
5. **Use Claude**: Let Claude handle the API calls for you

---

## 📞 Support

**Questions?** Contact Mark Weston (mark.weston@regulativ.ai)

**Found a bug?** Report in the team Slack or via email

---

*Last updated: 2025-10-05*
