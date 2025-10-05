---
description: Create a new user story in BubbleUp with interactive prompts
allowed-tools: Bash(node bubble-story-creator.js)
---

Run the interactive BubbleUp story creator to create a new user story with structured prompts.

Execute: `node bubble-story-creator.js`

This will guide you through:
- Selecting a project
- Assigning the story to a team member
- Choosing an epic
- Writing the user story
- Adding acceptance criteria
- Setting priority, effort, and business value
- Adding technical notes and dependencies
- Marking as "Next up" if needed

The story will be created with:
- Sequential ID (automatically calculated)
- Your user details as creator (from .bubbleup-config.json)
- Proper display order within the project
