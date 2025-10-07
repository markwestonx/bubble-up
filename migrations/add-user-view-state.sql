-- Migration: Add user_view_state table
-- Purpose: Store per-user view preferences for BubbleUp application
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_view_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_project TEXT DEFAULT 'All Projects',
    sort_by TEXT DEFAULT 'custom',
    sort_direction TEXT DEFAULT 'asc',
    filter_epic TEXT DEFAULT 'all',
    filter_priority TEXT DEFAULT 'all',
    filter_status TEXT DEFAULT 'all',
    is_custom_order BOOLEAN DEFAULT false,
    expanded_items JSONB DEFAULT '[]'::jsonb,
    context_menu_filters JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_view_state_user_id ON user_view_state(user_id);

-- Enable Row Level Security
ALTER TABLE user_view_state ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/write their own view state
CREATE POLICY "Users can manage their own view state"
    ON user_view_state
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_user_view_state_updated_at
    BEFORE UPDATE ON user_view_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
