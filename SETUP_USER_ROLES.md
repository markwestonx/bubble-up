# Setup User Project Roles

## Step 1: Create the Database Table

You need to run the SQL migration to create the `user_project_roles` table in your Supabase database.

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project SQL Editor:
   **https://app.supabase.com/project/bzqgoppjuynxfyrrhsbg/sql/new**

2. Copy the entire contents of:
   `supabase/migrations/create_user_project_roles.sql`

3. Paste it into the SQL Editor

4. Click "Run" to execute the migration

### Option B: View the SQL

The migration file is located at:
`C:\Users\m\OneDrive\Desktop\bubbleup\supabase\migrations\create_user_project_roles.sql`

## Step 2: Test the Feature

1. Go to http://localhost:3005

2. Log in with your credentials

3. Click the Users icon (👥) in the top toolbar

4. You should see the User Management page

5. For each user, click "Manage Roles" to:
   - Assign roles per project (Admin, Member, or Viewer)
   - View current project assignments
   - Remove project access

## Role Permissions

- **Admin**: Full access - can view, edit, delete, and manage users for that project
- **Member**: Can view and edit items in that project
- **Viewer**: Read-only access to that project

## What Was Implemented

### Files Created:
1. `app/admin/users/UserRolesManager.tsx` - Modal component for managing user roles per project
2. `app/api/admin/user-roles/route.ts` - API endpoints for role management (GET/POST/DELETE)
3. `supabase/migrations/create_user_project_roles.sql` - Database schema for user_project_roles table

### Files Modified:
1. `app/admin/users/page.tsx` - Added "Manage Roles" button for each user

### Database Schema:
```sql
user_project_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  project TEXT,
  role TEXT CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, project)
)
```

## Testing Checklist

- [ ] Run the SQL migration in Supabase
- [ ] Restart the dev server if needed
- [ ] Open User Management page
- [ ] Click "Manage Roles" for a user
- [ ] Assign a role to a project
- [ ] Verify the role appears in the list
- [ ] Change a role (should update, not create duplicate)
- [ ] Remove a role
- [ ] Verify the role is deleted
