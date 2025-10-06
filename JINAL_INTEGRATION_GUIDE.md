# BubbleUp Integration Guide for Jinal Shah

**Last Updated**: 2025-10-06
**For**: Jinal Shah (jinal.shah@regulativ.ai)
**Purpose**: Complete integration guide for BubbleUp API and database

---

## 1. Authentication & API Access

### Supabase Configuration

```javascript
// Supabase Project Configuration
const SUPABASE_URL = "https://bzqgoppjuynxfyrrhsbg.supabase.co"
const SUPABASE_PROJECT_ID = "bzqgoppjuynxfyrrhsbg"

// API Keys (use ONE of these)
const SUPABASE_ANON_KEY = "<contact Mark for this key>"  // For client-side (limited permissions)
const SUPABASE_SERVICE_KEY = "<contact Mark for this key>"  // For server-side (full admin access)
```

### Your User Credentials

```javascript
const USER_CREDENTIALS = {
  email: "jinal.shah@regulativ.ai",
  password: "Password2025!",
  uuid: "9e09e6b9-fa9d-4cb9-8583-22cbb50e55b5"
}
```

---

## 2. Database Schema

### Table: `backlog_items`

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | ✅ | Sequential ID (e.g., "001", "002") |
| `project` | string | ✅ | Project name (e.g., "BubbleUp", "Sales Genie") |
| `epic` | string | ✅ | Epic/phase (e.g., "API Integration", "Authentication") |
| `priority` | enum | ✅ | One of: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `status` | enum | ✅ | One of: `NOT_STARTED`, `IN_PROGRESS`, `TESTING`, `BLOCKED`, `DONE`, `CLOSED` |
| `user_story` | string | ✅ | User story text (e.g., "As a developer, I want...") |
| `acceptance_criteria` | array | ❌ | Array of strings (acceptance criteria) |
| `effort` | integer | ✅ | Fibonacci points: `1`, `2`, `3`, `5`, `8`, `13` |
| `business_value` | integer | ✅ | Integer 1-10 |
| `dependencies` | array | ❌ | Array of story IDs (e.g., ["118", "120"]) |
| `technical_notes` | string | ❌ | Technical implementation notes |
| `owner` | string | ❌ | Legacy field (not currently used) |
| `is_next` | boolean | ❌ | Flag for "Next Up" stories (default: false) |
| `display_order` | integer | ✅ | Custom sort order for the user |
| `created_at` | timestamp | Auto | Auto-generated timestamp |
| `updated_at` | timestamp | Auto | Auto-updated timestamp |
| `created_by` | uuid | Auto | User UUID who created the story |
| `assigned_to` | uuid | ❌ | User UUID story is assigned to |

### Table: `user_project_roles`

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `user_id` | uuid | ✅ | User UUID (references auth.users) |
| `project` | string | ✅ | Project name |
| `role` | enum | ✅ | One of: `Admin`, `Editor`, `Viewer` |
| `created_at` | timestamp | Auto | Auto-generated |

### Table: `user_custom_order`

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `user_id` | uuid | ✅ | User UUID |
| `project` | string | ✅ | Project name |
| `item_id` | string | ✅ | Story ID |
| `display_order` | integer | ✅ | Custom sort order |
| `created_at` | timestamp | Auto | Auto-generated |
| `updated_at` | timestamp | Auto | Auto-updated |

---

## 3. API Endpoints

**Base URL**: `https://bubble-up.vercel.app/api`

### Authentication

All API endpoints require authentication via Supabase session token.

```javascript
// Using Supabase Client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'jinal.shah@regulativ.ai',
  password: 'Password2025!'
})

// Get session token
const session = data.session
const accessToken = session.access_token  // Use this for API calls
```

### Headers Required for All Requests

```javascript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

---

### 📍 **GET /api/stories**

List and filter stories for a project.

**Query Parameters**:
- `project` (required) - Project name (e.g., "BubbleUp")
- `status` (optional) - Filter by status
- `priority` (optional) - Filter by priority
- `epic` (optional) - Filter by epic
- `assignedTo` (optional) - Filter by user UUID
- `isNext` (optional) - Filter by "next up" flag (`true`/`false`)
- `search` (optional) - Search in user story text
- `limit` (optional) - Limit number of results

**Example Request**:
```javascript
const response = await fetch(
  'https://bubble-up.vercel.app/api/stories?project=BubbleUp&status=IN_PROGRESS',
  { headers }
)
const { stories, count } = await response.json()
```

**Example Response**:
```json
{
  "stories": [
    {
      "id": "146",
      "project": "BubbleUp",
      "epic": "API Integration",
      "priority": "MEDIUM",
      "status": "NOT_STARTED",
      "user_story": "As a developer, I need...",
      "acceptance_criteria": ["Criterion 1", "Criterion 2"],
      "effort": 8,
      "business_value": 9,
      "dependencies": [],
      "technical_notes": "Implementation notes...",
      "owner": "",
      "is_next": false,
      "display_order": 0,
      "created_at": "2025-10-06T08:13:38.911092+00:00",
      "updated_at": "2025-10-06T08:15:24.892671+00:00",
      "created_by": "d6026bb3-dbc9-4d05-be66-5a631f7e0377",
      "assigned_to": "88c48796-c1a2-471d-808d-8f72f38d8359"
    }
  ],
  "count": 1
}
```

---

### 📍 **POST /api/stories**

Create a new story.

**Required Permissions**: Admin or Editor role

**Request Body**:
```json
{
  "project": "BubbleUp",
  "userStory": "As a developer, I want to...",
  "epic": "API Integration",
  "priority": "HIGH",
  "effort": 8,
  "businessValue": 9,
  "acceptanceCriteria": ["Criterion 1", "Criterion 2"],
  "technicalNotes": "Optional implementation notes",
  "dependencies": ["118", "120"],
  "status": "NOT_STARTED",
  "assignedTo": "9e09e6b9-fa9d-4cb9-8583-22cbb50e55b5",
  "isNext": false
}
```

**Example Request**:
```javascript
const newStory = {
  project: "BubbleUp",
  userStory: "As a developer, I want to integrate with Claude",
  epic: "API Integration",
  priority: "HIGH",
  effort: 8,
  businessValue: 10,
  acceptanceCriteria: [
    "API endpoints documented",
    "Authentication working",
    "CRUD operations functional"
  ],
  technicalNotes: "Use Supabase client library",
  dependencies: [],
  status: "NOT_STARTED"
}

const response = await fetch('https://bubble-up.vercel.app/api/stories', {
  method: 'POST',
  headers,
  body: JSON.stringify(newStory)
})

const result = await response.json()
// Returns: { id: "147", created_at: "...", story: {...} }
```

**Response**:
```json
{
  "id": "147",
  "created_at": "2025-10-06T10:30:00.000Z",
  "story": {
    "id": "147",
    "project": "BubbleUp",
    "user_story": "As a developer, I want to integrate with Claude",
    ...
  }
}
```

---

### 📍 **GET /api/stories/:id**

Get a single story by ID.

**URL Parameters**:
- `:id` - Story ID (e.g., "146")

**Query Parameters**:
- `project` (required) - Project name

**Example Request**:
```javascript
const response = await fetch(
  'https://bubble-up.vercel.app/api/stories/146?project=BubbleUp',
  { headers }
)
const { story } = await response.json()
```

---

### 📍 **PUT /api/stories/:id**

Update an existing story.

**Required Permissions**: Admin or Editor role

**URL Parameters**:
- `:id` - Story ID

**Query Parameters**:
- `project` (required) - Project name

**Request Body** (all fields optional):
```json
{
  "userStory": "Updated story text",
  "epic": "Authentication",
  "priority": "CRITICAL",
  "status": "IN_PROGRESS",
  "effort": 5,
  "businessValue": 10,
  "acceptanceCriteria": ["New criterion"],
  "technicalNotes": "Updated notes",
  "dependencies": ["126"],
  "assignedTo": "9e09e6b9-fa9d-4cb9-8583-22cbb50e55b5",
  "isNext": true
}
```

**Example Request**:
```javascript
const updates = {
  status: "IN_PROGRESS",
  assignedTo: "9e09e6b9-fa9d-4cb9-8583-22cbb50e55b5"
}

const response = await fetch(
  'https://bubble-up.vercel.app/api/stories/146?project=BubbleUp',
  {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates)
  }
)

const result = await response.json()
// Returns: { updated_at: "...", story: {...} }
```

---

### 📍 **DELETE /api/stories/:id**

Delete a story.

**Required Permissions**: Admin or Editor role

**URL Parameters**:
- `:id` - Story ID

**Query Parameters**:
- `project` (required) - Project name

**Example Request**:
```javascript
const response = await fetch(
  'https://bubble-up.vercel.app/api/stories/146?project=BubbleUp',
  {
    method: 'DELETE',
    headers
  }
)

const result = await response.json()
// Returns: { success: true, message: "Story deleted successfully", deletedStory: {...} }
```

---

### 📍 **GET /api/users**

Get list of all users (for assigning stories).

**Example Request**:
```javascript
const response = await fetch(
  'https://bubble-up.vercel.app/api/users',
  { headers }
)

const { users } = await response.json()
```

**Response**:
```json
{
  "users": [
    {
      "id": "88c48796-c1a2-471d-808d-8f72f38d8359",
      "email": "mark.weston@regulativ.ai"
    },
    {
      "id": "9e09e6b9-fa9d-4cb9-8583-22cbb50e55b5",
      "email": "jinal.shah@regulativ.ai"
    }
  ]
}
```

---

### 📍 **GET /api/permissions**

Get your permissions for a project.

**Query Parameters**:
- `project` (required) - Project name

**Example Request**:
```javascript
const response = await fetch(
  'https://bubble-up.vercel.app/api/permissions?project=BubbleUp',
  { headers }
)

const permissions = await response.json()
```

**Response**:
```json
{
  "project": "BubbleUp",
  "role": "Editor",
  "permissions": {
    "canView": true,
    "canEdit": true,
    "canDelete": true,
    "canManageUsers": false,
    "canManageRoles": false
  }
}
```

---

## 4. Authentication Flow

### Token Type
- **JWT (JSON Web Token)** via Supabase Auth
- Included in `Authorization` header as Bearer token

### Token Lifecycle

1. **Login** → Get access token + refresh token
2. **Use access token** for API calls (valid for 1 hour)
3. **Refresh** when access token expires
4. **Logout** → Invalidate session

### Token Refresh Mechanism

```javascript
// Supabase handles refresh automatically
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed:', session.access_token)
  }
})

// Manual refresh
const { data, error } = await supabase.auth.refreshSession()
const newAccessToken = data.session.access_token
```

### Token Expiration
- **Access Token**: 1 hour
- **Refresh Token**: 30 days (or until logout)

### Where to Include Token
```javascript
// Header (preferred)
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

### Error Handling

```javascript
if (response.status === 401) {
  // Token expired or invalid - need to refresh or re-login
  await supabase.auth.refreshSession()
}
```

---

## 5. Row Level Security (RLS) Policies

### backlog_items Table

**SELECT (Read)**:
- ✅ Authenticated users can read stories from projects they have access to
- ✅ Checked via `user_project_roles` table

**INSERT (Create)**:
- ✅ Users with `Admin` or `Editor` role can create stories
- ✅ Automatically sets `created_by` to your UUID

**UPDATE (Edit)**:
- ✅ Users with `Admin` or `Editor` role can update stories
- ✅ Cannot modify `created_by` field

**DELETE**:
- ✅ Users with `Admin` or `Editor` role can delete stories

### user_project_roles Table

**SELECT**:
- ✅ Users can see their own project roles
- ✅ Admins can see all roles

**INSERT/UPDATE/DELETE**:
- ✅ Only Admins can modify roles

---

## 6. Rate Limiting

**Current Limits**:
- No explicit rate limiting implemented
- Supabase connection pooling: Default limits apply
- Recommended: Max 60 requests/minute per user

**Best Practices**:
- Batch operations when possible
- Use pagination for large datasets
- Cache user/project lists locally

---

## 7. Complete Integration Example

```javascript
import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = 'https://bzqgoppjuynxfyrrhsbg.supabase.co'
const SUPABASE_ANON_KEY = '<get from Mark>'

// Initialize client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 1. Login
async function login() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'jinal.shah@regulativ.ai',
    password: 'Password2025!'
  })

  if (error) throw error
  return data.session.access_token
}

// 2. Get all stories for BubbleUp project
async function getAllStories(accessToken) {
  const response = await fetch(
    'https://bubble-up.vercel.app/api/stories?project=BubbleUp',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const { stories } = await response.json()
  return stories
}

// 3. Create a new story
async function createStory(accessToken, storyData) {
  const response = await fetch(
    'https://bubble-up.vercel.app/api/stories',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project: 'BubbleUp',
        ...storyData
      })
    }
  )

  return await response.json()
}

// 4. Update a story
async function updateStory(accessToken, storyId, updates) {
  const response = await fetch(
    `https://bubble-up.vercel.app/api/stories/${storyId}?project=BubbleUp`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    }
  )

  return await response.json()
}

// Usage
async function main() {
  try {
    // Login
    const token = await login()
    console.log('✅ Logged in successfully')

    // Get all stories
    const stories = await getAllStories(token)
    console.log(`📋 Found ${stories.length} stories`)

    // Create a new story
    const newStory = await createStory(token, {
      userStory: 'As a developer, I want to test the API',
      epic: 'API Integration',
      priority: 'HIGH',
      effort: 5,
      businessValue: 8,
      acceptanceCriteria: ['API works', 'Tests pass']
    })
    console.log('✅ Created story:', newStory.id)

    // Update the story
    const updated = await updateStory(token, newStory.id, {
      status: 'IN_PROGRESS'
    })
    console.log('✅ Updated story to IN_PROGRESS')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
```

---

## 8. Quick Reference

### Valid Enum Values

**Priority**:
- `CRITICAL`
- `HIGH`
- `MEDIUM`
- `LOW`

**Status**:
- `NOT_STARTED`
- `IN_PROGRESS`
- `TESTING`
- `BLOCKED`
- `DONE`
- `CLOSED`

**Effort** (Fibonacci):
- `1`, `2`, `3`, `5`, `8`, `13`

**Business Value**:
- `1` - `10` (integers only)

**Roles**:
- `Admin` (full access)
- `Editor` (can create/edit/delete stories)
- `Viewer` (read-only access)

---

## 9. Support & Contact

**Questions?** Contact Mark Weston:
- Email: mark.weston@regulativ.ai
- For API keys and additional access

**Issues?** Check:
1. Token is valid (not expired)
2. User has correct role for operation
3. Project name is correct
4. Required fields are provided

---

## 10. Next Steps for Jinal

1. ✅ Get `SUPABASE_ANON_KEY` from Mark
2. ✅ Test login with your credentials
3. ✅ Try GET /api/stories to fetch existing stories
4. ✅ Test POST /api/stories to create a test story
5. ✅ Integrate into your Claude workflow

**Estimated Time to Integration**: 1-2 hours

---

*Last updated: 2025-10-06 by Claude for Mark Weston*
