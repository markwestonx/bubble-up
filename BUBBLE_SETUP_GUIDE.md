# BubbleUp Story Creator - Setup Guide

## Overview
The `/bubble` command allows you to interactively create user stories in BubbleUp with structured prompts.

## Setup for New Users (e.g., Jinal Shah)

### Prerequisites
- Node.js installed
- Access to the BubbleUp repository
- Supabase credentials

### Installation Steps

#### 1. Copy Configuration File
Create `.bubbleup-config.json` in your home directory with YOUR user details:

**For Jinal Shah:**
```json
{
  "currentUser": {
    "name": "Jinal Shah",
    "email": "jinal.shah@regulativ.ai",
    "uuid": "9e09e6b9-fa9d-4cb9-8583-22cbb50e55b5",
    "role": "Admin"
  },
  "users": [
    {
      "name": "Mark Weston",
      "firstName": "Mark",
      "lastName": "Weston",
      "email": "mark.weston@regulativ.ai",
      "alternateEmails": ["mark.x.weston@gmail.com"],
      "uuid": "88c48796-c1a2-471d-808d-8f72f38d8359",
      "aliases": ["Mark", "mark", "MW"]
    },
    {
      "name": "Jinal Shah",
      "firstName": "Jinal",
      "lastName": "Shah",
      "email": "jinal.shah@regulativ.ai",
      "alternateEmails": [],
      "uuid": "9e09e6b9-fa9d-4cb9-8583-22cbb50e55b5",
      "aliases": ["Jinal", "jinal", "JS", "me"]
    }
  ],
  "projects": [
    {
      "name": "Sales Genie",
      "epics": ["Lead Discovery", "Outreach", "Messaging", "Analytics", "Foundation"]
    },
    {
      "name": "BubbleUp",
      "epics": ["Foundation", "API", "Authentication", "Authorization", "UI/UX"]
    },
    {
      "name": "GTM Spike",
      "epics": ["Foundation", "Research", "Strategy"]
    },
    {
      "name": "ISO27001",
      "epics": ["Security Controls", "Compliance", "Documentation", "Audit", "Foundation"]
    },
    {
      "name": "Horizon Xceed",
      "epics": ["Deployment", "Infrastructure", "Foundation"]
    },
    {
      "name": "AI Governor",
      "epics": ["Authentication", "Governance", "Compliance", "Foundation"]
    },
    {
      "name": "SOC",
      "epics": ["Foundation", "Monitoring", "Incident Response", "Threat Detection", "Integration", "Compliance"]
    },
    {
      "name": "Cyber Essentials",
      "epics": ["Foundation", "Technical Controls", "Organizational Controls", "Certification", "Documentation"]
    }
  ],
  "priorities": ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
  "statuses": ["NOT_STARTED", "IN_PROGRESS", "TESTING", "BLOCKED", "COMPLETE"],
  "effortPoints": [1, 2, 3, 5, 8, 13]
}
```

**IMPORTANT:** Change `currentUser` to YOUR details. The `uuid` must match your Supabase auth user ID.

#### 2. Copy Config to Multiple Locations
The tool searches for config in this order:
1. Project root: `C:\Users\<you>\OneDrive\Desktop\bubbleup\.bubbleup-config.json`
2. Desktop: `C:\Users\<you>\OneDrive\Desktop\.bubbleup-config.json`
3. Home directory: `C:\Users\<you>\.bubbleup-config.json`

**Recommended:** Copy to all three locations for maximum compatibility.

#### 3. Ensure .env.local Access
The `.env.local` file in the project root must contain:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
```

**Security Note:** This contains admin credentials. Do not commit to git.

#### 4. Install Dependencies (if needed)
```bash
cd C:\Users\<you>\OneDrive\Desktop\bubbleup
npm install
```

### Usage

#### From Project Directory:
```bash
npm run bubble
```

#### From Anywhere (if using slash command):
```bash
/bubble
```

#### Via Node:
```bash
node bubble-story-creator.js
```

## Features

### Smart User Assignment
- Type "me" or "myself" to assign to yourself
- Type first name, last name, or email to assign to team members
- Type "unassigned" or leave blank for unassigned stories

### Validation
- **Priority:** CRITICAL, HIGH, MEDIUM, LOW
- **Effort:** Fibonacci points (1, 2, 3, 5, 8, 13)
- **Business Value:** 1-10 scale
- **Epic:** Project-specific or custom
- **Acceptance Criteria:** Multiple criteria supported

### Sequential ID Generation
Stories are automatically assigned the next sequential ID (e.g., 144, 145, 146) based on existing backlog items.

### Display Order
Stories are appended to the end of the project backlog with automatic display_order calculation.

## Troubleshooting

### "Config not found" Error
- Ensure `.bubbleup-config.json` exists in one of the three search locations
- Check that the file is valid JSON (use a JSON validator)

### "env.local not found" Error
- Ensure `.env.local` exists in the project root
- Verify it contains both required environment variables

### Wrong "Created By" User
- Check that `currentUser` in your config matches YOUR details
- Verify the `uuid` matches your Supabase auth user ID

### Story Not Appearing in UI
- Check Supabase database to confirm story was created
- Verify the `project` name matches exactly (case-sensitive)
- Check console for errors

## Getting Your UUID

If you don't know your Supabase user UUID:

1. **Via Supabase Dashboard:**
   - Go to Authentication → Users
   - Find your email
   - Copy the UUID

2. **Via SQL:**
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'your.email@regulativ.ai';
   ```

3. **Ask Mark** - He has admin access and can look it up

## Support

Questions? Ask Mark Weston or check the BubbleUp documentation.
