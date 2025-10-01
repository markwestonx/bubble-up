-- BubbleUp Supabase Database Schema
-- This file contains the complete database schema for BubbleUp agile backlog management
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table (for multi-tenancy support)
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table (for user access control)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Epics table (for organizing stories)
CREATE TABLE epics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT 'blue', -- For UI styling (blue, green, purple, orange, etc.)
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories table (main backlog items)
CREATE TABLE stories (
    id TEXT PRIMARY KEY, -- e.g., '001', '002', '003'
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    epic_id UUID REFERENCES epics(id) ON DELETE SET NULL,
    epic_name TEXT, -- Denormalized for easier queries
    story TEXT NOT NULL,
    details TEXT,
    acceptance_criteria TEXT,
    notes TEXT,
    owner TEXT,
    dependencies TEXT, -- Comma-separated story IDs
    status TEXT DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, TESTING, BLOCKED, COMPLETE
    priority TEXT DEFAULT 'MEDIUM', -- CRITICAL, HIGH, MEDIUM, LOW
    display_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_stories_team_id ON stories(team_id);
CREATE INDEX idx_stories_epic_id ON stories(epic_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_priority ON stories(priority);
CREATE INDEX idx_stories_display_order ON stories(display_order);
CREATE INDEX idx_epics_team_id ON epics(team_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Users can view their teams"
    ON teams FOR SELECT
    USING (id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create teams"
    ON teams FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Team owners can update their teams"
    ON teams FOR UPDATE
    USING (id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ));

-- RLS Policies for team_members
CREATE POLICY "Users can view their team members"
    ON team_members FOR SELECT
    USING (team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can join teams"
    ON team_members FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for epics
CREATE POLICY "Users can view their team's epics"
    ON epics FOR SELECT
    USING (team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create epics for their teams"
    ON epics FOR INSERT
    WITH CHECK (team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their team's epics"
    ON epics FOR UPDATE
    USING (team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ));

-- RLS Policies for stories
CREATE POLICY "Users can view their team's stories"
    ON stories FOR SELECT
    USING (team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create stories for their teams"
    ON stories FOR INSERT
    WITH CHECK (team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their team's stories"
    ON stories FOR UPDATE
    USING (team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their team's stories"
    ON stories FOR DELETE
    USING (team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ));

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_epics_updated_at
    BEFORE UPDATE ON epics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed initial epics for a team (you'll need to replace TEAM_ID after creating a team)
-- This can be run after you create your first team via the app

-- Example seed data (uncomment and replace TEAM_ID after team creation):
/*
INSERT INTO epics (team_id, name, description, color, display_order) VALUES
    ('YOUR_TEAM_ID', 'Foundation', 'Core infrastructure and setup', 'blue', 1),
    ('YOUR_TEAM_ID', 'Agent Development', 'AI agent implementation', 'purple', 2),
    ('YOUR_TEAM_ID', 'Fanatical Prospecting', 'Sales campaign features', 'orange', 3),
    ('YOUR_TEAM_ID', 'API Integration', 'External service integrations', 'green', 4),
    ('YOUR_TEAM_ID', 'Infrastructure', 'DevOps and system management', 'red', 5),
    ('YOUR_TEAM_ID', 'Architecture & Design', 'Technical documentation', 'indigo', 6),
    ('YOUR_TEAM_ID', 'Production', 'Deployment and scaling', 'yellow', 7),
    ('YOUR_TEAM_ID', 'Content Generation', 'AI content creation', 'pink', 8),
    ('YOUR_TEAM_ID', 'Social Media', 'Social platform automation', 'cyan', 9),
    ('YOUR_TEAM_ID', 'CRM & Pipeline', 'Sales pipeline management', 'teal', 10),
    ('YOUR_TEAM_ID', 'Analytics & Insights', 'Reporting and analytics', 'violet', 11);
*/
