-- Migration: Rename read_write role to contributor
-- Purpose: Align database with code that uses 'contributor' instead of 'read_write'
-- Date: 2025-10-08

-- Step 1: Drop old constraint FIRST
ALTER TABLE user_project_roles
DROP CONSTRAINT IF EXISTS user_project_roles_role_check;

-- Step 2: Update all existing read_write roles to contributor
UPDATE user_project_roles
SET role = 'contributor'
WHERE role = 'read_write';

-- Step 3: Add new constraint with 'contributor' instead of 'read_write'
ALTER TABLE user_project_roles
ADD CONSTRAINT user_project_roles_role_check
CHECK (role IN ('admin', 'editor', 'contributor', 'read_only'));

-- Update table comment
COMMENT ON TABLE user_project_roles IS 'Manages user roles on a per-project basis. Roles: admin (full access), editor (modify projects/items), contributor (create/edit own items), read_only (view only)';

-- Update documentation policies to use 'contributor'
DROP POLICY IF EXISTS "Users can create documentation for editable projects" ON documentation;

CREATE POLICY "Users can create documentation for editable projects"
    ON documentation
    FOR INSERT
    WITH CHECK (
        story_id IN (
            SELECT bi.id
            FROM backlog_items bi
            JOIN user_project_roles upr ON upr.project = bi.project OR upr.project = 'ALL'
            WHERE upr.user_id = auth.uid()
            AND upr.role IN ('admin', 'editor', 'contributor')
        )
    );
