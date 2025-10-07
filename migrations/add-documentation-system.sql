-- Migration: Add comprehensive documentation system
-- Purpose: Store Claude's development context, decisions, and progress updates
-- Run this in Supabase SQL Editor

-- Documentation types enum
CREATE TYPE doc_type AS ENUM (
  'design',           -- Design decisions and architecture
  'plan',             -- Implementation plans
  'progress',         -- Implementation progress updates
  'next_steps',       -- Next steps and recommendations
  'testing',          -- Test results and coverage
  'requirements',     -- Requirements clarifications
  'feedback',         -- User feedback and responses
  'build_log',        -- Build results
  'test_result',      -- Test execution results
  'decision_log',     -- Technical decisions
  'technical_note',   -- Technical notes and insights
  'error',            -- Error reports and debugging
  'success'           -- Success reports and completions
);

-- Main documentation table
CREATE TABLE IF NOT EXISTS documentation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id TEXT NOT NULL,
    doc_type doc_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT DEFAULT 'Claude',
    author_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    links JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',

    -- Versioning support
    version_number INTEGER DEFAULT 1,
    parent_doc_id UUID REFERENCES documentation(id) ON DELETE SET NULL,
    is_latest BOOLEAN DEFAULT true,

    -- Cross-story linking
    related_stories TEXT[] DEFAULT '{}',

    -- Categorization
    category TEXT DEFAULT 'general',
    priority TEXT DEFAULT 'medium',

    -- Foreign key to backlog items
    CONSTRAINT fk_story FOREIGN KEY (story_id)
        REFERENCES backlog_items(id)
        ON DELETE CASCADE
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_documentation_story_id ON documentation(story_id);
CREATE INDEX IF NOT EXISTS idx_documentation_doc_type ON documentation(doc_type);
CREATE INDEX IF NOT EXISTS idx_documentation_created_at ON documentation(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documentation_author ON documentation(author);
CREATE INDEX IF NOT EXISTS idx_documentation_is_latest ON documentation(is_latest);
CREATE INDEX IF NOT EXISTS idx_documentation_related_stories ON documentation USING GIN(related_stories);
CREATE INDEX IF NOT EXISTS idx_documentation_tags ON documentation USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view documentation for stories they have access to
CREATE POLICY "Users can view documentation for accessible stories"
    ON documentation
    FOR SELECT
    USING (
        story_id IN (
            SELECT bi.id
            FROM backlog_items bi
            JOIN user_project_roles upr ON upr.project = bi.project OR upr.project = 'ALL'
            WHERE upr.user_id = auth.uid()
        )
    );

-- Policy: Users can create documentation for stories in projects they can edit
CREATE POLICY "Users can create documentation for editable projects"
    ON documentation
    FOR INSERT
    WITH CHECK (
        story_id IN (
            SELECT bi.id
            FROM backlog_items bi
            JOIN user_project_roles upr ON upr.project = bi.project OR upr.project = 'ALL'
            WHERE upr.user_id = auth.uid()
            AND upr.role IN ('admin', 'editor', 'read_write')
        )
    );

-- Policy: Users can update their own documentation or if they're admin/editor
CREATE POLICY "Users can update documentation"
    ON documentation
    FOR UPDATE
    USING (
        author_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR story_id IN (
            SELECT bi.id
            FROM backlog_items bi
            JOIN user_project_roles upr ON upr.project = bi.project OR upr.project = 'ALL'
            WHERE upr.user_id = auth.uid()
            AND upr.role IN ('admin', 'editor')
        )
    );

-- Policy: Only admins and editors can delete documentation
CREATE POLICY "Admins and editors can delete documentation"
    ON documentation
    FOR DELETE
    USING (
        story_id IN (
            SELECT bi.id
            FROM backlog_items bi
            JOIN user_project_roles upr ON upr.project = bi.project OR upr.project = 'ALL'
            WHERE upr.user_id = auth.uid()
            AND upr.role IN ('admin', 'editor')
        )
    );

-- Auto-update timestamp trigger
CREATE TRIGGER update_documentation_updated_at
    BEFORE UPDATE ON documentation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Teams webhook configuration table
CREATE TABLE IF NOT EXISTS teams_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project TEXT NOT NULL UNIQUE,
    webhook_url TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    notify_on_status_change BOOLEAN DEFAULT true,
    notify_on_documentation BOOLEAN DEFAULT true,
    notify_on_story_create BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for teams webhooks
CREATE INDEX IF NOT EXISTS idx_teams_webhooks_project ON teams_webhooks(project);

-- Enable RLS for teams_webhooks
ALTER TABLE teams_webhooks ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage webhooks
CREATE POLICY "Admins can manage webhooks"
    ON teams_webhooks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_project_roles upr
            WHERE upr.user_id = auth.uid()
            AND (upr.project = teams_webhooks.project OR upr.project = 'ALL')
            AND upr.role = 'admin'
        )
    );

-- Auto-update timestamp trigger for teams_webhooks
CREATE TRIGGER update_teams_webhooks_updated_at
    BEFORE UPDATE ON teams_webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to get documentation summary for a story
CREATE OR REPLACE FUNCTION get_documentation_summary(p_story_id TEXT)
RETURNS TABLE (
    doc_type doc_type,
    count BIGINT,
    latest_created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.doc_type,
        COUNT(*)::BIGINT as count,
        MAX(d.created_at) as latest_created_at
    FROM documentation d
    WHERE d.story_id = p_story_id
    AND d.is_latest = true
    GROUP BY d.doc_type
    ORDER BY MAX(d.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get related documentation across stories
CREATE OR REPLACE FUNCTION get_related_documentation(p_story_ids TEXT[])
RETURNS TABLE (
    id UUID,
    story_id TEXT,
    doc_type doc_type,
    title TEXT,
    content TEXT,
    author TEXT,
    created_at TIMESTAMPTZ,
    related_stories TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.story_id,
        d.doc_type,
        d.title,
        d.content,
        d.author,
        d.created_at,
        d.related_stories
    FROM documentation d
    WHERE d.story_id = ANY(p_story_ids)
    OR d.related_stories && p_story_ids
    AND d.is_latest = true
    ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
