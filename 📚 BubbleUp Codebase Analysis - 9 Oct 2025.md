📚 BubbleUp Codebase Analysis - 9 October 2025

Claude read and analyzed the entire BubbleUp codebase. Here's a complete summary:


🎯 Project Overview

BubbleUp is a modern, real-time agile backlog management system built with Next.js 15, Supabase, and TypeScript. It's designed for teams to manage user stories, epics, and sprint planning with drag-and-drop functionality and persistent storage.

🏗️ Tech Stack

  - Frontend: Next.js 15 (App Router), React 19, TypeScript
  - UI/Styling: Tailwind CSS 4, Lucide React icons
  - Backend: Supabase (PostgreSQL + Auth + Real-time)
  - State Management: TanStack React Query, Custom hooks
  - DnD: @dnd-kit for drag-and-drop reordering
  - Authentication: Supabase Auth with JWT
  - Deployment: Vercel-ready

📁 Project Structure

  bubbleup/
  ├── app/                          # Next.js App Router
  │   ├── page.tsx                  # Main backlog board (large, complex)
  │   ├── login/page.tsx            # Login with access logging
  │   ├── register/page.tsx         # User registration
  │   ├── profile/page.tsx          # Password change & profile
  │   ├── admin/page.tsx            # Admin user management
  │   └── api/                      # API routes
  │       ├── backlog/route.ts      # CRUD for backlog items (RBAC)
  │       ├── stories/route.ts      # Story search & creation
  │       ├── documentation/route.ts # Documentation CRUD
  │       ├── permissions/route.ts   # Permission checks
  │       ├── admin/
  │       │   ├── invite/route.ts   # User invitation
  │       │   └── user-roles/route.ts # Role management
  │       └── access-log/route.ts   # Login attempt logging
  ├── lib/
  │   ├── supabase/                 # Supabase clients
  │   │   ├── client.ts             # Browser client (singleton)
  │   │   ├── server.ts             # Server client (SSR)
  │   │   └── middleware.ts         # Auth refresh
  │   ├── types.ts                  # Database types
  │   ├── rbac.ts                   # Legacy RBAC (deprecated)
  │   ├── api-auth.ts               # API authentication
  │   └── auth.ts                   # Server-side auth helpers
  ├── hooks/
  │   ├── usePermissions.ts         # Permission checking hook
  │   └── useAuthorizedProjects.ts  # Project access hook
  ├── components/
  │   └── DocumentationModal.tsx    # Documentation UI
  ├── scripts/                      # CLI tools
  │   ├── bubble-story-creator.js   # Interactive story creator
  │   ├── test-documentation.js     # Doc API testing
  │   └── [other utility scripts]
  ├── middleware.ts                 # Next.js auth middleware
  └── SUPABASE_SCHEMA.sql          # Database schema

🗄️ Database Schema

Core Tables:

  1. backlog_items - User stories with:
    - id (string), project, epic, priority, status
    - user_story, acceptance_criteria[], technical_notes
    - effort (Fibonacci), business_value (1-10)
    - assigned_to, created_by, is_next (star flag)
    - display_order for DnD ordering
  2. user_project_roles - RBAC:
    - user_id, project, role (admin/editor/contributor/read_only)
    - Supports "ALL" project wildcard
  3. documentation - Story documentation:
    - story_id, doc_type, title, content
    - author, author_email, tags[], links[]
    - Versioning support (version_number, is_latest, parent_doc_id)
  4. user_access_log - Security logging:
    - Login success/failure tracking
    - User activity audit trail

🔐 Authentication & Authorization

Role-Based Access Control (RBAC):

  - Admin: Full access (create, edit, delete, manage users)
  - Editor: Create, edit, manage projects (no delete)
  - Contributor: Create, edit own stories only
  - Read Only: View access only

Security Features:

  - JWT-based auth via Supabase
  - Row Level Security (RLS) policies at database level
  - API authentication with Bearer tokens
  - Access logging for failed/successful logins
  - Password reset functionality
  - Temporary password system for new users

Permission Enforcement:

  - Client-side: usePermissions hook
  - Server-side: authenticateRequest() middleware
  - Database-level: RLS policies
  - Contributor role can only edit items they created (created_by field)

✨ Key Features

  1. Main Backlog Board (app/page.tsx)

  - Drag-and-drop story reordering
  - Inline editing (story, criteria, notes, etc.)
  - Multi-select status/priority filtering
  - Epic-based organization
  - "Next Up" star flagging
  - Expandable detail views
  - Project switcher dropdown
  - Documentation icon (glowing if has docs)

  2. Documentation System

  - 13 doc types: design, plan, progress, testing, etc.
  - Version history tracking
  - Rich markdown content
  - Tags, links, related stories
  - Modal UI with type filtering
  - CRUD operations with permissions

  3. Admin Dashboard (app/admin/page.tsx)

  - User management (view by users or projects)
  - Role assignment (with multi-project support)
  - User invitation with temp passwords
  - Password reset functionality
  - Expandable user/project views

  4. CLI Tool (bubble-story-creator.js)

  - Interactive story creation
  - Full CRUD operations
  - User assignment with fuzzy search
  - Project statistics
  - Documentation creation
  - Authenticated operations (respects RBAC)

🔄 Data Flow

  Read Flow:

  User → usePermissions hook → API route (auth check) → Supabase query (RLS) → UI

  Write Flow:

  User action → Permission check → API route (RBAC) → Supabase mutation → React Query refetch

  Documentation Flow:

  Story view → Doc icon click → Modal → API (Bearer auth) → Supabase JSONB → Version tracking

🚀 Deployment & Scripts

  NPM Scripts:

  - npm run dev - Development server (Turbopack)
  - npm run build - Production build
  - npm run bubble - CLI story creator
  - npm run setup - User setup
  - npm run backup - Database backup

  Environment Variables:

  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY (for admin operations)

🔧 Notable Implementation Details

  1. Dual Supabase Clients:
    - Browser client (singleton in lib/supabase/client.ts)
    - Server client (per-request in lib/supabase/server.ts)
  2. RBAC Evolution:
    - Old system: lib/rbac.ts (deprecated)
    - New system: lib/api-auth.ts + database RLS
  3. Creator Tracking:
    - All stories track created_by user ID
    - Used for contributor permission checks
    - Displayed as creator_email in UI
  4. Access Logging:
    - Login success/failure events
    - Stored in user_access_log table
    - Uses keepalive to ensure request completes
  5. Documentation Versioning:
    - Each edit creates new version
    - parent_doc_id links to previous version
    - is_latest flag for current version

📊 Current State

  Based on the git status:
  - Working on various documentation/debug files
  - Recent commits focus on access logging and RBAC enforcement
  - Active development on user management features

💡 Key Insights

  1. Security-First Design: Multiple layers of auth (client, API, database)
  2. Flexible RBAC: Supports project-specific and global roles
  3. Audit Trail: Comprehensive logging of user actions
  4. Documentation-Centric: Built-in versioned documentation system
  5. Developer-Friendly: CLI tools for power users
  6. Production-Ready: Vercel deployment, environment configs, error handling

