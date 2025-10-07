# BubbleUp Documentation API - Claude Integration Guide

## Overview
This API allows Claude to automatically capture and store valuable development context, decisions, and progress updates to BubbleUp user stories.

## Base URL
```
http://localhost:3000/api/documentation
```

## Authentication
Use the Supabase service role key or user authentication token.

```bash
# Using environment variable
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

## Documentation Types

Claude can log the following types of information:

| Type | Description | When to Use |
|------|-------------|-------------|
| `design` | Design decisions and architecture | When explaining system design, data models, architecture choices |
| `plan` | Implementation plans | When outlining how to implement a feature or fix |
| `progress` | Implementation progress updates | During development to track what's been done |
| `next_steps` | Next steps and recommendations | After completing work or when blocked |
| `testing` | Test results and coverage | After running tests or describing test strategy |
| `requirements` | Requirements clarifications | When clarifying or expanding on requirements |
| `feedback` | User feedback and responses | When responding to user questions or providing guidance |
| `build_log` | Build results | After running build commands |
| `test_result` | Test execution results | After running test suites |
| `decision_log` | Technical decisions | When making technical trade-offs or choices |
| `technical_note` | Technical notes and insights | General technical observations |
| `error` | Error reports and debugging | When encountering or fixing errors |
| `success` | Success reports and completions | When successfully completing a task |

---

## API Endpoints

### 1. Create Documentation Entry

**POST** `/api/documentation`

Creates a new documentation entry linked to a user story.

#### Request Body

```json
{
  "story_id": "195",
  "doc_type": "progress",
  "title": "Implemented database schema for documentation system",
  "content": "Created the documentation table with support for versioning, cross-story linking, and multiple document types. Includes RLS policies and indexes for performance.",
  "tags": ["database", "schema", "phase-1"],
  "links": [
    {"url": "https://supabase.com/docs", "title": "Supabase Docs"}
  ],
  "related_stories": ["196", "197"],
  "category": "backend",
  "priority": "high",
  "metadata": {
    "duration_minutes": 45,
    "files_modified": ["migrations/add-documentation-system.sql"]
  }
}
```

#### Required Fields
- `story_id` (string): The ID of the story this documentation relates to
- `doc_type` (enum): One of the documentation types listed above
- `title` (string): Brief title for the documentation entry
- `content` (string): Full content of the documentation

#### Optional Fields
- `tags` (string[]): Array of tags for categorization
- `links` (object[]): Array of {url, title} objects
- `related_stories` (string[]): IDs of related stories
- `category` (string): Category (default: "general")
- `priority` (string): Priority level (default: "medium")
- `metadata` (object): Additional structured data

#### Example cURL Command

```bash
curl -X POST http://localhost:3000/api/documentation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "story_id": "195",
    "doc_type": "progress",
    "title": "Database schema implemented",
    "content": "Successfully created documentation table with all required fields and indexes."
  }'
```

#### Success Response

```json
{
  "documentation": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "story_id": "195",
    "doc_type": "progress",
    "title": "Database schema implemented",
    "content": "Successfully created documentation table...",
    "author": "Claude",
    "author_email": "user@example.com",
    "created_at": "2025-10-07T15:30:00Z",
    "version_number": 1,
    "is_latest": true,
    "tags": [],
    "links": [],
    "related_stories": []
  }
}
```

### 2. Retrieve Documentation

**GET** `/api/documentation?story_id=195`

Retrieves documentation entries for a story.

#### Query Parameters

- `story_id` (optional): Filter by story ID
- `doc_type` (optional): Filter by documentation type
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `include_versions` (optional): Include all versions, not just latest (default: false)

#### Example Requests

```bash
# Get all documentation for story 195
curl http://localhost:3000/api/documentation?story_id=195 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only progress updates
curl http://localhost:3000/api/documentation?story_id=195&doc_type=progress \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get with pagination
curl http://localhost:3000/api/documentation?story_id=195&limit=10&offset=0 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Success Response

```json
{
  "documentation": [
    {
      "id": "...",
      "story_id": "195",
      "doc_type": "progress",
      "title": "Database schema implemented",
      "content": "...",
      "created_at": "2025-10-07T15:30:00Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

### 3. Update Documentation (Create New Version)

**PATCH** `/api/documentation?id=DOC_ID`

Updates documentation by creating a new version. The old version is preserved.

#### Request Body

```json
{
  "content": "Updated content with additional details...",
  "title": "Updated title (optional)",
  "tags": ["updated", "tags"],
  "related_stories": ["195", "196", "197"]
}
```

---

## Common Use Cases

### 1. Logging a Design Decision

```bash
curl -X POST http://localhost:3000/api/documentation \
  -H "Content-Type: application/json" \
  -d '{
    "story_id": "195",
    "doc_type": "design",
    "title": "Chose PostgreSQL ENUM for doc_type field",
    "content": "Decided to use PostgreSQL ENUM type for doc_type field instead of TEXT with CHECK constraint. Benefits: Type safety, better performance, and automatic validation. Trade-off: Requires migration to add new types.",
    "tags": ["database", "design-decision"],
    "category": "architecture"
  }'
```

### 2. Logging Implementation Progress

```bash
curl -X POST http://localhost:3000/api/documentation \
  -H "Content-Type: application/json" \
  -d '{
    "story_id": "196",
    "doc_type": "progress",
    "title": "POST /api/documentation endpoint completed",
    "content": "Implemented the POST endpoint with:\n- Request validation\n- RBAC permission checking\n- Foreign key validation\n- Error handling\n- RLS policy enforcement\n\nTested manually with curl. Ready for UI integration.",
    "tags": ["api", "backend", "completed"],
    "priority": "high"
  }'
```

### 3. Logging Next Steps

```bash
curl -X POST http://localhost:3000/api/documentation \
  -H "Content-Type: application/json" \
  -d '{
    "story_id": "198",
    "doc_type": "next_steps",
    "title": "Next: Implement documentation modal UI",
    "content": "Remaining tasks:\n1. Create DocumentationModal component\n2. Add documentation icon to story cards\n3. Implement filtering by doc_type\n4. Add syntax highlighting for code blocks\n5. Test with real data\n\nEstimated time: 2-3 hours",
    "related_stories": ["195", "196", "197"]
  }'
```

### 4. Logging Test Results

```bash
curl -X POST http://localhost:3000/api/documentation \
  -H "Content-Type: application/json" \
  -d '{
    "story_id": "196",
    "doc_type": "test_result",
    "title": "API endpoint tests passed",
    "content": "Manual testing results:\n✅ POST with valid data: Success\n✅ POST without auth: 401 Unauthorized\n✅ POST with invalid story_id: 404 Not Found\n✅ POST with invalid doc_type: 400 Bad Request\n✅ GET with filters: Success\n✅ RBAC enforcement: Working correctly",
    "tags": ["testing", "api", "passed"],
    "metadata": {
      "tests_run": 6,
      "tests_passed": 6,
      "tests_failed": 0
    }
  }'
```

### 5. Logging an Error and Resolution

```bash
curl -X POST http://localhost:3000/api/documentation \
  -H "Content-Type: application/json" \
  -d '{
    "story_id": "197",
    "doc_type": "error",
    "title": "Fixed RLS policy blocking reads",
    "content": "Error: Users could not read documentation even for accessible stories.\n\nRoot cause: RLS policy was checking user_project_roles but not handling the case where user has ALL access.\n\nFix: Updated policy to include OR upr.project = '"'ALL'"' condition.\n\nVerified: Users with ALL access can now read all documentation.",
    "tags": ["bug", "rls", "fixed"],
    "priority": "high"
  }'
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "doc_type must be one of: design, plan, progress, ..."
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Permission denied. You cannot create documentation for this project."
}
```

### 404 Not Found
```json
{
  "error": "Story not found or access denied"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Best Practices for Claude

1. **Be Specific**: Use descriptive titles and detailed content
2. **Tag Appropriately**: Use tags to make documentation searchable
3. **Link Related Stories**: Reference related stories for context
4. **Choose the Right Type**: Use the most specific doc_type for the content
5. **Include Metadata**: Add structured data when relevant (duration, files, etc.)
6. **Update When Needed**: Create new versions when information changes
7. **Log Decisions**: Always document "why" behind technical choices
8. **Track Progress**: Regular progress updates help stakeholders
9. **Document Errors**: Log both problems and solutions
10. **Celebrate Success**: Log completions and achievements

---

## Integration with Claude Code

Claude can automatically detect and log:

- When implementing features → `progress` documentation
- When making design choices → `design` documentation
- When encountering errors → `error` documentation
- When completing tasks → `success` documentation
- When planning work → `plan` documentation
- After testing → `testing` or `test_result` documentation

---

## Support

For issues or questions, reference story #201 in BubbleUp.
