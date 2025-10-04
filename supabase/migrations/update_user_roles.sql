-- Update user_project_roles table to support 4 role types as per Story 120

-- Drop the existing constraint
ALTER TABLE user_project_roles
DROP CONSTRAINT IF EXISTS user_project_roles_role_check;

-- Add new constraint with 4 roles
ALTER TABLE user_project_roles
ADD CONSTRAINT user_project_roles_role_check
CHECK (role IN ('admin', 'editor', 'read_write', 'read_only'));

-- Update table comment
COMMENT ON TABLE user_project_roles IS 'Manages user roles on a per-project basis. Roles: admin (full access), editor (modify projects/items), read_write (create/edit items), read_only (view only)';
