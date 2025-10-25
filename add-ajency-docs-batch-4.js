const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AUTHOR = 'Claude';
const AUTHOR_EMAIL = 'claude_mw@regulativ.ai';

// Documentation for AJ-020 through AJ-027 (AI Agent Library + Subscription System)
const documentationEntries = [
  // AJ-020: AI Agent Library UI
  {
    story_id: 'AJ-020',
    doc_type: 'progress',
    title: 'AI Agent Library Interface',
    content: `## Completed Work

### Agent Library Features
- ✅ Agent browsing and discovery
- ✅ Agent categories and tags
- ✅ Agent detail pages
- ✅ Agent preview/demo functionality
- ✅ "Try it now" interactive demos
- ✅ Agent configuration UI

### Files Created
- \`app/(marketplace)/agents/page.tsx\` - Agent library browser
- \`app/(marketplace)/agents/[id]/page.tsx\` - Agent detail page
- \`components/agents/AgentCard.tsx\` - Agent preview card
- \`components/agents/AgentDemo.tsx\` - Interactive demo component
- \`components/agents/AgentConfig.tsx\` - Configuration form

### Features Implemented
- Grid and list view for agents
- Agent categories: Content Creation, Data Analysis, Code Generation, etc.
- Agent metadata display:
  - Name, description, author
  - Usage count, rating
  - Pricing (free/paid tiers)
  - Required parameters
- Interactive demos with sample inputs
- Code examples for integration
- "Add to Project" functionality
- Agent versioning display
- Popular and trending agents section`,
    tags: ['ai-agents', 'library', 'ui', 'marketplace'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-020',
    doc_type: 'next_steps',
    title: 'Agent Library Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] Agent collections/bundles
- [ ] Custom agent creation wizard
- [ ] Agent marketplace (user-submitted agents)
- [ ] Agent comparison tool
- [ ] Agent performance benchmarks
- [ ] Integration with external AI platforms

### User Experience
- [ ] Agent onboarding tutorials
- [ ] Use case examples library
- [ ] Agent recommendation engine
- [ ] Recently used agents
- [ ] Agent favorites/bookmarks

### Developer Tools
- [ ] Agent SDK for custom development
- [ ] Agent testing sandbox
- [ ] Agent deployment pipeline
- [ ] Agent monitoring dashboard`,
    tags: ['enhancement', 'ux', 'developer-tools'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-020',
    doc_type: 'testing',
    title: 'AI Agent Library Testing',
    content: `## How to Test

### 1. Browse Agent Library
- Navigate to /agents
- Expected: Grid of available agents displays

### 2. Test Agent Categories
- Click category: "Content Creation"
- Expected: Only content creation agents show
- Verify categories:
  - Content Creation
  - Data Analysis
  - Code Generation
  - Image Processing
  - Natural Language Processing

### 3. View Agent Detail Page
- Click on "Blog Post Generator" agent
- Navigate to /agents/blog-post-generator
- Expected: Full agent details display:
  - Description
  - Parameters required
  - Pricing
  - Usage examples
  - Code snippet
  - Demo section

### 4. Test Interactive Demo
- In agent detail page, find "Try it now" section
- Enter sample input: "Write a blog post about AI"
- Click "Run Demo"
- Expected: Agent executes, shows output

### 5. Test Agent Configuration
- Click "Configure Agent"
- Adjust parameters (e.g., temperature, max tokens)
- Save configuration
- Expected: Configuration saved to user preferences

### 6. Test "Add to Project"
- Click "Add to Project"
- Select project from dropdown
- Expected: Agent linked to project, appears in project's agent list

### 7. Test Search
- Search for "image"
- Expected: All image-related agents appear

### 8. Test Sorting
- Sort by "Most Popular"
- Expected: Agents reorder by usage count
- Sort by "Highest Rated"
- Expected: Agents reorder by rating

### 9. Verify Database
\`\`\`sql
SELECT * FROM ai_agents ORDER BY usage_count DESC LIMIT 10;
\`\`\`

### Success Criteria
✅ Agent library displays correctly
✅ Categories filter properly
✅ Agent detail pages load
✅ Interactive demos work
✅ Configuration saves
✅ Search and sorting function
✅ "Add to Project" works`,
    tags: ['testing', 'ai-agents', 'ui'],
    category: 'general',
    priority: 'high'
  },

  // AJ-021: Agent Discovery & Search
  {
    story_id: 'AJ-021',
    doc_type: 'progress',
    title: 'AI Agent Discovery and Search',
    content: `## Completed Work

### Search Features
- ✅ Full-text search across agent library
- ✅ Filter by category, pricing, rating
- ✅ Tag-based filtering
- ✅ Search suggestions and autocomplete
- ✅ Recent searches history
- ✅ Advanced search filters

### Files Created
- \`components/agents/AgentSearch.tsx\` - Search component
- \`components/agents/SearchFilters.tsx\` - Filter controls
- \`app/api/agents/search/route.ts\` - Search API
- \`lib/agents/search.ts\` - Search logic

### Features Implemented
- Multi-field search (name, description, tags)
- Real-time search with debouncing
- Filter options:
  - Category
  - Pricing (free, freemium, paid)
  - Rating (4+ stars, etc.)
  - Popularity (usage count)
  - Model provider (OpenAI, Anthropic, etc.)
- Sort by: relevance, popularity, rating, newest
- Search result count
- "No results" state with suggestions
- Save search functionality
- Trending searches display`,
    tags: ['search', 'discovery', 'ai-agents'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-021',
    doc_type: 'next_steps',
    title: 'Search Enhancement Tasks',
    content: `## Remaining Work

### Advanced Search
- [ ] Semantic search (AI-powered)
- [ ] Natural language queries
- [ ] Search by use case
- [ ] Similar agents recommendations
- [ ] Search analytics and insights

### Performance
- [ ] Elasticsearch integration
- [ ] Search result caching
- [ ] Infinite scroll for results
- [ ] Search query optimization

### UX Improvements
- [ ] Search history management
- [ ] Saved search notifications
- [ ] Search shortcuts (keyboard)
- [ ] Voice search (experimental)`,
    tags: ['enhancement', 'search', 'performance'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-021',
    doc_type: 'testing',
    title: 'Agent Search Testing',
    content: `## How to Test

### 1. Basic Search
- Navigate to /agents
- Enter search query: "blog post"
- Expected: Agents related to blog writing appear

### 2. Test Autocomplete
- Start typing: "ima..."
- Expected: Suggestions appear: "image generation", "image analysis"

### 3. Test Filters
Apply filters:
- Category: "Code Generation"
- Pricing: "Free"
- Rating: "4+ stars"
- Expected: Results match all criteria

### 4. Test Sorting
- Search for "content"
- Sort by "Most Popular"
- Expected: Results reorder by usage count DESC

### 5. Test No Results
- Search for: "xyzabc123"
- Expected: "No agents found" message with suggestions

### 6. Test Search Performance
\`\`\`javascript
console.time('search');
// Perform search
console.timeEnd('search');
// Should complete in < 300ms
\`\`\`

### 7. Test Tag Filtering
- Click tag: "GPT-4"
- Expected: Only agents using GPT-4 model show

### 8. Test Recent Searches
- Perform several searches
- Click search input
- Expected: Recent searches displayed as suggestions

### 9. Test Save Search
- Apply complex filters
- Click "Save Search"
- Name it "My AI Agents"
- Expected: Search saved, appears in saved searches list

### 10. Verify Search API
\`\`\`bash
curl "http://localhost:3001/api/agents/search?q=content&category=writing&minRating=4"
\`\`\`
Expected: JSON response with matching agents

### Success Criteria
✅ Search returns relevant results
✅ Autocomplete works
✅ Filters apply correctly
✅ Sorting functions
✅ Search performs quickly (< 300ms)
✅ No results state displays
✅ Saved searches work`,
    tags: ['testing', 'search', 'performance'],
    category: 'general',
    priority: 'high'
  },

  // AJ-022: Agent Execution Engine
  {
    story_id: 'AJ-022',
    doc_type: 'progress',
    title: 'AI Agent Execution Engine',
    content: `## Completed Work

### Execution Engine
- ✅ Agent execution API
- ✅ Parameter validation and sanitization
- ✅ Queue system for agent jobs
- ✅ Async execution with webhooks
- ✅ Real-time execution status
- ✅ Error handling and retry logic

### Files Created
- \`app/api/agents/execute/route.ts\` - Execution endpoint
- \`lib/agents/executor.ts\` - Execution logic
- \`lib/agents/queue.ts\` - Job queue manager (Bull/Redis)
- \`lib/agents/validators.ts\` - Input validation
- \`components/agents/ExecutionStatus.tsx\` - Status display

### Features Implemented
- Support for multiple AI providers:
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic (Claude)
  - Replicate (Stable Diffusion, etc.)
  - Hugging Face models
- Input parameter validation
- Rate limiting per user/plan
- Execution queue with priority
- Webhook callbacks for async jobs
- Execution result caching
- Token usage tracking
- Timeout handling (max 5 minutes)
- Streaming responses for long outputs`,
    tags: ['ai-agents', 'execution', 'api', 'integration'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-022',
    doc_type: 'next_steps',
    title: 'Execution Engine Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] Agent chaining (multi-step workflows)
- [ ] Parallel agent execution
- [ ] Conditional logic in agents
- [ ] Agent result caching strategy
- [ ] Custom model fine-tuning integration
- [ ] Multi-modal agent support (text + image)

### Performance
- [ ] Execution optimization
- [ ] Load balancing across providers
- [ ] Automatic provider fallback
- [ ] Cost optimization engine

### Developer Experience
- [ ] LangChain integration
- [ ] Agent debugging tools
- [ ] Execution logs and traces
- [ ] Performance profiling`,
    tags: ['enhancement', 'performance', 'developer-tools'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-022',
    doc_type: 'testing',
    title: 'Agent Execution Testing',
    content: `## How to Test

### 1. Execute Simple Agent
\`\`\`bash
curl -X POST http://localhost:3001/api/agents/execute \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "blog-post-generator",
    "parameters": {
      "topic": "AI in Healthcare",
      "tone": "professional",
      "length": "medium"
    }
  }'
\`\`\`
Expected: Agent executes, returns blog post

### 2. Test Parameter Validation
- Send invalid parameters
\`\`\`json
{
  "agentId": "blog-post-generator",
  "parameters": {
    "topic": "" // Empty required field
  }
}
\`\`\`
Expected: Validation error returned

### 3. Test Async Execution
- Execute long-running agent
- Provide webhook URL
\`\`\`json
{
  "agentId": "video-generator",
  "parameters": {...},
  "webhook": "https://yourapp.com/webhook"
}
\`\`\`
Expected:
- Immediate response with job ID
- Webhook called when complete

### 4. Test Queue System
- Submit 10 agent executions simultaneously
- Expected: Jobs queued, processed in order

### 5. Test Rate Limiting
- Make 100 requests in 1 minute
- Expected: Rate limit error after threshold

### 6. Test Timeout
- Execute agent that takes > 5 minutes
- Expected: Timeout error returned

### 7. Test Error Handling
- Execute with invalid API key
- Expected: Proper error message

### 8. Test Streaming Response
- Execute agent with streaming enabled
\`\`\`bash
curl -N http://localhost:3001/api/agents/execute/stream \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"agentId": "chat", "message": "Hello"}'
\`\`\`
Expected: Response streams in chunks

### 9. Monitor Execution Status
- Start agent execution
- Poll status endpoint
\`\`\`bash
curl http://localhost:3001/api/agents/executions/EXECUTION_ID
\`\`\`
Expected: Status updates (pending → running → completed)

### 10. Verify Database Logging
\`\`\`sql
SELECT * FROM agent_executions
WHERE user_id = 'user-id'
ORDER BY created_at DESC;
\`\`\`

### Success Criteria
✅ Agents execute successfully
✅ Parameter validation works
✅ Async execution with webhooks functions
✅ Queue system processes jobs
✅ Rate limiting enforces limits
✅ Timeout handling works
✅ Errors handled gracefully
✅ Streaming responses work`,
    tags: ['testing', 'execution', 'api', 'integration'],
    category: 'general',
    priority: 'high'
  },

  // AJ-023: Usage Tracking & Limits
  {
    story_id: 'AJ-023',
    doc_type: 'progress',
    title: 'Usage Tracking and Limits System',
    content: `## Completed Work

### Usage Tracking
- ✅ Token/credit usage tracking
- ✅ Per-agent usage statistics
- ✅ Daily/monthly usage limits
- ✅ Usage dashboard for users
- ✅ Usage alerts and notifications
- ✅ Cost calculation per execution

### Files Created
- \`app/api/usage/route.ts\` - Usage tracking API
- \`app/(dashboard)/usage/page.tsx\` - Usage dashboard
- \`components/usage/UsageChart.tsx\` - Usage visualization
- \`components/usage/LimitIndicator.tsx\` - Limit display
- \`lib/usage/tracker.ts\` - Usage tracking logic
- \`lib/usage/limits.ts\` - Limit enforcement

### Features Implemented
- Track usage metrics:
  - Agent executions count
  - Tokens consumed
  - API calls made
  - Cost incurred
- Plan-based limits:
  - Free: 100 executions/month
  - Basic: 1,000 executions/month
  - Pro: 10,000 executions/month
  - Enterprise: Unlimited
- Usage visualization:
  - Daily usage chart
  - Monthly trends
  - Top agents used
  - Cost breakdown
- Limit enforcement at API level
- Usage reset on billing cycle
- Overage charges for paid plans`,
    tags: ['usage', 'limits', 'tracking', 'analytics'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-023',
    doc_type: 'next_steps',
    title: 'Usage System Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] Predictive usage alerts
- [ ] Usage optimization suggestions
- [ ] Detailed cost attribution
- [ ] Usage export (CSV, PDF)
- [ ] Historical usage comparison
- [ ] Team usage aggregation

### Limit Management
- [ ] Custom limit configuration
- [ ] Temporary limit increases
- [ ] Limit pause/resume
- [ ] Grace period for limit overages

### Analytics
- [ ] Usage patterns analysis
- [ ] Anomaly detection
- [ ] Cost optimization recommendations
- [ ] ROI tracking for agents`,
    tags: ['enhancement', 'analytics', 'optimization'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-023',
    doc_type: 'testing',
    title: 'Usage Tracking Testing',
    content: `## How to Test

### 1. Execute Agent and Track Usage
- Execute an agent
- Check usage dashboard at /usage
- Expected: Usage count incremented

### 2. Verify Token Tracking
- Execute agent that uses 500 tokens
- Check usage details
- Expected: 500 tokens added to usage

### 3. Test Usage Limits
- User on Free plan (100 executions/month)
- Execute 100 agents
- Try to execute 101st
- Expected: Limit error returned

### 4. Test Usage Dashboard
- Navigate to /usage
- Verify displays:
  - Current month usage
  - Remaining quota
  - Usage by agent
  - Cost estimate
  - Usage chart

### 5. Test Usage Alerts
- Reach 80% of limit
- Expected: Email notification sent

### 6. Test Usage Reset
- Manually trigger billing cycle reset
\`\`\`sql
UPDATE usage_records SET usage_count = 0 WHERE user_id = 'user-id' AND billing_cycle = CURRENT_DATE;
\`\`\`
- Expected: Usage resets to 0

### 7. Test Overage Charges
- User on Pro plan exceeds 10,000 executions
- Expected: Overage charge calculated ($0.01 per execution)

### 8. Test Usage Export
- Navigate to /usage
- Click "Export Usage"
- Select date range
- Expected: CSV download with usage data

### 9. Database Verification
\`\`\`sql
SELECT
  user_id,
  SUM(executions) as total_executions,
  SUM(tokens_used) as total_tokens,
  SUM(cost) as total_cost
FROM agent_executions
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY user_id;
\`\`\`

### 10. Test Real-time Updates
- Open usage dashboard
- Execute agent in another tab
- Expected: Dashboard updates in real-time

### Success Criteria
✅ Usage tracked accurately
✅ Limits enforced correctly
✅ Dashboard displays usage data
✅ Alerts sent at thresholds
✅ Billing cycle resets work
✅ Overage charges calculate properly
✅ Export functionality works`,
    tags: ['testing', 'usage', 'limits', 'analytics'],
    category: 'general',
    priority: 'high'
  },

  // AJ-024: Subscription Plans
  {
    story_id: 'AJ-024',
    doc_type: 'progress',
    title: 'Subscription Plan System',
    content: `## Completed Work

### Subscription Tiers
- ✅ Free plan with basic features
- ✅ Basic plan ($29/month)
- ✅ Pro plan ($99/month)
- ✅ Enterprise plan (custom pricing)
- ✅ Plan comparison page
- ✅ Feature gating by plan

### Files Created
- \`app/(marketing)/pricing/page.tsx\` - Pricing page
- \`components/pricing/PlanCard.tsx\` - Plan display card
- \`components/pricing/FeatureComparison.tsx\` - Comparison table
- \`app/api/subscriptions/create/route.ts\` - Subscription creation
- \`lib/subscriptions/plans.ts\` - Plan definitions

### Plan Features
**Free Plan:**
- 100 agent executions/month
- Basic agents only
- Community support
- Public projects

**Basic Plan ($29/month):**
- 1,000 agent executions/month
- All standard agents
- Email support
- Private projects
- 5 team members

**Pro Plan ($99/month):**
- 10,000 agent executions/month
- All premium agents
- Priority support
- Unlimited private projects
- 20 team members
- API access
- Custom agents

**Enterprise Plan:**
- Unlimited executions
- Custom agent development
- Dedicated support
- SLA guarantees
- SSO integration
- On-premise deployment option`,
    tags: ['subscriptions', 'pricing', 'plans'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-024',
    doc_type: 'next_steps',
    title: 'Subscription Plan Enhancements',
    content: `## Remaining Work

### Plan Features
- [ ] Annual billing discount (20% off)
- [ ] Add-on packages (extra executions, storage)
- [ ] Team plan with per-seat pricing
- [ ] Student/nonprofit discounts
- [ ] Free trial period (14 days)
- [ ] Money-back guarantee

### Pricing Strategy
- [ ] Dynamic pricing based on usage
- [ ] Volume discounts for enterprises
- [ ] Referral program discounts
- [ ] Loyalty rewards
- [ ] Seasonal promotions

### UX Improvements
- [ ] Plan recommendation quiz
- [ ] ROI calculator
- [ ] Migration from competitor plans
- [ ] Plan change preview`,
    tags: ['enhancement', 'pricing', 'ux'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-024',
    doc_type: 'testing',
    title: 'Subscription Plans Testing',
    content: `## How to Test

### 1. View Pricing Page
- Navigate to /pricing
- Expected: All 4 plans displayed with features and prices

### 2. Compare Plans
- Click "Compare Plans"
- Expected: Feature comparison table shows all differences

### 3. Subscribe to Basic Plan
- Click "Choose Basic" ($29/month)
- Enter payment details (Stripe test card)
- Complete subscription
- Expected:
  - Subscription created in Stripe
  - User plan upgraded in database
  - Features unlocked

### 4. Verify Plan Features
- Log in with Basic plan user
- Try to access Pro feature
- Expected: Feature locked with upgrade prompt

### 5. Test Plan Limits
- Basic plan user (1,000 executions/month)
- Execute 1,000 agents
- Try 1,001st
- Expected: Upgrade prompt or overage option

### 6. Test Plan Downgrade
- User on Pro plan downgrades to Basic
- Expected:
  - Downgrade scheduled for end of billing period
  - Warning about feature loss
  - Confirmation email sent

### 7. Test Plan Upgrade
- User on Basic upgrades to Pro
- Expected:
  - Immediate upgrade
  - Prorated charge
  - New limits apply instantly

### 8. Database Verification
\`\`\`sql
SELECT * FROM subscriptions WHERE user_id = 'user-id';
\`\`\`

### 9. Verify Stripe Subscription
- Check Stripe dashboard
- Expected: Subscription appears with correct plan

### 10. Test Annual Billing
- Select Pro plan with annual billing
- Expected: $1,188 charged (vs $1,188 monthly = $99*12)
- Discount applied

### Success Criteria
✅ All plans display correctly
✅ Subscription creation works
✅ Feature gating enforces plan limits
✅ Plan upgrades/downgrades function
✅ Billing cycles correctly
✅ Stripe integration works
✅ Annual billing applies discount`,
    tags: ['testing', 'subscriptions', 'stripe', 'plans'],
    category: 'general',
    priority: 'high'
  },

  // AJ-025: Subscription Management
  {
    story_id: 'AJ-025',
    doc_type: 'progress',
    title: 'Subscription Management System',
    content: `## Completed Work

### Management Features
- ✅ View current subscription
- ✅ Upgrade/downgrade plans
- ✅ Cancel subscription
- ✅ Update payment method
- ✅ View billing history
- ✅ Download invoices

### Files Created
- \`app/(dashboard)/settings/subscription/page.tsx\` - Subscription settings
- \`components/subscription/ManageSubscription.tsx\` - Management UI
- \`components/subscription/PaymentMethod.tsx\` - Payment update
- \`components/subscription/BillingHistory.tsx\` - Invoice list
- \`app/api/subscriptions/manage/route.ts\` - Management API

### Features Implemented
- Current plan display with features
- Usage vs. limit visualization
- One-click plan changes
- Cancellation with feedback form
- Immediate cancellation vs. end of period
- Payment method update via Stripe
- Invoice download (PDF)
- Billing email preferences
- Subscription pause/resume (optional)
- Refund request workflow`,
    tags: ['subscriptions', 'management', 'billing'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-025',
    doc_type: 'next_steps',
    title: 'Subscription Management Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] Subscription analytics dashboard
- [ ] Churn prediction
- [ ] Win-back campaigns for cancelled users
- [ ] Subscription gifting
- [ ] Multiple subscriptions (different products)
- [ ] Subscription transfer between accounts

### Customer Success
- [ ] Onboarding checklist for new subscribers
- [ ] Feature adoption tracking
- [ ] Usage optimization tips
- [ ] Proactive downgrade prevention

### Automation
- [ ] Auto-upgrade based on usage patterns
- [ ] Smart plan recommendations
- [ ] Automated retention emails
- [ ] Billing failure recovery workflow`,
    tags: ['enhancement', 'retention', 'automation'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-025',
    doc_type: 'testing',
    title: 'Subscription Management Testing',
    content: `## How to Test

### 1. View Subscription Settings
- Navigate to /settings/subscription
- Expected: Current plan, features, and billing info displayed

### 2. Test Plan Upgrade
- Click "Upgrade to Pro"
- Confirm upgrade
- Expected:
  - Prorated charge calculated
  - Plan upgraded immediately
  - New features unlocked
  - Confirmation email sent

### 3. Test Plan Downgrade
- Click "Downgrade to Basic"
- Select "At end of billing period"
- Confirm
- Expected:
  - Downgrade scheduled
  - Warning about feature loss
  - Countdown to downgrade date shown

### 4. Test Cancellation
- Click "Cancel Subscription"
- Fill feedback form: "Too expensive"
- Choose "Cancel at period end"
- Confirm
- Expected:
  - Cancellation scheduled
  - Access continues until period end
  - Cancellation email sent

### 5. Test Payment Method Update
- Click "Update Payment Method"
- Enter new card details (Stripe test card)
- Save
- Expected:
  - Payment method updated in Stripe
  - Confirmation shown

### 6. Test Invoice Download
- Navigate to billing history
- Click "Download" on invoice
- Expected: PDF invoice downloads

### 7. Test Billing History
- View /settings/subscription/billing
- Expected: List of all charges with:
  - Date
  - Amount
  - Status (paid/failed)
  - Invoice link

### 8. Test Failed Payment
- Use Stripe test card for payment failure: 4000 0000 0000 0341
- Wait for billing cycle
- Expected:
  - Payment fails
  - Retry attempted
  - Email notification sent
  - Subscription status → "past_due"

### 9. Test Reactivation
- Cancelled user wants to reactivate
- Click "Reactivate Subscription"
- Expected: Subscription reactivated immediately

### 10. Database Verification
\`\`\`sql
SELECT * FROM subscriptions
WHERE user_id = 'user-id'
ORDER BY created_at DESC;
\`\`\`

### Success Criteria
✅ Subscription settings display correctly
✅ Plan changes work (upgrade/downgrade)
✅ Cancellation processes properly
✅ Payment method updates
✅ Invoices downloadable
✅ Billing history accurate
✅ Failed payment handling works
✅ Reactivation functions`,
    tags: ['testing', 'subscriptions', 'billing', 'stripe'],
    category: 'general',
    priority: 'high'
  },

  // AJ-026: Billing & Invoicing
  {
    story_id: 'AJ-026',
    doc_type: 'progress',
    title: 'Billing and Invoicing System',
    content: `## Completed Work

### Billing Features
- ✅ Automated monthly billing
- ✅ Invoice generation
- ✅ Tax calculation (optional)
- ✅ Proration for plan changes
- ✅ Billing email notifications
- ✅ Receipt delivery

### Files Created
- \`app/api/billing/invoice/route.ts\` - Invoice generation
- \`components/billing/Invoice.tsx\` - Invoice template
- \`lib/billing/calculator.ts\` - Proration and tax logic
- \`lib/billing/notifications.ts\` - Email templates

### Features Implemented
- Stripe billing integration
- Automatic invoice generation on charge
- Professional invoice PDF with:
  - Company details
  - Invoice number
  - Line items
  - Subtotal, tax, total
  - Payment status
- Tax calculation support (configurable by region)
- Proration calculator for mid-cycle changes
- Billing notifications:
  - Upcoming charge reminder (3 days before)
  - Successful payment receipt
  - Failed payment alert
  - Invoice ready notification
- Invoice history with search and filter
- Bulk invoice download
- Custom billing email preferences`,
    tags: ['billing', 'invoicing', 'stripe', 'automation'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-026',
    doc_type: 'next_steps',
    title: 'Billing System Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] Custom invoice branding
- [ ] Multi-currency support
- [ ] Purchase orders (for Enterprise)
- [ ] Credit notes and refunds
- [ ] Billing disputes workflow
- [ ] Payment plans for large invoices

### Compliance
- [ ] VAT MOSS compliance (EU)
- [ ] Tax exemption handling
- [ ] Fiscal year reporting
- [ ] Audit trail for billing
- [ ] GDPR-compliant data retention

### Integration
- [ ] QuickBooks integration
- [ ] Xero integration
- [ ] FreshBooks integration
- [ ] Accounting webhook events`,
    tags: ['enhancement', 'compliance', 'integration'],
    category: 'implementation',
    priority: 'medium'
  },
  {
    story_id: 'AJ-026',
    doc_type: 'testing',
    title: 'Billing and Invoicing Testing',
    content: `## How to Test

### 1. Test Automatic Billing
- Create subscription
- Wait for billing cycle (or manually trigger)
\`\`\`bash
stripe trigger invoice.payment_succeeded
\`\`\`
- Expected: Invoice generated, charge created, user notified

### 2. Test Invoice Generation
- Navigate to /settings/billing/invoices
- View latest invoice
- Expected:
  - Professional PDF with all details
  - Correct line items
  - Accurate total

### 3. Test Proration
- User on Basic plan ($29/month)
- Upgrade to Pro ($99/month) mid-cycle (day 15 of 30)
- Expected proration:
\`\`\`
Basic refund: $29 * (15/30) = $14.50
Pro charge: $99 * (15/30) = $49.50
Net charge: $49.50 - $14.50 = $35.00
\`\`\`

### 4. Test Tax Calculation
- User in region with tax (e.g., VAT 20%)
- Subscribe to Pro plan ($99/month)
- Expected:
  - Subtotal: $99
  - Tax (20%): $19.80
  - Total: $118.80

### 5. Test Invoice Email
- Complete a payment
- Check email inbox
- Expected: Invoice email received with PDF attachment

### 6. Test Failed Payment Email
- Use failing test card: 4000 0000 0000 0341
- Trigger billing
- Expected: Failed payment email sent with retry instructions

### 7. Test Upcoming Charge Reminder
- 3 days before billing cycle
- Expected: Reminder email sent

### 8. Test Invoice Download
- View billing history
- Click download on any invoice
- Expected: PDF downloads with correct data

### 9. Test Invoice Search
- Search invoices by:
  - Date range
  - Amount
  - Status (paid/unpaid)
- Expected: Filtered results

### 10. Verify Stripe Invoice
- Check Stripe dashboard > Invoices
- Expected: Invoice matches application invoice

### Database Verification
\`\`\`sql
SELECT * FROM invoices WHERE user_id = 'user-id' ORDER BY created_at DESC;
\`\`\`

### Success Criteria
✅ Automatic billing works
✅ Invoices generate correctly
✅ Proration calculates accurately
✅ Tax calculation correct (if enabled)
✅ Email notifications sent
✅ Invoice PDF professional quality
✅ Failed payment handling works
✅ Invoice history accessible`,
    tags: ['testing', 'billing', 'invoicing', 'stripe'],
    category: 'general',
    priority: 'high'
  },

  // AJ-027: Feature Gating
  {
    story_id: 'AJ-027',
    doc_type: 'progress',
    title: 'Feature Gating and Access Control',
    content: `## Completed Work

### Feature Gating System
- ✅ Plan-based feature access control
- ✅ Feature flag management
- ✅ Graceful degradation for locked features
- ✅ Upgrade prompts and CTAs
- ✅ Feature availability API
- ✅ A/B testing framework

### Files Created
- \`lib/features/gating.ts\` - Feature gating logic
- \`components/features/FeatureGate.tsx\` - Component wrapper
- \`components/features/UpgradePrompt.tsx\` - Upgrade CTA
- \`app/api/features/check/route.ts\` - Feature check API
- \`lib/features/flags.ts\` - Feature flag system

### Features Implemented
- Feature definitions by plan:
\`\`\`typescript
const FEATURES = {
  BASIC_AGENTS: ['free', 'basic', 'pro', 'enterprise'],
  PREMIUM_AGENTS: ['pro', 'enterprise'],
  API_ACCESS: ['pro', 'enterprise'],
  CUSTOM_AGENTS: ['enterprise'],
  TEAM_COLLABORATION: ['basic', 'pro', 'enterprise'],
  SSO: ['enterprise'],
  // ... more features
};
\`\`\`
- React component for feature gating:
  - Shows feature if user has access
  - Shows upgrade prompt if locked
- API-level feature checking
- Feature usage analytics
- Soft launch with feature flags
- A/B testing for new features
- Admin panel for feature management`,
    tags: ['feature-gating', 'access-control', 'subscriptions'],
    category: 'implementation',
    priority: 'high'
  },
  {
    story_id: 'AJ-027',
    doc_type: 'next_steps',
    title: 'Feature Gating Enhancements',
    content: `## Remaining Work

### Advanced Features
- [ ] Dynamic feature pricing (add-ons)
- [ ] Temporary feature access (trials)
- [ ] Feature bundles
- [ ] Usage-based feature access
- [ ] Feature request voting system

### Analytics
- [ ] Feature adoption tracking
- [ ] Upgrade conversion from locked features
- [ ] Feature value analysis
- [ ] Churn correlation with features

### Developer Tools
- [ ] Feature flag dashboard
- [ ] Feature rollout strategies
- [ ] Feature deprecation workflow
- [ ] Feature documentation generator`,
    tags: ['enhancement', 'analytics', 'developer-tools'],
    category: 'implementation',
    priority: 'low'
  },
  {
    story_id: 'AJ-027',
    doc_type: 'testing',
    title: 'Feature Gating Testing',
    content: `## How to Test

### 1. Test Feature Access by Plan
**Free Plan User:**
- Try to access premium agent
- Expected: Locked, upgrade prompt shown

**Pro Plan User:**
- Access premium agent
- Expected: Full access granted

### 2. Test FeatureGate Component
\`\`\`tsx
<FeatureGate feature="API_ACCESS" fallback={<UpgradePrompt />}>
  <APIKeyManager />
</FeatureGate>
\`\`\`
- User on Basic plan views this
- Expected: Sees upgrade prompt instead of API key manager

### 3. Test API Feature Check
\`\`\`bash
curl http://localhost:3001/api/features/check \\
  -H "Authorization: Bearer USER_TOKEN" \\
  -d '{"feature": "CUSTOM_AGENTS"}'
\`\`\`
Expected: Returns access boolean

### 4. Test Feature Flags
- Admin enables feature flag: "NEW_AGENT_BUILDER"
- Feature visible to all users
- Admin disables flag
- Feature hidden

### 5. Test A/B Testing
- Feature "ENHANCED_SEARCH" assigned to 50% of users
- User A: Sees enhanced search
- User B: Sees standard search
- Expected: Consistent assignment per user

### 6. Test Upgrade Flow
- Free user clicks "Unlock Premium Agents"
- Expected: Redirected to /pricing with Pro plan highlighted

### 7. Test Feature Degradation
- Pro user downgrades to Basic
- Has active custom agent
- Expected:
  - Warning shown before downgrade
  - Custom agent disabled after downgrade
  - Option to re-enable on upgrade

### 8. Test Feature Usage Analytics
\`\`\`sql
SELECT feature, COUNT(*) as access_attempts, SUM(CASE WHEN has_access THEN 1 ELSE 0 END) as successful_access
FROM feature_checks
GROUP BY feature;
\`\`\`

### 9. Test Admin Feature Management
- Log in as admin
- Navigate to /admin/features
- Toggle feature "SSO"
- Expected: Feature availability updates in real-time

### 10. Test Edge Cases
- User upgrades mid-session
- Expected: New features unlock without requiring logout
- User's subscription expires
- Expected: Features immediately locked

### Success Criteria
✅ Feature access controlled by plan
✅ FeatureGate component works correctly
✅ API checks enforce feature access
✅ Feature flags toggle features
✅ A/B testing assigns consistently
✅ Upgrade prompts display correctly
✅ Downgrades lock features
✅ Admin can manage features`,
    tags: ['testing', 'feature-gating', 'access-control'],
    category: 'general',
    priority: 'high'
  },
];

async function addDocumentation() {
  console.log('Adding documentation for AJ-020 through AJ-027...\\n');

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

  console.log(`\\n=== Batch 4 Summary (AJ-020 to AJ-027) ===`);
  console.log(`Successfully added: ${successCount} documentation entries`);
  console.log(`Errors: ${errorCount} entries`);
}

addDocumentation();
