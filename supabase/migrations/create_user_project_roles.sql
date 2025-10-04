-- Create user_project_roles table
-- This table manages user roles on a per-project basis

CREATE TABLE IF NOT EXISTS user_project_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project)
);

-- Create index for faster lookups
CREATE INDEX idx_user_project_roles_user_id ON user_project_roles(user_id);
CREATE INDEX idx_user_project_roles_project ON user_project_roles(project);

-- Enable Row Level Security
ALTER TABLE user_project_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON user_project_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can manage all roles (to be implemented with admin flag)
-- For now, allow authenticated users to read all roles
CREATE POLICY "Authenticated users can view all roles"
  ON user_project_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Service role can do everything (for admin API)
CREATE POLICY "Service role full access"
  ON user_project_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_project_roles_updated_at
  BEFORE UPDATE ON user_project_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment on table
COMMENT ON TABLE user_project_roles IS 'Manages user roles on a per-project basis. Roles: admin (full access), member (read/write), viewer (read-only)';
