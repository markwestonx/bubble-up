-- Assign existing stories in Sales Genie, BubbleUp, GTM Spike, and ISO27001 to admin user
-- Admin: martinb@bubbleup.ai (d6026bb3-dbc9-4d05-be66-5a631f7e0377)
-- Run this migration after adding the created_by column

-- Update Sales Genie stories
UPDATE backlog_items
SET created_by = 'd6026bb3-dbc9-4d05-be66-5a631f7e0377'
WHERE project = 'Sales Genie'
  AND created_by IS NULL;

-- Update BubbleUp stories
UPDATE backlog_items
SET created_by = 'd6026bb3-dbc9-4d05-be66-5a631f7e0377'
WHERE project = 'BubbleUp'
  AND created_by IS NULL;

-- Update GTM Spike stories
UPDATE backlog_items
SET created_by = 'd6026bb3-dbc9-4d05-be66-5a631f7e0377'
WHERE project = 'GTM Spike'
  AND created_by IS NULL;

-- Update ISO27001 stories
UPDATE backlog_items
SET created_by = 'd6026bb3-dbc9-4d05-be66-5a631f7e0377'
WHERE project = 'ISO27001'
  AND created_by IS NULL;

-- Verify the updates
SELECT project, COUNT(*) as story_count, created_by
FROM backlog_items
WHERE project IN ('Sales Genie', 'BubbleUp', 'GTM Spike', 'ISO27001')
GROUP BY project, created_by
ORDER BY project;
