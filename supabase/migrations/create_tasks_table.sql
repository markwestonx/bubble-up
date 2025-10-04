-- Create tasks table for breaking down user stories into granular tasks
-- Tasks are linked to backlog_items (user stories) via foreign key

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  backlog_item_id TEXT NOT NULL REFERENCES backlog_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Blocked', 'Done')),
  effort INTEGER, -- Story points or hours estimate
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_backlog_item_id ON tasks(backlog_item_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_display_order ON tasks(backlog_item_id, display_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- Add comment explaining the table
COMMENT ON TABLE tasks IS 'Granular tasks that break down user stories into actionable items';
COMMENT ON COLUMN tasks.backlog_item_id IS 'Foreign key to backlog_items (user story this task belongs to)';
COMMENT ON COLUMN tasks.status IS 'Task status: To Do, In Progress, Blocked, or Done';
COMMENT ON COLUMN tasks.progress IS 'Completion percentage (0-100)';
COMMENT ON COLUMN tasks.display_order IS 'Order of tasks within a story';
