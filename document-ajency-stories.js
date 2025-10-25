const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const storyDocumentation = {
  'AJ-001': {
    title: 'Initialize Next.js 15 project with TypeScript and Tailwind CSS',
    documentation: `
## Work Completed

### Implementation
- ✅ Next.js 15 initialized with App Router
- ✅ TypeScript configured with strict mode
- ✅ Tailwind CSS installed and configured
- ✅ ESLint and Prettier configured
- ✅ Git repository initialized
- ✅ .gitignore properly configured

### Files Created
- \`package.json\` - Dependencies and scripts
- \`tsconfig.json\` - TypeScript configuration
- \`tailwind.config.ts\` - Tailwind configuration
- \`next.config.js\` - Next.js configuration with optimizations
- \`.eslintrc.json\` - Linting rules
- \`.gitignore\` - Git exclusions

### Configuration Details
- Next.js 15 with App Router (no src directory)
- TypeScript with strict type checking
- Tailwind CSS with custom theme configuration
- SWC minification enabled
- Image optimization configured

## Work Still Needed

### Production Considerations
- [ ] Configure proper domain in next.config.js
- [ ] Set up environment-specific configs (dev, staging, prod)
- [ ] Add Sentry or error tracking integration
- [ ] Configure analytics (Vercel Analytics, GA4)
- [ ] Set up CI/CD pipeline
- [ ] Add pre-commit hooks (optional)

### Optional Enhancements
- [ ] Add Prettier formatting on save
- [ ] Configure VS Code workspace settings
- [ ] Add commit message linting (commitlint)
- [ ] Set up Husky for git hooks

## Testing Requirements

### What to Test
1. **Development Server**: Runs without errors
2. **Build Process**: Production build completes successfully
3. **TypeScript**: No type errors
4. **Linting**: No linting errors or warnings
5. **Hot Reload**: Works properly in development

### How to Test

**1. Development Server**
\`\`\`bash
cd C:\\Users\\m\\OneDrive\\Desktop\\ajency\\app
npm install
npm run dev
\`\`\`
Expected: Server starts on http://localhost:3001

**2. Production Build**
\`\`\`bash
npm run build
\`\`\`
Expected: Build completes with no errors

**3. Type Check**
\`\`\`bash
npm run type-check
# or
npx tsc --noEmit
\`\`\`
Expected: No type errors

**4. Linting**
\`\`\`bash
npm run lint
\`\`\`
Expected: No errors, minimal warnings

**5. Hot Reload Test**
- Start dev server
- Edit any file (e.g., app/page.tsx)
- Save the file
- Check browser auto-refreshes

### Success Criteria
- ✅ Dev server runs on http://localhost:3001
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ Production build succeeds
- ✅ Hot reload works correctly
`
  },

  'AJ-002': {
    title: 'Set up Supabase project and database schema',
    documentation: `
## Work Completed

### Implementation
- ✅ Complete database schema designed
- ✅ All tables created with proper relationships
- ✅ Indexes added for performance
- ✅ Row Level Security (RLS) policies configured
- ✅ Database functions created
- ✅ Triggers for auto-updates implemented
- ✅ TypeScript types ready to be generated

### Files Created
- \`SUPABASE_SCHEMA.sql\` - Complete database schema

### Tables Created
1. **user_profiles** - Extended user information
2. **specialist_profiles** - AI specialist profiles
3. **services** - Service offerings
4. **projects** - Active projects
5. **inquiries** - Client inquiries
6. **proposals** - Specialist proposals
7. **reviews** - Project reviews
8. **messages** - Chat messages
9. **conversations** - Message threads
10. **ai_agents** - AI agent definitions
11. **agent_executions** - Usage tracking
12. **reports** - Content moderation
13. **notifications** - User notifications
14. **project_deliverables** - File uploads

### Security Features
- Row Level Security enabled on all tables
- Policies restrict access by user role
- Secure functions for sensitive operations

## Work Still Needed

### Production Setup
- [ ] Create production Supabase project
- [ ] Execute SUPABASE_SCHEMA.sql in production
- [ ] Generate TypeScript types: \`supabase gen types typescript\`
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Set up read replicas (if high traffic)

### Database Optimizations
- [ ] Add additional indexes based on query patterns
- [ ] Configure pg_stat_statements for query analysis
- [ ] Set up database monitoring
- [ ] Optimize RLS policies for performance

### Data Management
- [ ] Create seed data script for testing
- [ ] Set up data retention policies
- [ ] Configure automatic vacuum settings
- [ ] Plan for database migrations

## Testing Requirements

### What to Test
1. **Schema Creation**: All tables exist
2. **RLS Policies**: Security rules work correctly
3. **Relationships**: Foreign keys enforced
4. **Triggers**: Auto-updates work
5. **Functions**: Database functions execute correctly
6. **Performance**: Queries are fast with indexes

### How to Test

**1. Create Supabase Project**
- Go to https://supabase.com
- Create new project
- Note URL and keys

**2. Execute Schema**
- Open SQL Editor in Supabase dashboard
- Paste contents of SUPABASE_SCHEMA.sql
- Execute the query
- Verify all tables appear in Table Editor

**3. Test RLS Policies**
\`\`\`sql
-- Test as unauthenticated user (should fail)
SELECT * FROM specialist_profiles;

-- Test as authenticated user (should only see own data)
-- This requires setting up a test user first
\`\`\`

**4. Test Relationships**
\`\`\`sql
-- Try to insert project with non-existent user (should fail)
INSERT INTO projects (client_id, specialist_id, title)
VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Test');
\`\`\`

**5. Test Triggers**
\`\`\`sql
-- Insert a user profile and verify updated_at is set
INSERT INTO user_profiles (id, full_name, user_type)
VALUES (auth.uid(), 'Test User', 'client');

-- Update the profile and verify updated_at changes
UPDATE user_profiles SET full_name = 'New Name' WHERE id = auth.uid();
\`\`\`

**6. Generate TypeScript Types**
\`\`\`bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
\`\`\`

### Success Criteria
- ✅ All 14 tables created successfully
- ✅ All indexes created
- ✅ RLS policies active and working
- ✅ Triggers functioning
- ✅ Foreign key constraints enforced
- ✅ TypeScript types generated
`
  },

  'AJ-003': {
    title: 'Configure authentication system with Supabase Auth',
    documentation: `
## Work Completed

### Implementation
- ✅ Email/password signup implemented
- ✅ Email/password login implemented
- ✅ Session management configured
- ✅ Protected routes with middleware
- ✅ Supabase SSR client for App Router
- ✅ Client-side and server-side auth utilities

### Files Created
- \`app/lib/supabase/client.ts\` - Client-side Supabase client
- \`app/lib/supabase/server.ts\` - Server-side Supabase client with cookies
- \`app/middleware.ts\` - Route protection middleware
- \`app/(auth)/login/page.tsx\` - Login page
- \`app/(auth)/register/page.tsx\` - Registration page

### Features Implemented
- User registration with user type selection (client/specialist)
- Login with email and password
- Automatic profile creation on signup
- Session persistence with cookies
- Protected dashboard routes
- Logout functionality

## Work Still Needed

### Missing Features
- [ ] Google OAuth integration
- [ ] Password reset flow (forgot password page)
- [ ] Email verification flow
- [ ] Magic link authentication (optional)
- [ ] Two-factor authentication (optional)

### Production Requirements
- [ ] Configure email templates in Supabase
- [ ] Set up custom SMTP provider (SendGrid, Resend)
- [ ] Configure OAuth app credentials (Google, etc.)
- [ ] Set up redirect URLs for OAuth
- [ ] Add rate limiting on auth endpoints
- [ ] Implement account lockout after failed attempts

### Security Enhancements
- [ ] Add CAPTCHA to prevent bot signups
- [ ] Implement email verification requirement
- [ ] Add password strength meter
- [ ] Session timeout configuration
- [ ] Audit log for authentication events

## Testing Requirements

### What to Test
1. **Registration Flow**: New users can sign up
2. **Login Flow**: Users can log in with credentials
3. **Session Management**: Sessions persist across page reloads
4. **Protected Routes**: Unauthenticated users redirected to login
5. **Logout**: Users can sign out successfully
6. **Profile Creation**: User profiles auto-created on signup

### How to Test

**1. Test Registration**
- Navigate to http://localhost:3001/register
- Fill in:
  - Full Name: "Test User"
  - Email: "test@example.com"
  - Password: "SecurePass123!"
  - User Type: "Client"
- Click "Sign Up"
- Expected: Redirected to dashboard, user created in auth.users and user_profiles

**2. Verify Profile Creation**
- In Supabase dashboard, check:
  - Authentication > Users (should see new user)
  - Table Editor > user_profiles (should see profile entry)

**3. Test Login**
- Navigate to http://localhost:3001/login
- Enter email and password from registration
- Click "Sign In"
- Expected: Redirected to dashboard

**4. Test Session Persistence**
- After logging in, refresh the page
- Expected: Still logged in, no redirect to login

**5. Test Protected Routes**
- Log out
- Try to access http://localhost:3001/dashboard
- Expected: Redirected to /login

**6. Test Logout**
- Log in
- Click logout button in header
- Expected: Redirected to home page, session cleared

**7. Test Duplicate Email**
- Try to register with an existing email
- Expected: Error message displayed

**8. Test Invalid Login**
- Try to login with wrong password
- Expected: Error message displayed

### Using Browser DevTools
\`\`\`javascript
// Check auth state in console
const { data: { session } } = await supabase.auth.getSession()
console.log(session)
\`\`\`

### Success Criteria
- ✅ Users can register with email/password
- ✅ Users can login successfully
- ✅ Sessions persist across reloads
- ✅ Protected routes redirect to login
- ✅ User profiles auto-created
- ✅ Logout works correctly
- ✅ Proper error messages shown
`
  },

  'AJ-004': {
    title: 'Create base layout and navigation components',
    documentation: `
## Work Completed

### Implementation
- ✅ Header component with navigation
- ✅ Footer component with legal links
- ✅ Responsive mobile navigation
- ✅ Root layout structure
- ✅ Authentication state in UI

### Files Created
- \`app/components/Header.tsx\` - Main navigation header
- \`app/components/Footer.tsx\` - Footer with links
- \`app/layout.tsx\` - Root layout with Header and Footer

### Features Implemented
- Desktop navigation with all main links
- Mobile hamburger menu
- Dynamic navigation based on auth state (Login/Logout)
- User profile dropdown (placeholder)
- Responsive design with Tailwind
- Logo and branding

### Navigation Links
**Desktop/Mobile:**
- Browse Specialists (→ /marketplace)
- AI Agents (→ /agents)
- Pricing (→ /pricing)
- Sign In (→ /login) [when logged out]
- Dashboard (→ /dashboard) [when logged in]
- Sign Out [when logged in]

## Work Still Needed

### Missing Features
- [ ] User profile dropdown menu (currently placeholder)
- [ ] Notifications indicator in header
- [ ] Unread message count badge
- [ ] Dashboard sidebar navigation
- [ ] Breadcrumb navigation
- [ ] Mobile-optimized footer

### Enhancements
- [ ] Sticky header on scroll
- [ ] Search bar in header
- [ ] Dark mode toggle (optional)
- [ ] Accessibility improvements (ARIA labels)
- [ ] Keyboard navigation support
- [ ] Skip to content link

### Design Polish
- [ ] Smooth transitions for mobile menu
- [ ] Loading states for navigation
- [ ] Active link highlighting
- [ ] Hover effects refinement
- [ ] Logo/favicon design

## Testing Requirements

### What to Test
1. **Desktop Navigation**: All links work
2. **Mobile Navigation**: Menu opens/closes correctly
3. **Responsive Design**: Works on all screen sizes
4. **Auth State**: Navigation changes based on login status
5. **Footer Links**: All legal links accessible

### How to Test

**1. Test Desktop Navigation**
- Open http://localhost:3001 in desktop browser (>768px width)
- Click each navigation link:
  - "Browse Specialists" → /marketplace
  - "AI Agents" → /agents
  - "Pricing" → /pricing
  - "Sign In" → /login (when logged out)
- Expected: All links navigate correctly

**2. Test Mobile Navigation**
- Resize browser to mobile width (<768px)
- Click hamburger menu icon (☰)
- Expected: Menu slides in from right
- Click each link to verify navigation
- Click outside menu or X to close
- Expected: Menu closes

**3. Test Auth State Changes**
- Log out (if logged in)
- Check header shows: "Sign In", "Get Started"
- Log in with test account
- Check header shows: "Dashboard", "Sign Out"

**4. Test Responsive Breakpoints**
Test at these widths:
- 375px (Mobile)
- 768px (Tablet)
- 1024px (Desktop)
- 1920px (Large Desktop)

**5. Test Footer Links**
- Scroll to bottom of any page
- Click footer links:
  - Terms of Service → /terms
  - Privacy Policy → /privacy
  - Help → /help
- Expected: All pages load

**6. Test Mobile Menu UX**
- Open mobile menu
- Click a link
- Expected: Menu closes AND navigates
- Open mobile menu
- Click outside menu
- Expected: Menu closes

### Browser Testing
Test in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Accessibility Testing
\`\`\`bash
# Use Lighthouse in Chrome DevTools
# Run accessibility audit
# Check for:
# - Proper heading hierarchy
# - ARIA labels on interactive elements
# - Keyboard navigation support
# - Color contrast ratios
\`\`\`

### Success Criteria
- ✅ Desktop navigation works on all screen sizes >768px
- ✅ Mobile menu works smoothly on screens <768px
- ✅ All navigation links route correctly
- ✅ Auth state reflected in navigation
- ✅ Footer links accessible
- ✅ Responsive at all breakpoints
- ✅ No layout shift or jank
`
  },

  'AJ-005': {
    title: 'Set up environment variables and configuration management',
    documentation: `
## Work Completed

### Implementation
- ✅ .env.example template created
- ✅ Environment variable structure defined
- ✅ Next.js environment variable configuration
- ✅ Security best practices followed

### Files Created
- \`.env.example\` - Template with all required variables
- \`next.config.js\` - Next.js configuration with env validation

### Variables Configured
**Supabase:**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)

**Stripe:**
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_STARTER_PRICE_ID
- STRIPE_PROFESSIONAL_PRICE_ID
- STRIPE_BUSINESS_PRICE_ID

**App Configuration:**
- NEXT_PUBLIC_APP_URL

**Optional:**
- Email service credentials
- Analytics IDs
- AI API keys

## Work Still Needed

### Production Setup
- [ ] Create production .env file (never commit!)
- [ ] Set environment variables in Vercel
- [ ] Rotate keys for production
- [ ] Set up different values for staging
- [ ] Configure Supabase production project
- [ ] Create Stripe production products
- [ ] Set up email service account

### Security Hardening
- [ ] Implement env variable validation at runtime
- [ ] Add env variable type checking
- [ ] Set up secrets management (Vercel, AWS Secrets Manager)
- [ ] Audit which variables are NEXT_PUBLIC_
- [ ] Implement key rotation strategy
- [ ] Set up environment-specific logging

### Monitoring
- [ ] Add env variable presence checks in startup
- [ ] Log which environment is running (dev/staging/prod)
- [ ] Alert on missing required variables
- [ ] Track API key usage and quotas

## Testing Requirements

### What to Test
1. **Development Environment**: All variables load correctly
2. **Build Process**: Production build finds all variables
3. **Runtime Access**: Public vs server-only variables work correctly
4. **Missing Variables**: Proper errors when variables missing

### How to Test

**1. Set Up Local Environment**
\`\`\`bash
cd C:\\Users\\m\\OneDrive\\Desktop\\ajency\\app

# Copy example to actual env file
copy .env.example .env.local

# Edit .env.local with real values
# For development, use test/development keys
\`\`\`

**2. Test Environment Loading**
\`\`\`bash
# Start dev server
npm run dev

# Check console for any env variable errors
# Server should start successfully
\`\`\`

**3. Test Public Variables in Browser**
Open browser console and run:
\`\`\`javascript
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
console.log(process.env.NEXT_PUBLIC_APP_URL)

// Should print the values

console.log(process.env.STRIPE_SECRET_KEY)
// Should be undefined (server-only variable)
\`\`\`

**4. Test Server-Only Variables**
Create a test API route:
\`\`\`typescript
// app/api/test-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
  });
}
\`\`\`

Visit http://localhost:3001/api/test-env
Expected: All should be true

**5. Test Missing Variable Handling**
- Temporarily remove a required variable from .env.local
- Restart server
- Check for appropriate error or warning

**6. Test Production Build**
\`\`\`bash
npm run build
\`\`\`
Expected: Build succeeds if all required variables present

**7. Verify .gitignore**
\`\`\`bash
git status
\`\`\`
Expected: .env.local should NOT appear in untracked files

### Environment Checklist

**Development:**
- [ ] .env.local created from .env.example
- [ ] All Supabase credentials set
- [ ] Stripe test keys configured
- [ ] APP_URL set to http://localhost:3001

**Production (Vercel):**
- [ ] All environment variables added in Vercel dashboard
- [ ] Production Supabase credentials used
- [ ] Production Stripe keys configured
- [ ] APP_URL set to actual domain
- [ ] Webhook secrets configured
- [ ] Email service credentials added

### Security Checklist
- [ ] .env files in .gitignore
- [ ] No secrets committed to git
- [ ] Service role key never exposed to client
- [ ] Webhook secrets kept secret
- [ ] Production keys different from dev
- [ ] Keys rotated periodically

### Success Criteria
- ✅ .env.example provides clear template
- ✅ Development environment works with test keys
- ✅ Public variables accessible in browser
- ✅ Server-only variables not exposed
- ✅ Build succeeds with all variables
- ✅ No secrets in git repository
- ✅ Clear documentation in .env.example
`
  },

  // I'll continue with the remaining stories in the next call...
};

async function updateStoryDocumentation() {
  console.log('Updating Ajency.AI story documentation...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const [storyId, content] of Object.entries(storyDocumentation)) {
    try {
      const { error } = await supabase
        .from('backlog_items')
        .update({ documentation: content.documentation })
        .eq('id', storyId)
        .eq('project', 'Ajency.AI');

      if (error) {
        console.error(`✗ Error updating ${storyId}:`, error.message);
        errorCount++;
      } else {
        console.log(`✓ Documented ${storyId}: ${content.title}`);
        successCount++;
      }
    } catch (err) {
      console.error(`✗ Exception updating ${storyId}:`, err);
      errorCount++;
    }
  }

  console.log(`\n=== Part 1 Summary (AJ-001 to AJ-005) ===`);
  console.log(`Successfully documented: ${successCount} stories`);
  console.log(`Errors: ${errorCount} stories`);
}

updateStoryDocumentation();
