-- BubbleUp Simple Schema - Direct mapping to app structure
-- Run this in Supabase SQL Editor

-- Drop existing complex schema if needed
-- DROP TABLE IF EXISTS stories CASCADE;
-- DROP TABLE IF EXISTS epics CASCADE;
-- DROP TABLE IF EXISTS team_members CASCADE;
-- DROP TABLE IF EXISTS teams CASCADE;

-- Single table for backlog items
CREATE TABLE IF NOT EXISTS backlog_items (
    id TEXT PRIMARY KEY,
    project TEXT NOT NULL,
    epic TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    user_story TEXT NOT NULL,
    acceptance_criteria JSONB DEFAULT '[]'::jsonb,
    effort INTEGER DEFAULT 0,
    business_value INTEGER DEFAULT 0,
    dependencies JSONB DEFAULT '[]'::jsonb,
    technical_notes TEXT DEFAULT '',
    owner TEXT DEFAULT '',
    is_next BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for project filtering
CREATE INDEX IF NOT EXISTS idx_backlog_items_project ON backlog_items(project);
CREATE INDEX IF NOT EXISTS idx_backlog_items_status ON backlog_items(status);
CREATE INDEX IF NOT EXISTS idx_backlog_items_priority ON backlog_items(priority);

-- Enable Row Level Security (for now, allow all access - can be restricted later)
ALTER TABLE backlog_items ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all access to backlog_items"
    ON backlog_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_backlog_items_updated_at
    BEFORE UPDATE ON backlog_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
