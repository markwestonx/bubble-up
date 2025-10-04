-- Add created_by column to track who created each backlog item
ALTER TABLE backlog_items
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_backlog_items_created_by
  ON backlog_items(created_by);

-- For existing items without a created_by, we can't retroactively assign ownership
-- They will remain NULL and will be editable by all editors/admins
