-- Create table for storing user-specific custom order preferences
CREATE TABLE IF NOT EXISTS user_custom_order (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project TEXT NOT NULL,
  item_id TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project, item_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_custom_order_user_project
  ON user_custom_order(user_id, project);

-- Enable Row Level Security
ALTER TABLE user_custom_order ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own custom order
CREATE POLICY "Users can view their own custom order"
  ON user_custom_order
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own custom order
CREATE POLICY "Users can insert their own custom order"
  ON user_custom_order
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own custom order
CREATE POLICY "Users can update their own custom order"
  ON user_custom_order
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own custom order
CREATE POLICY "Users can delete their own custom order"
  ON user_custom_order
  FOR DELETE
  USING (auth.uid() = user_id);
