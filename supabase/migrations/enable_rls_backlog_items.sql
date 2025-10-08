-- Migration: Enable Row Level Security on backlog_items
-- Purpose: Enforce RBAC at the database level to prevent direct access bypassing permissions
-- Date: 2025-10-08

-- Enable RLS on backlog_items table
ALTER TABLE backlog_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view items from projects they have access to
CREATE POLICY "Users can view backlog items for their projects"
ON backlog_items
FOR SELECT
USING (
  project IN (
    SELECT upr.project
    FROM user_project_roles upr
    WHERE upr.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM user_project_roles upr
    WHERE upr.user_id = auth.uid()
    AND upr.project = 'ALL'
  )
);

-- Policy: Admins, editors, and contributors can create items in their projects
CREATE POLICY "Users with create permission can insert backlog items"
ON backlog_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_project_roles upr
    WHERE upr.user_id = auth.uid()
    AND (upr.project = backlog_items.project OR upr.project = 'ALL')
    AND upr.role IN ('admin', 'editor', 'contributor')
  )
);

-- Policy: Update permissions based on role
-- Admins and editors can update any item
-- Contributors can only update items they created
CREATE POLICY "Users can update backlog items based on role"
ON backlog_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_project_roles upr
    WHERE upr.user_id = auth.uid()
    AND (upr.project = backlog_items.project OR upr.project = 'ALL')
    AND (
      -- Admins and editors can update any item
      upr.role IN ('admin', 'editor')
      OR
      -- Contributors can only update items they created
      (upr.role = 'contributor' AND backlog_items.created_by = auth.uid())
    )
  )
);

-- Policy: ONLY admins can delete items
CREATE POLICY "Only admins can delete backlog items"
ON backlog_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_project_roles upr
    WHERE upr.user_id = auth.uid()
    AND (upr.project = backlog_items.project OR upr.project = 'ALL')
    AND upr.role = 'admin'
  )
);

-- Add helpful comment
COMMENT ON TABLE backlog_items IS 'User stories and backlog items with RLS enforcing project-based RBAC. Only admins can delete, contributors can only edit their own items.';
