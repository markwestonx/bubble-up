# BubbleUp API Documentation

This API allows external systems (including Claude AI agents) to programmatically manage the BubbleUp backlog: create user stories, break them into tasks, update statuses, and track progress.

## Authentication

All API endpoints require authentication via Bearer token in the Authorization header.

```bash
Authorization: Bearer <your-supabase-auth-token>
```

To get a token:
1. Log in to BubbleUp via the web interface
2. Extract the session token from Supabase client
3. Use this token for API calls

## Authorization

The API enforces role-based access control (RBAC):

- **Admin**: Full access to all operations
- **Editor**: Can create and update stories and tasks
- **Contributor (Read/Write)**: Can create and update stories and tasks
- **Read Only**: Can only read data (GET requests)

## Base URL

```
http://localhost:3000/api  (development)
https://your-domain.com/api  (production)
```

## Common Parameters

- `project`: Required query parameter for most endpoints. Must match one of your project names (e.g., "Sales Genie", "BubbleUp", "GTM Spike", "ISO27001")

## Endpoints

### Stories

#### Create a User Story

```http
POST /api/stories?project={projectName}
Authorization: Bearer <token>
Content-Type: application/json

{
  "userStory": "As a user, I want to...",
  "epic": "foundation",
  "priority": "HIGH",
  "effort": 8,
  "businessValue": 10,
  "acceptanceCriteria": [
    "Criteria 1",
    "Criteria 2"
  ],
  "technicalNotes": "Optional implementation notes",
  "dependencies": ["story-id-1", "story-id-2"],
  "status": "NOT_STARTED",
  "assignedTo": "user-uuid-optional",
  "isNext": false
}
```

**Required Fields:**
- `userStory` (string)
- `epic` (string)
- `priority` (CRITICAL | HIGH | MEDIUM | LOW)
- `effort` (1, 2, 3, 5, 8, or 13)
- `businessValue` (1-10)

**Optional Fields:**
- `acceptanceCriteria` (array of strings)
- `technicalNotes` (string)
- `dependencies` (array of story IDs)
- `status` (NOT_STARTED | IN_PROGRESS | TESTING | BLOCKED | COMPLETE) - defaults to NOT_STARTED
- `assignedTo` (UUID)
- `isNext` (boolean)

**Response (201 Created):**
```json
{
  "id": "uuid",
  "created_at": "2025-10-04T12:00:00Z",
  "story": { /* full story object */ }
}
```

**Permissions Required:** Admin or Editor

---

#### Update a User Story

```http
PUT /api/stories/{storyId}?project={projectName}
Authorization: Bearer <token>
Content-Type: application/json

{
  "userStory": "Updated story text",
  "priority": "CRITICAL",
  "status": "IN_PROGRESS",
  "effort": 13,
  "businessValue": 9
}
```

All fields are optional. Only include the fields you want to update.

**Response (200 OK):**
```json
{
  "updated_at": "2025-10-04T12:05:00Z",
  "story": { /* updated story object */ }
}
```

**Permissions Required:** Admin or Editor

---

#### Get a Single Story

```http
GET /api/stories/{storyId}?project={projectName}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "story": { /* story object */ }
}
```

**Permissions Required:** All roles

---

#### Delete a Story

```http
DELETE /api/stories/{storyId}?project={projectName}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Story deleted successfully",
  "deletedStory": { /* deleted story object */ }
}
```

**Permissions Required:** Admin or Editor

---

### Tasks

#### Create a Task for a Story

```http
POST /api/stories/{storyId}/tasks?project={projectName}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Implement authentication middleware",
  "description": "Create JWT-based auth middleware for API routes",
  "status": "To Do",
  "effort": 5,
  "assignedUserId": "user-uuid-optional"
}
```

**Required Fields:**
- `title` (string)

**Optional Fields:**
- `description` (string)
- `status` (To Do | In Progress | Blocked | Done) - defaults to "To Do"
- `effort` (number)
- `assignedUserId` (UUID)

**Response (201 Created):**
```json
{
  "id": "uuid",
  "status": "To Do",
  "task": { /* full task object */ }
}
```

**Permissions Required:** Admin, Editor, or Contributor

---

#### Get All Tasks for a Story

```http
GET /api/stories/{storyId}/tasks?project={projectName}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "tasks": [
    { /* task object 1 */ },
    { /* task object 2 */ }
  ]
}
```

**Permissions Required:** All roles

---

#### Update a Task

```http
PUT /api/tasks/{taskId}?project={projectName}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated task title",
  "description": "Updated description",
  "effort": 8,
  "assignedUserId": "user-uuid"
}
```

All fields are optional. Only include the fields you want to update.

**Response (200 OK):**
```json
{
  "updated_at": "2025-10-04T12:10:00Z",
  "task": { /* updated task object */ }
}
```

**Permissions Required:** Admin, Editor, or Contributor

---

#### Update Task Status and Progress

```http
PATCH /api/tasks/{taskId}/status?project={projectName}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "In Progress",
  "progress": 50
}
```

**Required Fields:**
- `status` (To Do | In Progress | Blocked | Done)
- `progress` (0-100)

**Response (200 OK):**
```json
{
  "status": "In Progress",
  "progress": 50,
  "updated_at": "2025-10-04T12:15:00Z",
  "task": { /* updated task object */ }
}
```

**Permissions Required:** Admin, Editor, or Contributor

---

#### Get a Single Task

```http
GET /api/tasks/{taskId}?project={projectName}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "task": { /* task object */ }
}
```

**Permissions Required:** All roles

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Missing required parameters
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User lacks required permissions
- `404 Not Found` - Resource doesn't exist
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

---

## Usage Examples

### Example 1: Claude Creating a New Story

```bash
curl -X POST 'http://localhost:3000/api/stories?project=Sales%20Genie' \
  -H 'Authorization: Bearer eyJhbGc...' \
  -H 'Content-Type: application/json' \
  -d '{
    "userStory": "As a sales rep, I need to export prospect data to CSV so that I can analyze it in Excel",
    "epic": "Reporting",
    "priority": "MEDIUM",
    "effort": 5,
    "businessValue": 7,
    "acceptanceCriteria": [
      "Export button on prospects page",
      "CSV includes all prospect fields",
      "Download triggers immediately"
    ]
  }'
```

### Example 2: Claude Breaking Down a Story into Tasks

```bash
# First, get the story ID from the creation response
STORY_ID="abc123..."

# Create Task 1
curl -X POST "http://localhost:3000/api/stories/$STORY_ID/tasks?project=Sales%20Genie" \
  -H 'Authorization: Bearer eyJhbGc...' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Create CSV export service",
    "description": "Implement backend service to convert prospect data to CSV format"
  }'

# Create Task 2
curl -X POST "http://localhost:3000/api/stories/$STORY_ID/tasks?project=Sales%20Genie" \
  -H 'Authorization: Bearer eyJhbGc...' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Add export button to UI",
    "description": "Add download button to prospects page header"
  }'
```

### Example 3: Claude Updating Task Progress

```bash
TASK_ID="xyz789..."

# Update task to in progress with 30% complete
curl -X PATCH "http://localhost:3000/api/tasks/$TASK_ID/status?project=Sales%20Genie" \
  -H 'Authorization: Bearer eyJhbGc...' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "In Progress",
    "progress": 30
  }'

# Later, mark as done
curl -X PATCH "http://localhost:3000/api/tasks/$TASK_ID/status?project=Sales%20Genie" \
  -H 'Authorization: Bearer eyJhbGc...' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "Done",
    "progress": 100
  }'
```

### Example 4: Claude Moving Story to Testing

```bash
STORY_ID="abc123..."

curl -X PUT "http://localhost:3000/api/stories/$STORY_ID?project=Sales%20Genie" \
  -H 'Authorization: Bearer eyJhbGc...' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "TESTING"
  }'
```

### Example 5: Claude Deleting a Story

```bash
STORY_ID="abc123..."

curl -X DELETE "http://localhost:3000/api/stories/$STORY_ID?project=Sales%20Genie" \
  -H 'Authorization: Bearer eyJhbGc...'
```

---

## Developer Workflow with Claude

1. **Story Creation**: Claude identifies a feature need and creates a user story via `POST /api/stories`
2. **Task Breakdown**: Claude breaks the story into tasks using `POST /api/stories/{id}/tasks`
3. **Development**: As Claude works on each task, it updates progress via `PATCH /api/tasks/{id}/status`
4. **Story Completion**: When all tasks are done, Claude updates the story status to TESTING or COMPLETE via `PUT /api/stories/{id}`
5. **Testing**: After testing, Claude moves the story to COMPLETE

---

## Database Migration Required

Before using the API, run this migration to create the tasks table:

```sql
-- File: supabase/migrations/create_tasks_table.sql
-- Run via: Supabase dashboard or migration tool
```

The migration creates:
- `tasks` table with proper foreign keys
- Indexes for performance
- Updated_at trigger
- Constraints for data integrity

---

## Notes

- All timestamps are in ISO 8601 format with UTC timezone
- Story IDs and Task IDs are UUIDs
- The `project` query parameter must exactly match your project name
- Tasks automatically inherit project context from their parent story
- Display order is automatically managed - new items are appended to the end
