const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AUTHOR = 'Claude';
const AUTHOR_EMAIL = 'claude_mw@regulativ.ai';

// Documentation for AJ-011 through AJ-019 (Project & Payments + Trust & Reviews)
const documentationEntries = [
  // AJ-011: Project Creation Flow
  {
    story_id: 'AJ-011',
    doc_type: 'progress',
    title: 'Project Creation System Complete',
    content: `## Completed Work

### Project Creation Features
- ✅ Project creation from accepted inquiry
- ✅ Project details form with scope definition
- ✅ Budget and timeline configuration
- ✅ Project requirements documentation
- ✅ File attachments for project briefs
- ✅ Project status workflow

### Files Created
- \`app/(dashboard)/projects/create/page.tsx\` - Project creation wizard
- \`app/(dashboard)/projects/[id]/page.tsx\` - Project detail page
- \`components/projects/ProjectForm.tsx\` - Reusable project form
- \`components/projects/ScopeEditor.tsx\` - Scope definition editor
- \`app/api/projects/route.ts\` - Project CRUD API

### Features Implemented
- Auto-populate from accepted inquiry
- Multi-step project setup wizard
- Scope of work editor with templates
- Budget breakdown by milestones
- Timeline/Gantt chart visualization
- Project status: pending, active, completed, cancelled
- Client and specialist role permissions
- Project document storage`,
    tags: ['projects', 'workflow', 'creation'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-011',
    doc_type: 'next_steps',
    title: 'Project Management Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] Project templates library
- [ ] Collaborative scope editing
- [ ] Budget vs. actual tracking
- [ ] Timeline adjustment workflow
- [ ] Change request system
- [ ] Project cloning/duplication

### Integration
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Slack/Discord notifications
- [ ] Time tracking integration
- [ ] Invoice generation from milestones

### Analytics
- [ ] Project profitability dashboard
- [ ] Time to completion metrics
- [ ] Budget variance reporting
- [ ] Client satisfaction scoring`,
    tags: ['enhancement', 'integration', 'analytics'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-011',
    doc_type: 'testing',
    title: 'Project Creation Testing Guide',
    content: `## How to Test

### 1. Create Project from Inquiry
- Accept an inquiry as specialist
- Click "Create Project"
- Expected: Form pre-populated with inquiry details

### 2. Define Project Scope
- Enter project title: "E-commerce AI Chatbot"
- Add scope items:
  - Natural language processing
  - Product recommendation engine
  - Customer support automation
- Set budget: $5,000
- Set timeline: 30 days
- Expected: All fields save correctly

### 3. Add Project Milestones
- Create milestone 1: "Requirements & Design" ($1,000, 7 days)
- Create milestone 2: "Development" ($3,000, 18 days)
- Create milestone 3: "Testing & Deployment" ($1,000, 5 days)
- Expected: Milestones sum to total budget

### 4. Attach Project Files
- Upload project brief PDF
- Upload design mockups
- Expected: Files upload to Supabase Storage

### 5. Submit Project
- Click "Create Project"
- Expected: Project created, both parties notified

### 6. Verify Database
\`\`\`sql
SELECT * FROM projects
WHERE id = 'project-id';

SELECT * FROM milestones
WHERE project_id = 'project-id';
\`\`\`

### 7. Test Project Dashboard
- Navigate to /projects/[id]
- Verify all sections display:
  - Project header with status
  - Scope of work
  - Milestones list
  - Budget breakdown
  - File attachments
  - Activity timeline

### Success Criteria
✅ Project created from inquiry
✅ Milestones configured correctly
✅ Files attached successfully
✅ Both client and specialist can view
✅ Project status updates correctly`,
    tags: ['testing', 'projects', 'workflow'],
    category: 'general',
    priority: 'high'
  },

  // AJ-012: Proposal System
  {
    story_id: 'AJ-012',
    doc_type: 'progress',
    title: 'Proposal System Implemented',
    content: `## Completed Work

### Proposal Features
- ✅ Proposal creation from inquiries
- ✅ Custom pricing per proposal
- ✅ Deliverables and timeline specification
- ✅ Terms and conditions inclusion
- ✅ Proposal templates for common projects
- ✅ Proposal status tracking

### Files Created
- \`app/(dashboard)/proposals/create/page.tsx\` - Proposal creation
- \`app/(dashboard)/proposals/[id]/page.tsx\` - Proposal detail view
- \`components/proposals/ProposalForm.tsx\` - Form component
- \`components/proposals/ProposalPreview.tsx\` - Client-facing preview
- \`app/api/proposals/route.ts\` - Proposal API

### Features Implemented
- Rich text editor for proposal content
- Milestone-based pricing breakdown
- Optional items (add-ons)
- Proposal expiration dates
- Client acceptance workflow
- Proposal revision history
- PDF export of proposals
- Proposal comparison (for multiple bids)`,
    tags: ['proposals', 'bidding', 'contracts'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-012',
    doc_type: 'next_steps',
    title: 'Proposal System Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] AI-powered proposal suggestions
- [ ] Proposal analytics (view time, sections read)
- [ ] Interactive proposal builder
- [ ] Video proposals (loom integration)
- [ ] Proposal templates marketplace
- [ ] Collaborative proposals (team input)

### Client Experience
- [ ] Proposal comparison table
- [ ] Q&A section in proposals
- [ ] Proposal negotiation chat
- [ ] Alternative pricing options
- [ ] Payment plan customization

### Specialist Tools
- [ ] Proposal win rate tracking
- [ ] Template performance analytics
- [ ] Proposal A/B testing
- [ ] Quick proposal generator`,
    tags: ['enhancement', 'ai', 'analytics'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-012',
    doc_type: 'testing',
    title: 'Proposal System Testing',
    content: `## How to Test

### 1. Create Proposal as Specialist
- Go to inquiry
- Click "Send Proposal"
- Fill in:
  - Proposal title
  - Introduction/pitch
  - Deliverables (3 items)
  - Timeline (30 days)
  - Total price ($5,000)
  - Milestones breakdown
  - Terms and conditions
- Click "Send Proposal"
- Expected: Proposal sent, client notified

### 2. Test Proposal Templates
- Select template: "Web Development Project"
- Expected: Form pre-filled with template content
- Customize and send
- Expected: Customizations saved

### 3. View Proposal as Client
- Log in as client
- Navigate to /proposals
- Open new proposal
- Expected: Formatted proposal displays
- Proposal marked as "viewed"

### 4. Test Proposal Acceptance
- As client, click "Accept Proposal"
- Expected: Confirmation modal
- Confirm acceptance
- Expected:
  - Proposal status → accepted
  - Project automatically created
  - Payment flow initiated

### 5. Test Proposal Decline
- As client, click "Decline"
- Provide reason (optional)
- Expected: Proposal marked declined, specialist notified

### 6. Test Proposal Revision
- Client requests changes
- Specialist edits proposal
- Click "Send Revision"
- Expected: New version created, client notified

### 7. Test PDF Export
- Open proposal
- Click "Download PDF"
- Expected: Professional PDF generated

### 8. Test Expiration
- Set proposal expiration to yesterday
- View proposal
- Expected: "Expired" banner shown, accept disabled

### Success Criteria
✅ Proposals created successfully
✅ Templates work correctly
✅ Client can view and accept/decline
✅ Revisions create new versions
✅ PDF export functions
✅ Expiration logic works`,
    tags: ['testing', 'proposals', 'workflow'],
    category: 'general',
    priority: 'high'
  },

  // AJ-013: Contract Generation
  {
    story_id: 'AJ-013',
    doc_type: 'progress',
    title: 'Automated Contract System',
    content: `## Completed Work

### Contract Generation
- ✅ Auto-generate contracts from accepted proposals
- ✅ Customizable contract templates
- ✅ Digital signature integration (Docusign/HelloSign)
- ✅ Terms and conditions management
- ✅ Contract version control
- ✅ Legal compliance templates

### Files Created
- \`app/(dashboard)/contracts/[id]/page.tsx\` - Contract viewer
- \`components/contracts/ContractTemplate.tsx\` - Template engine
- \`components/contracts/SignatureWidget.tsx\` - E-signature component
- \`app/api/contracts/generate/route.ts\` - Contract generation API
- \`lib/contracts/templates.ts\` - Template library

### Features Implemented
- Dynamic contract generation from proposal data
- Client and specialist e-signatures
- Contract status tracking (draft, pending, signed, active)
- Automatic field population (parties, scope, pricing)
- Contract amendments workflow
- Contract expiration and renewal
- PDF contract storage
- Legal disclaimer and terms`,
    tags: ['contracts', 'legal', 'esignature'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-013',
    doc_type: 'next_steps',
    title: 'Contract System Enhancements',
    content: `## Remaining Work

### Legal Features
- [ ] Legal review workflow (optional)
- [ ] Multi-party contracts (team projects)
- [ ] Contract addendums
- [ ] Dispute resolution clause customization
- [ ] IP rights management
- [ ] NDA integration

### Integration
- [ ] DocuSign full integration
- [ ] Adobe Sign integration
- [ ] PandaDoc integration
- [ ] Legal AI review (automated compliance check)

### Compliance
- [ ] GDPR compliance features
- [ ] Different contract templates per jurisdiction
- [ ] Audit trail for contract changes
- [ ] Contract retention policies`,
    tags: ['legal', 'compliance', 'integration'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-013',
    doc_type: 'testing',
    title: 'Contract Generation Testing',
    content: `## How to Test

### 1. Generate Contract
- Accept a proposal
- System should auto-generate contract
- Navigate to /contracts/[id]
- Expected: Contract displays with all details

### 2. Verify Contract Content
Check that contract includes:
- Client name and details
- Specialist name and details
- Project scope from proposal
- Payment terms and milestones
- Timeline and deadlines
- Deliverables list
- Terms and conditions
- Signature blocks

### 3. Test Digital Signature - Client
- Log in as client
- Open contract
- Click "Sign Contract"
- Draw signature or type name
- Click "Confirm Signature"
- Expected: Client signature added, specialist notified

### 4. Test Digital Signature - Specialist
- Log in as specialist
- Open contract
- Sign contract
- Expected: Both signatures now present, contract status → "signed"

### 5. Test Contract PDF
- Download signed contract
- Expected: PDF with both signatures

### 6. Test Contract Amendment
- Request contract change
- Specialist creates amendment
- Both parties re-sign
- Expected: Amendment attached to original contract

### 7. Verify Database
\`\`\`sql
SELECT * FROM contracts WHERE project_id = 'project-id';

-- Check signatures
SELECT * FROM contract_signatures WHERE contract_id = 'contract-id';
\`\`\`

### 8. Test Edge Cases
- Try to sign already signed contract → Error
- Try to sign as non-party → Error
- Try to modify signed contract → Creates amendment

### Success Criteria
✅ Contracts auto-generate correctly
✅ All proposal data transferred
✅ Digital signatures work
✅ PDF export includes signatures
✅ Contract status updates properly
✅ Amendments workflow functions`,
    tags: ['testing', 'contracts', 'esignature'],
    category: 'general',
    priority: 'high'
  },

  // AJ-014: Milestone Tracking
  {
    story_id: 'AJ-014',
    doc_type: 'progress',
    title: 'Milestone Management System',
    content: `## Completed Work

### Milestone Features
- ✅ Milestone creation and editing
- ✅ Progress tracking per milestone
- ✅ Deliverable submission system
- ✅ Client approval workflow
- ✅ Milestone timeline visualization
- ✅ Automated notifications

### Files Created
- \`app/(dashboard)/projects/[id]/milestones/page.tsx\` - Milestones view
- \`components/milestones/MilestoneCard.tsx\` - Milestone display
- \`components/milestones/ProgressTracker.tsx\` - Progress visualization
- \`components/milestones/DeliverableUpload.tsx\` - File submission
- \`app/api/milestones/route.ts\` - Milestone CRUD API

### Features Implemented
- Milestone status: not started, in progress, pending review, completed
- Deliverable file uploads
- Client feedback and approval system
- Milestone dependencies (sequential vs. parallel)
- Progress percentage tracking
- Timeline Gantt chart
- Milestone payment release trigger
- Overdue milestone alerts`,
    tags: ['milestones', 'project-management', 'tracking'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-014',
    doc_type: 'next_steps',
    title: 'Milestone System Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] Automated progress updates from git commits
- [ ] Integration with project management tools (Jira, Trello)
- [ ] Milestone templates for common project types
- [ ] Automatic milestone breakdown from project scope
- [ ] Resource allocation per milestone
- [ ] Burndown charts

### Collaboration
- [ ] Milestone comments and discussions
- [ ] Real-time progress updates
- [ ] Client milestone task assignments
- [ ] Collaborative milestone planning

### Analytics
- [ ] Milestone completion time analytics
- [ ] Budget vs. actual per milestone
- [ ] Specialist milestone performance metrics
- [ ] Predictive milestone completion dates`,
    tags: ['enhancement', 'analytics', 'collaboration'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-014',
    doc_type: 'testing',
    title: 'Milestone Tracking Testing',
    content: `## How to Test

### 1. Create Milestones
- In project, add 3 milestones:
  - M1: Requirements ($1,000, 7 days)
  - M2: Development ($3,000, 18 days)
  - M3: Deployment ($1,000, 5 days)
- Expected: Milestones created, total = project budget

### 2. Start Milestone
- As specialist, click "Start Milestone 1"
- Expected: Status changes to "in progress"
- Start date recorded

### 3. Submit Deliverable
- Upload deliverable file
- Add description
- Click "Submit for Review"
- Expected:
  - Milestone status → "pending review"
  - Client notified
  - File stored in Supabase Storage

### 4. Client Review - Approve
- As client, view deliverable
- Click "Approve Milestone"
- Expected:
  - Milestone status → "completed"
  - Payment released (if using escrow)
  - Next milestone unlocked

### 5. Client Review - Request Changes
- As client, click "Request Changes"
- Enter feedback
- Expected:
  - Milestone status → "in progress"
  - Specialist notified with feedback

### 6. Test Progress Tracking
- Update milestone progress to 50%
- Expected: Progress bar updates
- Timeline chart shows progress

### 7. Test Dependencies
- Set M2 to depend on M1
- Try to start M2 before M1 is complete
- Expected: Error or disabled

### 8. Test Overdue Alerts
- Manually set milestone deadline to yesterday
\`\`\`sql
UPDATE milestones SET deadline = NOW() - INTERVAL '1 day' WHERE id = 'milestone-id';
\`\`\`
- Check notifications
- Expected: Overdue alert shown

### 9. View Timeline
- Navigate to project timeline view
- Expected: Gantt chart showing all milestones

### Success Criteria
✅ Milestones created successfully
✅ Progress tracking works
✅ Deliverable submission functions
✅ Client approval workflow operates
✅ Payment triggers on completion
✅ Timeline visualization displays
✅ Notifications sent correctly`,
    tags: ['testing', 'milestones', 'workflow'],
    category: 'general',
    priority: 'high'
  },

  // AJ-015: Payment Integration (Stripe)
  {
    story_id: 'AJ-015',
    doc_type: 'progress',
    title: 'Stripe Payment Integration Complete',
    content: `## Completed Work

### Payment Processing
- ✅ Stripe Connect integration for marketplace
- ✅ Payment intent creation
- ✅ Multiple payment methods support
- ✅ Payment status tracking
- ✅ Webhook handling for payment events
- ✅ Refund processing

### Files Created
- \`app/api/stripe/create-payment-intent/route.ts\` - Payment creation
- \`app/api/stripe/webhook/route.ts\` - Stripe webhook handler
- \`app/api/stripe/connect/route.ts\` - Connect account management
- \`components/payments/CheckoutForm.tsx\` - Payment UI
- \`lib/stripe/client.ts\` - Stripe client wrapper
- \`lib/stripe/webhooks.ts\` - Webhook event handlers

### Features Implemented
- Stripe Elements for secure card input
- Support for cards, ACH, bank transfers
- Platform fee configuration (20% default)
- Specialist payout automation
- Payment retry logic
- Invoice generation
- Payment history dashboard
- Tax calculation (optional)`,
    tags: ['stripe', 'payments', 'integration'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-015',
    doc_type: 'next_steps',
    title: 'Payment System Enhancements',
    content: `## Remaining Work

### Payment Features
- [ ] Subscription billing for premium features
- [ ] Split payments for team projects
- [ ] Cryptocurrency payment option
- [ ] International payment methods (iDEAL, SEPA, etc.)
- [ ] Payment plan / installment options
- [ ] Automatic currency conversion

### Financial Management
- [ ] Automated tax reporting (1099 generation)
- [ ] VAT/GST handling for international
- [ ] Financial dashboard for specialists
- [ ] Revenue forecasting
- [ ] Payment reconciliation tools

### Security & Compliance
- [ ] PCI DSS compliance audit
- [ ] Fraud detection integration
- [ ] 3D Secure for high-value transactions
- [ ] Payment dispute management`,
    tags: ['payments', 'compliance', 'enhancement'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-015',
    doc_type: 'testing',
    title: 'Stripe Payment Testing',
    content: `## How to Test

### 1. Setup Stripe Test Mode
- Verify .env.local has test keys:
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_...)
  - STRIPE_SECRET_KEY (sk_test_...)
- Expected: Test mode active

### 2. Create Payment Intent
- Start project payment flow
- Enter test card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits
- Click "Pay $5,000"
- Expected: Payment succeeds

### 3. Test Payment Failure
- Use card: 4000 0000 0000 0002 (decline)
- Attempt payment
- Expected: Error message shown, payment not created

### 4. Test Webhook Handling
- Install Stripe CLI: \`stripe listen --forward-to localhost:3001/api/stripe/webhook\`
- Make test payment
- Check server logs
- Expected: Webhook events processed

### 5. Test Stripe Connect
- Specialist onboarding:
  - Navigate to /settings/payments
  - Click "Connect Stripe Account"
  - Complete Stripe Connect flow (use test data)
- Expected: Connect account linked

### 6. Test Payout
- Complete a project milestone
- Trigger payout
\`\`\`bash
# Using Stripe CLI
stripe trigger payment_intent.succeeded
\`\`\`
- Expected: Funds transferred to specialist's connected account

### 7. Test Refund
- As admin or client, request refund
- Process refund through dashboard
- Expected: Refund created in Stripe

### 8. Verify Database Records
\`\`\`sql
SELECT * FROM payments WHERE project_id = 'project-id';
SELECT * FROM transactions WHERE payment_id = 'payment-id';
\`\`\`

### 9. Test Payment Methods
- Test with different cards:
  - Visa: 4242 4242 4242 4242
  - Mastercard: 5555 5555 5555 4444
  - Amex: 3782 822463 10005
- All should succeed

### 10. Test Error Handling
- Use card: 4000 0000 0000 9995 (insufficient funds)
- Expected: Specific error message

### Success Criteria
✅ Test payments process successfully
✅ Webhooks received and processed
✅ Stripe Connect onboarding works
✅ Payouts transfer correctly
✅ Refunds process
✅ All payment states tracked in database
✅ Error handling works correctly`,
    tags: ['testing', 'stripe', 'payments', 'integration'],
    category: 'general',
    priority: 'high'
  },

  // AJ-016: Escrow & Payouts
  {
    story_id: 'AJ-016',
    doc_type: 'progress',
    title: 'Escrow and Payout System',
    content: `## Completed Work

### Escrow Features
- ✅ Escrow account management
- ✅ Funds hold on milestone start
- ✅ Automatic release on milestone approval
- ✅ Dispute handling with escrow freeze
- ✅ Partial release for multi-milestone projects
- ✅ Escrow balance tracking

### Files Created
- \`app/api/escrow/deposit/route.ts\` - Escrow deposit
- \`app/api/escrow/release/route.ts\` - Funds release
- \`components/payments/EscrowStatus.tsx\` - Balance display
- \`lib/escrow/manager.ts\` - Escrow business logic
- \`app/(dashboard)/payments/escrow/page.tsx\` - Escrow dashboard

### Features Implemented
- Client deposits funds at project start
- Funds held in Stripe escrow
- Automatic release triggers:
  - Milestone approval by client
  - Auto-release after review period (7 days)
  - Manual release by platform admin
- Platform fee deduction (20%)
- Payout to specialist's Stripe Connect account
- Escrow transaction history
- Refund to client if project cancelled`,
    tags: ['escrow', 'payments', 'payouts'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-016',
    doc_type: 'next_steps',
    title: 'Escrow System Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] Milestone-based escrow (separate holds per milestone)
- [ ] Early release option (client initiates)
- [ ] Dispute resolution with third-party mediation
- [ ] Escrow interest accrual
- [ ] Multi-currency escrow
- [ ] Escrow insurance (optional)

### Compliance
- [ ] KYC/AML verification for large transactions
- [ ] Escrow reporting for tax purposes
- [ ] Audit trail for all escrow transactions
- [ ] Compliance with regional escrow regulations

### User Experience
- [ ] Escrow balance visualization
- [ ] Expected payout date calculator
- [ ] Payout schedule customization
- [ ] Instant payout option (for fee)`,
    tags: ['enhancement', 'compliance', 'ux'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-016',
    doc_type: 'testing',
    title: 'Escrow & Payout Testing',
    content: `## How to Test

### 1. Deposit to Escrow
- Start new project with $5,000 budget
- Client pays upfront
- Expected: Funds held in Stripe, not paid out yet

### 2. Verify Escrow Balance
- Navigate to /payments/escrow
- Expected: Shows $5,000 in escrow for project

### 3. Complete Milestone
- Specialist completes milestone 1 ($1,000)
- Submits deliverable
- Client approves
- Expected:
  - $1,000 released from escrow
  - Platform fee deducted ($200)
  - Specialist receives $800

### 4. Test Auto-Release
- Complete milestone 2
- Submit deliverable
- Wait 7 days (or manually adjust timestamp)
\`\`\`sql
UPDATE milestones SET submitted_at = NOW() - INTERVAL '8 days' WHERE id = 'milestone-id';
\`\`\`
- Run auto-release job
- Expected: Funds released automatically

### 5. Test Dispute
- Client disputes milestone 3
- Expected:
  - Escrow funds frozen
  - Neither party can access
  - Admin notified for resolution

### 6. Test Partial Refund
- Cancel project after milestone 1
- Expected:
  - Milestone 1 payment kept by specialist
  - Remaining $4,000 refunded to client

### 7. Test Payout Schedule
- Set payout schedule to weekly
- Complete multiple milestones
- Expected: Payouts batch weekly

### 8. Verify Stripe Dashboard
- Login to Stripe dashboard
- Check Transfers tab
- Expected: See transfers to specialist's connected account

### 9. Test Platform Fee
- Complete any milestone
- Verify payout amount:
\`\`\`
Milestone amount: $1,000
Platform fee (20%): $200
Specialist receives: $800
\`\`\`

### 10. Database Verification
\`\`\`sql
SELECT * FROM escrow_transactions WHERE project_id = 'project-id';
SELECT * FROM payouts WHERE specialist_id = 'specialist-id';
\`\`\`

### Success Criteria
✅ Funds deposited to escrow
✅ Escrow balance displays correctly
✅ Milestone approval releases funds
✅ Auto-release works after timeout
✅ Platform fee deducted correctly
✅ Payouts transferred to specialist
✅ Disputes freeze escrow
✅ Refunds process correctly`,
    tags: ['testing', 'escrow', 'payouts', 'stripe'],
    category: 'general',
    priority: 'high'
  },

  // AJ-017: Review System
  {
    story_id: 'AJ-017',
    doc_type: 'progress',
    title: 'Review and Rating System',
    content: `## Completed Work

### Review Features
- ✅ Post-project review submission
- ✅ Multi-criteria rating (quality, communication, timeliness)
- ✅ Written review with character limits
- ✅ Photo/screenshot attachments
- ✅ Review moderation system
- ✅ Response to reviews

### Files Created
- \`app/(dashboard)/projects/[id]/review/page.tsx\` - Review submission
- \`components/reviews/ReviewForm.tsx\` - Review input form
- \`components/reviews/ReviewCard.tsx\` - Review display
- \`components/reviews/ReviewStats.tsx\` - Aggregate statistics
- \`app/api/reviews/route.ts\` - Review CRUD API

### Features Implemented
- 5-star rating system
- Multiple rating categories:
  - Overall quality
  - Communication
  - Adherence to timeline
  - Professionalism
- Client reviews specialist (default)
- Specialist reviews client (optional)
- Review visibility controls (public/private)
- Spam and abuse flagging
- Review response functionality
- Average rating calculation
- Review sorting and filtering`,
    tags: ['reviews', 'ratings', 'feedback'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-017',
    doc_type: 'next_steps',
    title: 'Review System Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] Video reviews
- [ ] Verified purchase badge
- [ ] Helpful/not helpful voting
- [ ] Review highlights (AI-extracted key points)
- [ ] Review templates for common feedback
- [ ] Review reminders after project completion

### Moderation
- [ ] AI-powered review moderation
- [ ] Profanity filter
- [ ] Review dispute resolution
- [ ] Fake review detection
- [ ] Review editing (with version history)

### Analytics
- [ ] Review sentiment analysis
- [ ] Review response rate tracking
- [ ] Impact of reviews on bookings
- [ ] Review quality scoring`,
    tags: ['enhancement', 'moderation', 'ai'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-017',
    doc_type: 'testing',
    title: 'Review System Testing',
    content: `## How to Test

### 1. Submit Review as Client
- Complete a project
- Navigate to /projects/[id]/review
- Rate specialist:
  - Overall: 5 stars
  - Communication: 5 stars
  - Timeliness: 4 stars
  - Professionalism: 5 stars
- Write review: "Excellent work, very professional..."
- Upload screenshot (optional)
- Click "Submit Review"
- Expected: Review saved, specialist notified

### 2. Verify Review Display
- Visit specialist's profile
- Expected: New review appears
- Average rating updated

### 3. Calculate Average Rating
\`\`\`sql
SELECT AVG(overall_rating) as avg_rating
FROM reviews
WHERE specialist_id = 'specialist-id';
\`\`\`
Expected: Matches displayed rating

### 4. Test Review Response
- As specialist, view review
- Click "Respond to Review"
- Write response
- Click "Submit Response"
- Expected: Response appears under review

### 5. Test Review Moderation
- Submit review with profanity
- Expected: Flagged for moderation or auto-filtered

### 6. Test Review Reporting
- As any user, click "Report Review"
- Select reason: "Spam"
- Submit report
- Expected: Review flagged, admin notified

### 7. Test Review Sorting
- View all reviews for specialist
- Sort by "Highest Rated"
- Expected: 5-star reviews first
- Sort by "Most Recent"
- Expected: Newest reviews first

### 8. Test Review Filtering
- Filter by rating: "4+ stars"
- Expected: Only 4 and 5 star reviews show

### 9. Test Mutual Reviews
- Specialist submits review for client
- Expected: Both reviews appear on respective profiles

### 10. Database Verification
\`\`\`sql
SELECT * FROM reviews WHERE project_id = 'project-id';
\`\`\`

### Success Criteria
✅ Reviews submitted successfully
✅ Multi-criteria ratings work
✅ Average rating calculates correctly
✅ Review responses function
✅ Moderation flags inappropriate content
✅ Sorting and filtering work
✅ Both client and specialist can review`,
    tags: ['testing', 'reviews', 'ratings'],
    category: 'general',
    priority: 'high'
  },

  // AJ-018: Rating System
  {
    story_id: 'AJ-018',
    doc_type: 'progress',
    title: 'Advanced Rating and Reputation System',
    content: `## Completed Work

### Rating Features
- ✅ Aggregate rating calculation
- ✅ Rating distribution visualization
- ✅ Rating badges and achievements
- ✅ Reputation score algorithm
- ✅ Top-rated specialist ranking
- ✅ Rating trends over time

### Files Created
- \`lib/ratings/calculator.ts\` - Rating calculation logic
- \`components/ratings/RatingDistribution.tsx\` - Visual distribution
- \`components/ratings/RatingBadges.tsx\` - Achievement badges
- \`app/api/ratings/leaderboard/route.ts\` - Top specialists API

### Features Implemented
- Weighted average rating (recent reviews weighted more)
- Rating distribution chart (% of 5-star, 4-star, etc.)
- Specialist ranking based on:
  - Average rating
  - Number of reviews
  - Project completion rate
  - Response time
- Achievement badges:
  - Top Rated (4.8+ with 10+ reviews)
  - Rising Star (new specialist, 5.0 rating)
  - Veteran (100+ completed projects)
  - Quick Responder (< 2 hour avg response)
- Rating trend charts
- Category-specific ratings (different averages per specialty)`,
    tags: ['ratings', 'reputation', 'analytics'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-018',
    doc_type: 'next_steps',
    title: 'Rating System Enhancements',
    content: `## Remaining Work

### Advanced Algorithms
- [ ] Machine learning reputation model
- [ ] Client reliability scoring
- [ ] Review quality weighting
- [ ] Outlier detection (suspicious reviews)
- [ ] Predictive rating forecasting

### Gamification
- [ ] Rating milestones and rewards
- [ ] Leaderboard competitions
- [ ] Rating improvement suggestions
- [ ] Performance coaching based on ratings

### Transparency
- [ ] Rating calculation explainer
- [ ] Historical rating changes log
- [ ] Comparison with category averages
- [ ] Rating improvement tracking`,
    tags: ['enhancement', 'ml', 'gamification'],
    category: 'implementation',
    priority: 'low'
  },
  {
    story_id: 'AJ-018',
    doc_type: 'testing',
    title: 'Rating System Testing',
    content: `## How to Test

### 1. Test Rating Calculation
- Create specialist with 5 reviews:
  - Review 1: 5 stars (30 days ago)
  - Review 2: 4 stars (20 days ago)
  - Review 3: 5 stars (10 days ago)
  - Review 4: 3 stars (5 days ago)
  - Review 5: 5 stars (1 day ago)
- Calculate weighted average
- Expected: Recent reviews weighted more heavily

### 2. Test Rating Distribution
- View specialist profile
- Check distribution chart
- Expected: Shows percentage breakdown:
  - 5 stars: 60%
  - 4 stars: 20%
  - 3 stars: 20%

### 3. Test Badge Assignment
- Specialist achieves 4.8+ rating with 10+ reviews
- Expected: "Top Rated" badge appears on profile

### 4. Test Leaderboard
- Navigate to /specialists?sort=top-rated
- Expected: Specialists sorted by rating and review count

### 5. Test Category Ratings
- Specialist has reviews in "Machine Learning" and "Web Dev"
- Expected: Different average ratings per category

### 6. Test Rating Trends
- View specialist dashboard
- Check rating trend chart
- Expected: Line graph showing rating over time

### 7. Test Minimum Review Threshold
- Specialist has only 1 review (5 stars)
- Expected: Not ranked as "Top Rated" (needs 10+ reviews)

### 8. Test Algorithm
\`\`\`typescript
// Test rating calculation
import { calculateWeightedRating } from '@/lib/ratings/calculator';

const reviews = [
  { rating: 5, created_at: '2024-01-01' },
  { rating: 4, created_at: '2024-01-15' },
  { rating: 5, created_at: '2024-01-30' },
];

const weighted = calculateWeightedRating(reviews);
console.log(weighted); // Should favor recent reviews
\`\`\`

### Success Criteria
✅ Weighted ratings calculate correctly
✅ Rating distribution displays accurately
✅ Badges assigned based on criteria
✅ Leaderboard ranks correctly
✅ Rating trends visualize properly
✅ Category-specific ratings work`,
    tags: ['testing', 'ratings', 'algorithms'],
    category: 'general',
    priority: 'high'
  },

  // AJ-019: Trust & Safety
  {
    story_id: 'AJ-019',
    doc_type: 'progress',
    title: 'Trust and Safety System',
    content: `## Completed Work

### Safety Features
- ✅ User verification system (email, phone, ID)
- ✅ Content moderation (reviews, messages, profiles)
- ✅ Report and flag system
- ✅ Block user functionality
- ✅ Fraud detection alerts
- ✅ Terms of service and community guidelines

### Files Created
- \`app/api/moderation/report/route.ts\` - Content reporting
- \`app/(dashboard)/admin/moderation/page.tsx\` - Admin moderation queue
- \`components/safety/ReportModal.tsx\` - Report form
- \`components/safety/VerificationBadges.tsx\` - Trust badges
- \`lib/moderation/detector.ts\` - Content scanning

### Features Implemented
- Multi-level user verification:
  - Email verification (required)
  - Phone verification (optional)
  - Government ID verification (for high-value projects)
- Content reporting categories:
  - Spam
  - Inappropriate content
  - Scam/fraud
  - Harassment
  - Copyright violation
- Automated content scanning (profanity, spam patterns)
- Moderation queue for admins
- User blocking (prevent future interactions)
- Account suspension workflow
- Dispute resolution system
- Safety tips and guidelines display`,
    tags: ['safety', 'moderation', 'trust'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-019',
    doc_type: 'next_steps',
    title: 'Trust & Safety Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] AI-powered fraud detection
- [ ] Background checks integration (Checkr, Sterling)
- [ ] Two-factor authentication (2FA)
- [ ] Biometric verification
- [ ] Risk scoring for transactions
- [ ] Automated account limits for new users

### Moderation Tools
- [ ] Machine learning content classification
- [ ] Bulk moderation actions
- [ ] Moderator performance tracking
- [ ] Escalation workflow for complex cases
- [ ] Community moderation (trusted users)

### Legal & Compliance
- [ ] GDPR data export and deletion
- [ ] COPPA compliance for age verification
- [ ] Legal takedown request handling
- [ ] Transparency reports`,
    tags: ['enhancement', 'ai', 'compliance'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-019',
    doc_type: 'testing',
    title: 'Trust & Safety Testing',
    content: `## How to Test

### 1. Test Email Verification
- Register new account
- Check email inbox
- Click verification link
- Expected: Account verified, badge added

### 2. Test Phone Verification
- Navigate to /settings/verification
- Enter phone number
- Receive SMS code
- Enter code
- Expected: Phone verified

### 3. Test ID Verification
- Upload government ID
- Expected: Sent to verification service
- (In production: manual review or Stripe Identity)

### 4. Test Content Reporting
- View inappropriate review
- Click "Report"
- Select reason: "Spam"
- Add details
- Submit
- Expected: Report created, admin notified

### 5. Test Moderation Queue
- Log in as admin
- Navigate to /admin/moderation
- Expected: See all reported content
- Review item
- Take action: Approve / Remove / Suspend User
- Expected: Action applied

### 6. Test Profanity Filter
- Submit review with profanity
- Expected: Flagged or auto-filtered

### 7. Test User Blocking
- As client, view specialist profile
- Click "Block User"
- Confirm
- Expected:
  - User blocked
  - Cannot send messages
  - Profile hidden from search

### 8. Test Fraud Detection
- Create project with suspicious characteristics:
  - Very high budget
  - New user
  - Urgent timeline
- Expected: Flagged for review

### 9. Test Account Suspension
- Admin suspends user account
- User tries to log in
- Expected: "Account suspended" message

### 10. Test Verification Badges
- Complete all verifications
- View profile
- Expected: Verification badges display

### Database Verification
\`\`\`sql
SELECT * FROM reports WHERE status = 'pending';
SELECT * FROM user_verifications WHERE user_id = 'user-id';
SELECT * FROM blocked_users WHERE blocker_id = 'user-id';
\`\`\`

### Success Criteria
✅ Verification workflows complete
✅ Reporting system functions
✅ Moderation queue works
✅ Content filtering active
✅ User blocking works
✅ Admin actions apply correctly
✅ Badges display for verified users`,
    tags: ['testing', 'safety', 'moderation', 'verification'],
    category: 'general',
    priority: 'high'
  },
];

async function addDocumentation() {
  console.log('Adding documentation for AJ-011 through AJ-019...\\n');

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

  console.log(`\\n=== Batch 3 Summary (AJ-011 to AJ-019) ===`);
  console.log(`Successfully added: ${successCount} documentation entries`);
  console.log(`Errors: ${errorCount} entries`);
}

addDocumentation();
