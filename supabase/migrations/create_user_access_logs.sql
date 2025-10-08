-- Migration: Create user access logs table
-- Purpose: Track successful and failed login attempts
-- Date: 2025-10-08

-- Create user_access_logs table
CREATE TABLE IF NOT EXISTS user_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('login_success', 'login_failure')),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Additional context
    metadata JSONB DEFAULT '{}'
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_user_access_logs_user_id ON user_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_logs_email ON user_access_logs(email);
CREATE INDEX IF NOT EXISTS idx_user_access_logs_event_type ON user_access_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_user_access_logs_created_at ON user_access_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own access logs
CREATE POLICY "Users can view their own access logs"
    ON user_access_logs
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Admins can view all access logs
CREATE POLICY "Admins can view all access logs"
    ON user_access_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_project_roles
            WHERE user_id = auth.uid()
            AND project = 'ALL'
            AND role = 'admin'
        )
    );

-- Policy: Service role can insert (for API logging)
CREATE POLICY "Service role can insert logs"
    ON user_access_logs
    FOR INSERT
    WITH CHECK (true);

-- Function to get last successful login for a user
CREATE OR REPLACE FUNCTION get_last_login(p_user_id UUID)
RETURNS TIMESTAMPTZ AS $$
BEGIN
    RETURN (
        SELECT created_at
        FROM user_access_logs
        WHERE user_id = p_user_id
        AND event_type = 'login_success'
        ORDER BY created_at DESC
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count failed login attempts in last hour
CREATE OR REPLACE FUNCTION count_recent_failed_logins(p_email TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM user_access_logs
        WHERE email = p_email
        AND event_type = 'login_failure'
        AND created_at > NOW() - INTERVAL '1 hour'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
