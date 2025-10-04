-- Assign ALL user stories in ALL projects to user with UUID 88c48796-c1a2-471d-808d-8f72f38d8359

-- Update ALL stories across all projects
UPDATE backlog_items
SET assigned_to = '88c48796-c1a2-471d-808d-8f72f38d8359';

-- Verify the updates - show all projects
SELECT
  project,
  COUNT(*) as story_count,
  assigned_to,
  (SELECT email FROM auth.users WHERE id = assigned_to) as assigned_email
FROM backlog_items
GROUP BY project, assigned_to
ORDER BY project;
