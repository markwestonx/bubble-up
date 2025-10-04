-- Step 1: Add new assigned_to column as UUID
ALTER TABLE backlog_items
ADD COLUMN IF NOT EXISTS assigned_to UUID;

-- Step 2: Add foreign key constraint
ALTER TABLE backlog_items
ADD CONSTRAINT fk_assigned_to_user
FOREIGN KEY (assigned_to) REFERENCES auth.users(id);

-- Step 3: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_backlog_items_assigned_to
  ON backlog_items(assigned_to);

-- Step 4: Drop the old owner column (optional - keep if you want to preserve old data)
-- Uncomment the line below if you want to remove the owner column:
-- ALTER TABLE backlog_items DROP COLUMN IF EXISTS owner;
