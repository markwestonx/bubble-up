const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AUTHOR = 'Claude';
const AUTHOR_EMAIL = 'claude_mw@regulativ.ai';

// Documentation for all 36 stories
// Each story gets 3 documentation entries: progress, next_steps, and testing

const documentationEntries = [
  // AJ-001: Next.js Setup
  {
    story_id: 'AJ-001',
    doc_type: 'progress',
    title: 'Next.js 15 Project Initialized',
    content: `## Completed Work

- ✅ Next.js 15 installed with App Router
- ✅ TypeScript configured with strict mode
- ✅ Tailwind CSS set up with custom config
- ✅ ESLint and Prettier configured
- ✅ Git repository initialized
- ✅ .gitignore properly configured

### Files Created
- package.json - Dependencies and scripts
- tsconfig.json - TypeScript configuration
- tailwind.config.ts - Tailwind setup
- next.config.js - Next.js optimizations with security headers
- .eslintrc.json - Linting rules

### Configuration Highlights
- SWC minification enabled
- Image optimization configured (AVIF, WebP)
- Compression enabled
- Security headers configured`,
    tags: ['foundation', 'setup', 'nextjs', 'typescript'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-001',
    doc_type: 'next_steps',
    title: 'Production Configuration Needed',
    content: `## Remaining Work

### Production Setup
- [ ] Configure proper domain in next.config.js
- [ ] Set up environment-specific configs (dev, staging, prod)
- [ ] Add Sentry or error tracking integration
- [ ] Configure analytics (Vercel Analytics, GA4)
- [ ] Set up CI/CD pipeline

### Optional Enhancements
- [ ] Add pre-commit hooks
- [ ] Configure VS Code workspace settings
- [ ] Add commit message linting (commitlint)
- [ ] Set up Husky for git hooks`,
    tags: ['production', 'deployment', 'devops'],
    category: 'deployment',
    priority: 'medium'
  },
  {
    story_id: 'AJ-001',
    doc_type: 'testing',
    title: 'Testing the Next.js Setup',
    content: `## How to Test

### 1. Development Server
\`\`\`bash
cd app
npm install
npm run dev
\`\`\`
Expected: Server starts on http://localhost:3001

### 2. Production Build
\`\`\`bash
npm run build
\`\`\`
Expected: Build completes with no errors

### 3. Type Check
\`\`\`bash
npx tsc --noEmit
\`\`\`
Expected: No type errors

### 4. Linting
\`\`\`bash
npm run lint
\`\`\`
Expected: No errors

### 5. Hot Reload
- Start dev server
- Edit any file (e.g., app/page.tsx)
- Save
- Browser should auto-refresh

### Success Criteria
✅ Dev server runs on port 3001
✅ No TypeScript errors
✅ Production build succeeds
✅ Hot reload works`,
    tags: ['testing', 'qa', 'setup'],
    category: 'general',
    priority: 'high'
  },

  // AJ-002: Supabase Database Schema
  {
    story_id: 'AJ-002',
    doc_type: 'progress',
    title: 'Complete Database Schema Implemented',
    content: `## Completed Work

### Database Schema Created
- ✅ 14 tables with proper relationships
- ✅ Row Level Security (RLS) policies on all tables
- ✅ Indexes for performance optimization
- ✅ Triggers for auto-updates (updated_at timestamps)
- ✅ Database functions for complex operations

### Tables Implemented
1. **user_profiles** - Extended user information
2. **specialist_profiles** - AI specialist profiles with ratings
3. **services** - Service offerings with pricing
4. **projects** - Active projects with status tracking
5. **inquiries** - Client inquiries to specialists
6. **proposals** - Specialist proposals with pricing
7. **reviews** - Project reviews and ratings
8. **messages** - Real-time chat messages
9. **conversations** - Message thread management
10. **ai_agents** - AI agent definitions and configs
11. **agent_executions** - Usage tracking and limits
12. **reports** - Content moderation system
13. **notifications** - User notifications
14. **project_deliverables** - File uploads for projects

### Security Features
- Row Level Security enforces user can only access their own data
- Secure functions for sensitive operations
- Foreign key constraints for data integrity
- Cascading deletes where appropriate

### File Location
- \`SUPABASE_SCHEMA.sql\` - Complete schema in project root`,
    tags: ['database', 'supabase', 'schema', 'rls'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-002',
    doc_type: 'next_steps',
    title: 'Production Database Setup',
    content: `## Remaining Work

### Production Setup
- [ ] Create production Supabase project
- [ ] Execute SUPABASE_SCHEMA.sql in production
- [ ] Generate TypeScript types: \`supabase gen types typescript\`
- [ ] Set up automated backups
- [ ] Configure connection pooling for high traffic
- [ ] Set up read replicas (if needed for scale)

### Database Optimizations
- [ ] Add additional indexes based on actual query patterns
- [ ] Configure pg_stat_statements for query analysis
- [ ] Set up database monitoring and alerts
- [ ] Optimize RLS policies for performance
- [ ] Review and tune vacuum settings

### Data Management
- [ ] Create seed data script for testing
- [ ] Set up data retention policies
- [ ] Plan for database migrations strategy`,
    tags: ['production', 'optimization', 'monitoring'],
    category: 'deployment',
    priority: 'high'
  },
  {
    story_id: 'AJ-002',
    doc_type: 'testing',
    title: 'Database Schema Testing Guide',
    content: `## How to Test

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Note URL and API keys

### 2. Execute Schema
- Open SQL Editor in Supabase dashboard
- Paste contents of SUPABASE_SCHEMA.sql
- Execute the query
- Verify all 14 tables appear in Table Editor

### 3. Test RLS Policies
\`\`\`sql
-- Test as unauthenticated user (should fail or return empty)
SELECT * FROM specialist_profiles;

-- Test as authenticated user (should only see own data)
SELECT * FROM specialist_profiles WHERE user_id = auth.uid();
\`\`\`

### 4. Test Foreign Key Constraints
\`\`\`sql
-- Try to insert project with non-existent user (should fail)
INSERT INTO projects (client_id, specialist_id, title)
VALUES ('00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000000',
        'Test');
-- Expected: Foreign key constraint error
\`\`\`

### 5. Test Triggers
\`\`\`sql
-- Insert a user profile
INSERT INTO user_profiles (id, full_name, user_type)
VALUES (auth.uid(), 'Test User', 'client');

-- Update the profile
UPDATE user_profiles SET full_name = 'New Name' WHERE id = auth.uid();

-- Verify updated_at changed
SELECT updated_at FROM user_profiles WHERE id = auth.uid();
\`\`\`

### 6. Generate TypeScript Types
\`\`\`bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
\`\`\`

### Success Criteria
✅ All 14 tables created
✅ All indexes created
✅ RLS policies active
✅ Triggers functioning
✅ Foreign keys enforced
✅ TypeScript types generated`,
    tags: ['testing', 'rls', 'validation'],
    category: 'general',
    priority: 'high'
  },

  // AJ-003: Authentication System
  {
    story_id: 'AJ-003',
    doc_type: 'progress',
    title: 'Authentication System Implemented',
    content: `## Completed Work

### Files Created
- \`app/lib/supabase/client.ts\` - Client-side Supabase client
- \`app/lib/supabase/server.ts\` - Server-side Supabase client with cookie handling
- \`app/middleware.ts\` - Route protection middleware
- \`app/(auth)/login/page.tsx\` - Login page component
- \`app/(auth)/register/page.tsx\` - Registration page with user type selection

### Features Implemented
- ✅ Email/password signup with automatic profile creation
- ✅ Email/password login with session management
- ✅ User type selection during registration (client/specialist)
- ✅ Protected routes using middleware
- ✅ Session persistence with secure cookies
- ✅ Automatic profile creation in user_profiles table
- ✅ Logout functionality
- ✅ Error handling and validation

### Authentication Flow
1. User registers with email, password, and user type
2. Supabase creates auth.users entry
3. Automatic trigger creates user_profiles entry
4. Session cookie set
5. User redirected to dashboard`,
    tags: ['auth', 'supabase', 'security', 'login'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-003',
    doc_type: 'next_steps',
    title: 'Additional Auth Features Needed',
    content: `## Remaining Work

### Missing Features
- [ ] Google OAuth integration
- [ ] Password reset flow (forgot password page)
- [ ] Email verification flow
- [ ] Magic link authentication (optional)
- [ ] Two-factor authentication (optional)

### Production Requirements
- [ ] Configure email templates in Supabase dashboard
- [ ] Set up custom SMTP provider (SendGrid, Resend)
- [ ] Configure OAuth app credentials (Google)
- [ ] Set up redirect URLs for OAuth callbacks
- [ ] Add rate limiting on auth endpoints
- [ ] Implement account lockout after failed login attempts

### Security Enhancements
- [ ] Add CAPTCHA to prevent bot signups
- [ ] Require email verification before full access
- [ ] Add password strength meter on registration
- [ ] Configure session timeout
- [ ] Implement audit log for authentication events`,
    tags: ['oauth', 'security', 'email'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-003',
    doc_type: 'testing',
    title: 'Authentication Testing Guide',
    content: `## How to Test

### 1. Test Registration
- Navigate to http://localhost:3001/register
- Fill in form:
  - Full Name: "Test User"
  - Email: "test@example.com"
  - Password: "SecurePass123!"
  - User Type: "Client"
- Click "Sign Up"
- Expected: Redirect to /dashboard

### 2. Verify Profile Creation
Check in Supabase dashboard:
- Authentication > Users (should see new user)
- Table Editor > user_profiles (should see profile with matching user_id)

### 3. Test Login
- Navigate to /login
- Enter email and password from registration
- Click "Sign In"
- Expected: Redirect to /dashboard

### 4. Test Session Persistence
- After logging in, refresh the page
- Expected: Still logged in, no redirect to login

### 5. Test Protected Routes
- Log out
- Try to access /dashboard directly
- Expected: Redirect to /login

### 6. Test Logout
- Log in
- Click logout button in header
- Expected: Redirect to home, session cleared

### 7. Test Error Handling
- Try to register with existing email → Error shown
- Try to login with wrong password → Error shown
- Leave fields empty → Validation errors shown

### Browser Console Test
\`\`\`javascript
const { data: { session } } = await supabase.auth.getSession()
console.log(session) // Should show session object when logged in
\`\`\`

### Success Criteria
✅ Registration creates user and profile
✅ Login redirects to dashboard
✅ Sessions persist across refreshes
✅ Protected routes redirect unauthenticated users
✅ Logout clears session
✅ Error messages display correctly`,
    tags: ['testing', 'auth', 'qa'],
    category: 'general',
    priority: 'high'
  },

  // Continue with remaining stories...
  // I'll create documentation for all 36 stories, but breaking into manageable chunks
];

// Add the rest of the stories (AJ-004 through AJ-036)
// Due to length, I'll add these in separate batches

async function addDocumentation() {
  console.log('Adding documentation to Ajency.AI stories in BubbleUp...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const doc of documentationEntries) {
    try {
      const { data, error } = await supabase
        .from('documentation')
        .insert({
          ...doc,
          author: AUTHOR,
          author_email: AUTHOR_EMAIL,
          version_number: 1,
          is_latest: true
        })
        .select()
        .single();

      if (error) {
        console.error(`✗ Error adding ${doc.doc_type} for ${doc.story_id}:`, error.message);
        errorCount++;
      } else {
        console.log(`✓ Added ${doc.doc_type}: "${doc.title}" to ${doc.story_id}`);
        successCount++;
      }
    } catch (err) {
      console.error(`✗ Exception adding doc to ${doc.story_id}:`, err);
      errorCount++;
    }
  }

  console.log(`\n=== Batch 1 Summary (AJ-001 to AJ-003) ===`);
  console.log(`Successfully added: ${successCount} documentation entries`);
  console.log(`Errors: ${errorCount} entries`);
  console.log(`\nNow run the next batch scripts for AJ-004 through AJ-036...`);
}

addDocumentation();
