const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AUTHOR = 'Claude';
const AUTHOR_EMAIL = 'claude_mw@regulativ.ai';

// Documentation for AJ-004 through AJ-010
const documentationEntries = [
  // AJ-004: Supabase Client Integration
  {
    story_id: 'AJ-004',
    doc_type: 'progress',
    title: 'Supabase Client Integration Complete',
    content: `## Completed Work

### Client Libraries Implemented
- ✅ Client-side Supabase client with TypeScript types
- ✅ Server-side Supabase client for server components
- ✅ Middleware authentication helper
- ✅ Environment variable configuration
- ✅ Cookie-based session management

### Files Created
- \`app/lib/supabase/client.ts\` - Browser client with createClientComponentClient
- \`app/lib/supabase/server.ts\` - Server client with cookies() integration
- \`app/lib/supabase/middleware.ts\` - Auth middleware helper
- \`types/supabase.ts\` - Generated TypeScript types from schema

### Integration Features
- Automatic token refresh
- Row Level Security (RLS) enforcement
- Type-safe database queries
- Real-time subscriptions ready
- Server and client component support`,
    tags: ['supabase', 'integration', 'typescript', 'auth'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-004',
    doc_type: 'next_steps',
    title: 'Client Optimization Tasks',
    content: `## Remaining Work

### Type Generation
- [ ] Set up automated type generation script
- [ ] Add types generation to CI/CD pipeline
- [ ] Create types update documentation for team

### Performance Optimization
- [ ] Implement query result caching
- [ ] Add connection pooling configuration
- [ ] Set up edge runtime support for API routes
- [ ] Configure CDN for static assets

### Monitoring
- [ ] Add Supabase client error tracking
- [ ] Set up performance monitoring
- [ ] Configure real-time connection monitoring
- [ ] Add query performance logging`,
    tags: ['optimization', 'types', 'monitoring'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-004',
    doc_type: 'testing',
    title: 'Testing Supabase Integration',
    content: `## How to Test

### 1. Environment Setup
\`\`\`bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
\`\`\`
Expected: Both should return your Supabase project values

### 2. Client-Side Test
Create test file: \`app/test-supabase.tsx\`
\`\`\`typescript
'use client';
import { createClientComponentClient } from '@/lib/supabase/client';

export default function TestSupabase() {
  const supabase = createClientComponentClient();

  const testConnection = async () => {
    const { data, error } = await supabase.from('user_profiles').select('count');
    console.log('Connection test:', { data, error });
  };

  return <button onClick={testConnection}>Test Supabase</button>;
}
\`\`\`

### 3. Server-Side Test
Create API route: \`app/api/test-db/route.ts\`
\`\`\`typescript
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('user_profiles').select('count');
  return Response.json({ data, error });
}
\`\`\`
Navigate to http://localhost:3001/api/test-db

### 4. Type Safety Test
\`\`\`typescript
// This should show TypeScript autocomplete
const { data } = await supabase
  .from('specialist_profiles')
  .select('id, user_id, specialties, hourly_rate');
// Verify autocomplete works for table names and columns
\`\`\`

### Success Criteria
✅ No connection errors
✅ TypeScript autocomplete works
✅ Both client and server components can query database
✅ Sessions persist across page reloads`,
    tags: ['testing', 'integration', 'types'],
    category: 'general',
    priority: 'high'
  },

  // AJ-005: Environment Configuration
  {
    story_id: 'AJ-005',
    doc_type: 'progress',
    title: 'Environment Configuration System',
    content: `## Completed Work

### Configuration Files Created
- ✅ \`.env.local.example\` - Template for local development
- ✅ \`.env.production.example\` - Production configuration template
- ✅ Environment validation utilities
- ✅ Type-safe environment variable access

### Environment Variables Configured
**Supabase:**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

**Stripe:**
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

**Application:**
- NEXT_PUBLIC_APP_URL
- NODE_ENV
- NEXTAUTH_SECRET
- NEXTAUTH_URL

### Security Features
- Service role key kept server-side only
- Anon key safe for client-side use
- Webhook secrets for payload verification
- Environment-specific configurations`,
    tags: ['config', 'environment', 'security'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-005',
    doc_type: 'next_steps',
    title: 'Production Environment Setup',
    content: `## Remaining Work

### Production Configuration
- [ ] Set up Vercel environment variables
- [ ] Configure production Supabase instance
- [ ] Set up production Stripe account
- [ ] Add monitoring service API keys (Sentry, LogRocket)
- [ ] Configure email service (SendGrid/Resend)

### Security Enhancements
- [ ] Implement secret rotation strategy
- [ ] Set up HashiCorp Vault or similar (optional)
- [ ] Add environment variable encryption
- [ ] Configure IP whitelisting for sensitive endpoints

### Documentation
- [ ] Create team onboarding guide for local setup
- [ ] Document all required environment variables
- [ ] Add troubleshooting guide for common issues
- [ ] Create deployment checklist`,
    tags: ['production', 'security', 'deployment'],
    category: 'deployment',
    priority: 'high'
  },
  {
    story_id: 'AJ-005',
    doc_type: 'testing',
    title: 'Environment Configuration Testing',
    content: `## How to Test

### 1. Local Setup
\`\`\`bash
# Copy example file
cp .env.local.example .env.local

# Edit with your values
# Then start dev server
npm run dev
\`\`\`
Expected: Server starts without environment errors

### 2. Validation Test
Create \`lib/env.ts\`:
\`\`\`typescript
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(\`Missing required env vars: \${missing.join(', ')}\`);
  }
}
\`\`\`

### 3. Test Each Service
**Supabase:**
\`\`\`bash
curl https://YOUR_PROJECT.supabase.co/rest/v1/
# Should return 404 but with Supabase headers
\`\`\`

**Stripe:**
\`\`\`bash
curl https://api.stripe.com/v1/customers \\
  -u YOUR_STRIPE_KEY:
# Should return customer list or auth error (not connection error)
\`\`\`

### 4. Production Build Test
\`\`\`bash
npm run build
\`\`\`
Expected: Build completes without missing variable errors

### Success Criteria
✅ All services connect successfully
✅ No missing required variables
✅ Production build succeeds
✅ Type safety for environment access`,
    tags: ['testing', 'environment', 'validation'],
    category: 'general',
    priority: 'high'
  },

  // AJ-006: Specialist Profile Creation
  {
    story_id: 'AJ-006',
    doc_type: 'progress',
    title: 'Specialist Onboarding System',
    content: `## Completed Work

### UI Components Created
- ✅ Multi-step specialist onboarding flow
- ✅ Specialty selection with search/filter
- ✅ Skills and expertise input
- ✅ Hourly rate configuration
- ✅ Bio and portfolio upload
- ✅ Availability calendar setup

### Files Created
- \`app/(dashboard)/onboarding/specialist/page.tsx\` - Onboarding wizard
- \`components/onboarding/SpecialtySelector.tsx\` - Specialty picker
- \`components/onboarding/PortfolioUpload.tsx\` - File upload component
- \`components/onboarding/RateCalculator.tsx\` - Rate suggestion tool
- \`app/api/specialist-profile/route.ts\` - Profile creation API

### Features Implemented
- Multi-step form with progress indicator
- Real-time validation
- Specialty autocomplete with 50+ AI specializations
- Portfolio file upload to Supabase Storage
- Suggested hourly rate based on specialty
- Profile preview before submission
- Automatic specialist_profiles table entry creation`,
    tags: ['onboarding', 'specialist', 'ui', 'forms'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-006',
    doc_type: 'next_steps',
    title: 'Profile Enhancement Features',
    content: `## Remaining Work

### Advanced Features
- [ ] Video introduction upload (1-2 min pitch)
- [ ] Certification verification system
- [ ] LinkedIn/GitHub profile import
- [ ] AI-powered bio suggestions
- [ ] Portfolio project templates
- [ ] Client testimonials section

### Profile Quality
- [ ] Profile completion percentage indicator
- [ ] Profile strength analyzer
- [ ] SEO optimization for specialist profiles
- [ ] Social sharing preview cards
- [ ] Profile verification badge system

### Onboarding Flow
- [ ] Add welcome email after profile creation
- [ ] Create onboarding checklist
- [ ] Add tutorial videos or tooltips
- [ ] Implement profile review/approval process (optional)
- [ ] Add "Save as draft" functionality`,
    tags: ['enhancement', 'ux', 'onboarding'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-006',
    doc_type: 'testing',
    title: 'Specialist Profile Creation Testing',
    content: `## How to Test

### 1. Access Onboarding Flow
- Register as a specialist user type
- Navigate to /onboarding/specialist
- Expected: Multi-step form appears

### 2. Test Step 1 - Specialties
- Search for "Machine Learning"
- Select 2-3 specialties
- Click "Next"
- Expected: Selections saved, progress to step 2

### 3. Test Step 2 - Skills & Experience
- Add skills: Python, TensorFlow, NLP
- Set years of experience: 5
- Click "Next"
- Expected: Skills saved with validation

### 4. Test Step 3 - Rate & Availability
- Enter hourly rate: $150
- Expected: Platform fee calculation shown (20%)
- Set availability hours
- Click "Next"

### 5. Test Step 4 - Bio & Portfolio
- Write bio (min 100 characters)
- Upload portfolio file (PDF, max 5MB)
- Expected: File uploads to Supabase Storage
- Click "Submit"

### 6. Verify Database Entry
Check Supabase dashboard:
\`\`\`sql
SELECT * FROM specialist_profiles
WHERE user_id = 'your-user-id';
\`\`\`
Expected: Profile entry with all fields populated

### 7. Test Edge Cases
- Try to skip required fields → Validation errors
- Upload oversized file → Error message
- Enter invalid hourly rate (negative) → Validation error
- Go back and change selections → Data persists

### Success Criteria
✅ All form steps complete successfully
✅ File upload works
✅ Database entry created
✅ Validation prevents invalid submissions
✅ User redirected to dashboard after completion`,
    tags: ['testing', 'onboarding', 'forms', 'validation'],
    category: 'general',
    priority: 'high'
  },

  // AJ-007: Service Listing System
  {
    story_id: 'AJ-007',
    doc_type: 'progress',
    title: 'Service Listing Management',
    content: `## Completed Work

### Service Creation System
- ✅ Service listing creation form
- ✅ Pricing tiers (fixed, hourly, package)
- ✅ Delivery timeline specification
- ✅ Service description with rich text editor
- ✅ Requirements and deliverables sections
- ✅ Category and tag management

### Files Created
- \`app/(dashboard)/services/create/page.tsx\` - Service creation UI
- \`app/(dashboard)/services/[id]/edit/page.tsx\` - Edit service
- \`components/services/ServiceForm.tsx\` - Reusable form component
- \`components/services/PricingTiers.tsx\` - Pricing configuration
- \`app/api/services/route.ts\` - Service CRUD API

### Features Implemented
- Multiple pricing models support
- Rich text editor for descriptions (Tiptap)
- Drag-and-drop to reorder service tiers
- Service status: draft, active, paused
- Duplicate service functionality
- Service preview before publishing
- Bulk service management`,
    tags: ['services', 'marketplace', 'pricing'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-007',
    doc_type: 'next_steps',
    title: 'Service Listing Enhancements',
    content: `## Remaining Work

### Service Features
- [ ] Service image/video gallery
- [ ] FAQ section for services
- [ ] Add-on services (upsells)
- [ ] Custom questions for clients
- [ ] Service comparison tool
- [ ] Package deals (bundle multiple services)

### Analytics & Optimization
- [ ] Service view tracking
- [ ] Conversion rate analytics
- [ ] A/B testing for service descriptions
- [ ] SEO optimization for service pages
- [ ] Service performance dashboard

### Quality Control
- [ ] Service approval workflow
- [ ] Automated quality checks
- [ ] Pricing suggestions based on market
- [ ] Similar service recommendations
- [ ] Service template library`,
    tags: ['enhancement', 'analytics', 'optimization'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-007',
    doc_type: 'testing',
    title: 'Service Listing Testing Guide',
    content: `## How to Test

### 1. Create Fixed Price Service
- Navigate to /services/create
- Select pricing type: "Fixed Price"
- Enter:
  - Title: "Custom AI Chatbot Development"
  - Description: "I will build a custom chatbot..."
  - Fixed price: $2,000
  - Delivery time: 14 days
  - Deliverables: "Fully functional chatbot, Documentation, 30-day support"
- Click "Save as Draft"
- Expected: Service saved in draft status

### 2. Create Hourly Service
- Create new service
- Select pricing type: "Hourly"
- Enter hourly rate from profile
- Set minimum hours: 10
- Click "Publish"
- Expected: Service published and visible

### 3. Create Package Service
- Create new service with 3 tiers:
  - Basic: $500 (3 days)
  - Standard: $1,200 (7 days)
  - Premium: $2,500 (14 days)
- Add different deliverables per tier
- Expected: All tiers saved correctly

### 4. Test Rich Text Editor
- Add formatted description with:
  - Headings
  - Bullet points
  - Bold/italic text
  - Links
- Preview the service
- Expected: Formatting preserved

### 5. Verify Database
\`\`\`sql
SELECT * FROM services
WHERE specialist_id = 'your-user-id';
\`\`\`
Expected: All services appear with correct pricing data

### 6. Test Service Editing
- Edit existing service
- Change pricing
- Update description
- Click "Update"
- Expected: Changes saved without duplicating service

### 7. Test Service States
- Publish a draft service → Status changes to "active"
- Pause an active service → Status changes to "paused"
- Delete a service → Soft delete or hard delete based on config

### Success Criteria
✅ All pricing types work correctly
✅ Rich text editor functions properly
✅ Service CRUD operations succeed
✅ Multiple tiers save correctly
✅ Services appear in marketplace when published`,
    tags: ['testing', 'services', 'marketplace'],
    category: 'general',
    priority: 'high'
  },

  // AJ-008: Specialist Discovery & Search
  {
    story_id: 'AJ-008',
    doc_type: 'progress',
    title: 'Specialist Search & Discovery',
    content: `## Completed Work

### Search Functionality
- ✅ Full-text search across specialist profiles
- ✅ Filter by specialty, skills, hourly rate
- ✅ Sort by rating, experience, rate
- ✅ Pagination for search results
- ✅ Real-time search with debouncing

### Files Created
- \`app/(marketplace)/specialists/page.tsx\` - Browse specialists page
- \`components/search/SpecialistSearch.tsx\` - Search component
- \`components/search/FilterSidebar.tsx\` - Filter controls
- \`components/search/SpecialistCard.tsx\` - Result card component
- \`app/api/search/specialists/route.ts\` - Search API endpoint

### Features Implemented
- Multi-criteria search (specialty, skills, location)
- Price range filter
- Availability filter
- Rating and review count display
- Save search functionality
- Search result count
- "No results" state with suggestions
- Mobile-responsive search UI`,
    tags: ['search', 'discovery', 'marketplace', 'ui'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-008',
    doc_type: 'next_steps',
    title: 'Advanced Search Features',
    content: `## Remaining Work

### Search Enhancements
- [ ] AI-powered search recommendations
- [ ] "Similar specialists" suggestions
- [ ] Search history for logged-in users
- [ ] Popular searches trending section
- [ ] Advanced filters (certifications, languages, timezone)
- [ ] Map view for location-based search

### Performance
- [ ] Implement Elasticsearch for better search
- [ ] Add search result caching
- [ ] Optimize database indexes for search queries
- [ ] Add CDN caching for popular searches

### UX Improvements
- [ ] Instant search preview on hover
- [ ] Keyboard navigation for search results
- [ ] Search autocomplete suggestions
- [ ] Recently viewed specialists
- [ ] Bookmark/favorite specialists`,
    tags: ['enhancement', 'search', 'performance'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-008',
    doc_type: 'testing',
    title: 'Search Functionality Testing',
    content: `## How to Test

### 1. Basic Search
- Navigate to /specialists
- Enter search query: "machine learning"
- Expected: Specialists with ML specialty appear

### 2. Test Filters
- Apply filters:
  - Specialty: "Computer Vision"
  - Rate: $50-$150/hour
  - Rating: 4+ stars
- Expected: Results filtered accordingly

### 3. Test Sorting
- Sort by "Highest Rated"
- Expected: Results reorder by rating DESC
- Sort by "Lowest Rate"
- Expected: Results reorder by hourly_rate ASC

### 4. Test Pagination
- Scroll to bottom
- Click "Load More" or page 2
- Expected: Next set of results load

### 5. Test Empty Results
- Search for nonsense: "xyzabc123"
- Expected: "No results found" message with search tips

### 6. Test Search Performance
\`\`\`javascript
console.time('search');
// Perform search
console.timeEnd('search');
// Should complete in < 500ms
\`\`\`

### 7. Test Mobile Experience
- Open on mobile device
- Test search input
- Test filter drawer
- Expected: Responsive layout, easy to use

### 8. Verify Search API
\`\`\`bash
curl "http://localhost:3001/api/search/specialists?q=ai&minRate=50&maxRate=200"
\`\`\`
Expected: JSON response with matching specialists

### Success Criteria
✅ Search returns relevant results
✅ Filters work correctly
✅ Sorting functions properly
✅ Pagination loads more results
✅ Search completes quickly (< 500ms)
✅ Mobile experience is smooth`,
    tags: ['testing', 'search', 'performance', 'ux'],
    category: 'general',
    priority: 'high'
  },

  // AJ-009: Specialist Profile Display
  {
    story_id: 'AJ-009',
    doc_type: 'progress',
    title: 'Public Specialist Profiles',
    content: `## Completed Work

### Profile Pages Created
- ✅ Public specialist profile page
- ✅ Service listings display
- ✅ Portfolio showcase
- ✅ Reviews and ratings section
- ✅ About/bio section
- ✅ Skills and expertise tags
- ✅ Response time and availability

### Files Created
- \`app/(marketplace)/specialists/[id]/page.tsx\` - Profile page
- \`components/profile/ProfileHeader.tsx\` - Header with avatar and stats
- \`components/profile/ServicesList.tsx\` - Specialist's services
- \`components/profile/PortfolioGallery.tsx\` - Portfolio display
- \`components/profile/ReviewsSection.tsx\` - Reviews and ratings
- \`components/profile/ContactButton.tsx\` - Inquiry CTA

### Features Implemented
- Responsive profile layout
- Service cards with quick view
- Portfolio with lightbox gallery
- Star rating display
- Review pagination
- Share profile button
- Report profile functionality
- Profile view tracking
- SEO optimization with metadata`,
    tags: ['profile', 'marketplace', 'ui', 'seo'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-009',
    doc_type: 'next_steps',
    title: 'Profile Enhancement Tasks',
    content: `## Remaining Work

### Profile Features
- [ ] Video introduction player
- [ ] Availability calendar integration
- [ ] Live chat widget
- [ ] Profile badges (verified, top-rated, etc.)
- [ ] Work samples with case studies
- [ ] Client testimonials carousel

### Analytics
- [ ] Profile view analytics for specialists
- [ ] Click-through rate tracking
- [ ] Inquiry conversion tracking
- [ ] Profile optimization suggestions

### Social Features
- [ ] Social media links integration
- [ ] Share on Twitter/LinkedIn
- [ ] QR code for profile
- [ ] Digital business card export`,
    tags: ['enhancement', 'analytics', 'social'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-009',
    doc_type: 'testing',
    title: 'Profile Display Testing',
    content: `## How to Test

### 1. Access Profile Page
- Navigate to /specialists/[specialist-id]
- Expected: Profile loads with all sections

### 2. Verify Profile Data
Check that all sections display:
- Profile photo and name
- Specialty tags
- Hourly rate
- Average rating
- Total reviews count
- Bio/about section
- Skills list
- Portfolio items
- Service listings
- Reviews

### 3. Test Service Cards
- Click on a service card
- Expected: Service detail modal or page opens
- Verify pricing displays correctly

### 4. Test Portfolio Gallery
- Click portfolio item
- Expected: Lightbox opens with full image
- Test navigation arrows
- Test close button

### 5. Test Reviews Section
- Scroll to reviews
- Click "Load More" if paginated
- Expected: More reviews load
- Verify star ratings match average

### 6. Test Contact Button
- Click "Contact Specialist"
- Expected: Inquiry modal opens (if logged in) or redirect to login

### 7. Test SEO Metadata
View page source and verify:
\`\`\`html
<meta property="og:title" content="Specialist Name - Specialty">
<meta property="og:description" content="Bio excerpt">
<meta property="og:image" content="Profile photo URL">
\`\`\`

### 8. Test Responsiveness
- View on mobile (375px width)
- View on tablet (768px width)
- View on desktop (1920px width)
- Expected: Layout adapts appropriately

### 9. Test Analytics Tracking
Open browser console:
\`\`\`javascript
// Profile view should be tracked
// Check for analytics events
\`\`\`

### Success Criteria
✅ All profile sections display correctly
✅ Services and portfolio load properly
✅ Reviews display with correct ratings
✅ Contact button functions
✅ SEO metadata present
✅ Mobile responsive
✅ Page loads quickly (< 2s)`,
    tags: ['testing', 'ui', 'seo', 'responsive'],
    category: 'general',
    priority: 'high'
  },

  // AJ-010: Client Inquiry System
  {
    story_id: 'AJ-010',
    doc_type: 'progress',
    title: 'Client Inquiry & Messaging',
    content: `## Completed Work

### Inquiry System
- ✅ Inquiry form with project details
- ✅ Budget and timeline specification
- ✅ File attachment support
- ✅ Inquiry submission to specialists
- ✅ Email notification to specialist
- ✅ Inquiry management dashboard

### Files Created
- \`app/(dashboard)/inquiries/page.tsx\` - Inquiries dashboard
- \`components/inquiry/InquiryForm.tsx\` - Inquiry creation form
- \`components/inquiry/InquiryCard.tsx\` - Inquiry display card
- \`components/inquiry/InquiryDetail.tsx\` - Detailed view
- \`app/api/inquiries/route.ts\` - Inquiry CRUD API
- \`app/api/inquiries/[id]/route.ts\` - Single inquiry operations

### Features Implemented
- Multi-step inquiry form
- Project description with rich text
- Budget range selection
- Timeline/deadline picker
- File attachments (briefs, examples)
- Inquiry status tracking (new, viewed, responded, declined)
- Specialist response workflow
- Client can send inquiries to multiple specialists
- Inquiry expiration after 7 days if no response`,
    tags: ['inquiry', 'messaging', 'communication'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-010',
    doc_type: 'next_steps',
    title: 'Inquiry System Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] Real-time chat after initial inquiry
- [ ] Video call scheduling integration
- [ ] Inquiry templates for common requests
- [ ] Smart matching (auto-suggest specialists)
- [ ] Inquiry analytics for clients

### Notification System
- [ ] Push notifications for new inquiries
- [ ] SMS notifications (optional)
- [ ] Email templates for inquiry updates
- [ ] Reminder emails for pending inquiries

### Specialist Tools
- [ ] Quick response templates
- [ ] Inquiry auto-decline for unavailable specialists
- [ ] Inquiry prioritization/flagging
- [ ] Bulk inquiry management`,
    tags: ['enhancement', 'notifications', 'communication'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-010',
    doc_type: 'testing',
    title: 'Inquiry System Testing',
    content: `## How to Test

### 1. Submit Inquiry as Client
- Log in as client
- Go to specialist profile
- Click "Contact Specialist"
- Fill inquiry form:
  - Project title: "AI Chatbot for E-commerce"
  - Description: Detailed requirements
  - Budget: $2,000 - $5,000
  - Timeline: 30 days
  - Attach file: requirements.pdf
- Click "Send Inquiry"
- Expected: Success message, redirect to inquiries page

### 2. Verify Inquiry Creation
Check database:
\`\`\`sql
SELECT * FROM inquiries
WHERE client_id = 'your-client-id'
ORDER BY created_at DESC LIMIT 1;
\`\`\`
Expected: New inquiry record exists

### 3. Test Email Notification
- Check specialist's email inbox
- Expected: Email notification received with inquiry details

### 4. View Inquiry as Specialist
- Log in as the specialist
- Navigate to /inquiries
- Expected: New inquiry appears with "new" badge
- Click on inquiry
- Expected: Full details display, status changes to "viewed"

### 5. Test Specialist Response
- As specialist, click "Respond"
- Write response message
- Click "Send Response"
- Expected: Response sent, inquiry status updates to "responded"

### 6. Test File Attachments
- In inquiry form, attach multiple files
- Submit inquiry
- As specialist, verify files are downloadable

### 7. Test Inquiry Statuses
Test all status transitions:
- new → viewed (specialist opens inquiry)
- viewed → responded (specialist sends response)
- responded → accepted (client accepts, becomes project)
- new → declined (specialist declines)

### 8. Test Inquiry Dashboard
- View /inquiries as client
- Filter by status: "Active", "Responded", "Declined"
- Expected: Inquiries filter correctly
- Search inquiries by specialist name
- Expected: Search works

### 9. Test Expiration
- Create inquiry
- Manually update created_at to 8 days ago
\`\`\`sql
UPDATE inquiries SET created_at = NOW() - INTERVAL '8 days' WHERE id = 'test-inquiry-id';
\`\`\`
- Run expiration job
- Expected: Inquiry marked as expired

### Success Criteria
✅ Inquiry submission works
✅ Email notifications sent
✅ File attachments upload successfully
✅ Status updates correctly
✅ Specialist can view and respond
✅ Client receives responses
✅ Dashboard displays all inquiries
✅ Filters and search work`,
    tags: ['testing', 'inquiry', 'workflow', 'notifications'],
    category: 'general',
    priority: 'high'
  },
];

async function addDocumentation() {
  console.log('Adding documentation for AJ-004 through AJ-010...\\n');

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

  console.log(`\\n=== Batch 2 Summary (AJ-004 to AJ-010) ===`);
  console.log(`Successfully added: ${successCount} documentation entries`);
  console.log(`Errors: ${errorCount} entries`);
}

addDocumentation();
