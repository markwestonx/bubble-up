const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const stories = [
  // EPIC 1: Documentation Repository Infrastructure
  {
    project: 'BubbleUp',
    epic: 'Documentation-Repository',
    priority: 'HIGH',
    status: 'NOT_STARTED',
    user_story: 'As a developer, I need a documentation repository table in the database so that I can persist build logs, test results, and technical decisions linked to user stories',
    acceptance_criteria: [
      'Database table created with fields: id, story_id, doc_type, title, content, author, timestamp, tags, links',
      'Foreign key relationship to backlog_items table',
      'Indexes on story_id and doc_type for fast queries',
      'Migration script tested and run successfully'
    ],
    effort: 3,
    business_value: 10,
    dependencies: [],
    technical_notes: 'Schema: documentation { id: uuid, story_id: string, doc_type: enum(build_log, test_result, decision_log, technical_note), title: string, content: text, author: string, created_at: timestamp, updated_at: timestamp, tags: string[], links: jsonb }',
    is_next: false
  },
  {
    project: 'BubbleUp',
    epic: 'Documentation-Repository',
    priority: 'HIGH',
    status: 'NOT_STARTED',
    user_story: 'As a developer, I need an API endpoint to create documentation entries so that Claude and other tools can programmatically store documentation',
    acceptance_criteria: [
      'POST /api/documentation endpoint created',
      'Accepts story_id, doc_type, title, content, tags, links',
      'Validates story_id exists in backlog_items',
      'Returns created documentation with ID',
      'Includes proper error handling and auth checks'
    ],
    effort: 2,
    business_value: 9,
    dependencies: [],
    technical_notes: 'Use existing RBAC system - require canCreate permission for the story\'s project',
    is_next: false
  },
  {
    project: 'BubbleUp',
    epic: 'Documentation-Repository',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    user_story: 'As a developer, I need an API endpoint to retrieve documentation for a story so that I can view all related logs, decisions, and notes',
    acceptance_criteria: [
      'GET /api/documentation?story_id=XXX endpoint created',
      'Returns all documentation for specified story',
      'Supports filtering by doc_type',
      'Returns results sorted by timestamp (newest first)',
      'Includes pagination for large result sets'
    ],
    effort: 2,
    business_value: 8,
    dependencies: [],
    technical_notes: 'Use existing RBAC system - require canView permission for the story\'s project',
    is_next: false
  },
  {
    project: 'BubbleUp',
    epic: 'Documentation-Repository',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    user_story: 'As a user, I need to see documentation entries in the expanded story view so that I can access build logs, test results, and technical decisions',
    acceptance_criteria: [
      'Documentation section added to expanded story view',
      'Shows list of documentation entries with type badges',
      'Displays timestamp and author for each entry',
      'Entries are collapsible to show full content',
      'Links are clickable and open in new tab'
    ],
    effort: 3,
    business_value: 8,
    dependencies: [],
    technical_notes: 'Add new section after Technical Notes in expanded view. Use tabs or accordion for different doc types',
    is_next: false
  },

  // EPIC 2: Teams Integration
  {
    project: 'BubbleUp',
    epic: 'Teams-Integration',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    user_story: 'As a developer, I need to create slash commands in Teams so that I can trigger BubbleUp actions from Teams conversations',
    acceptance_criteria: [
      'Teams bot registered and configured',
      '/bubble-doc command saves documentation to BubbleUp',
      '/bubble-status command shows story status',
      '/bubble-search command searches stories',
      'Commands include proper auth and error handling'
    ],
    effort: 5,
    business_value: 7,
    dependencies: [],
    technical_notes: 'Use Microsoft Bot Framework or Teams Toolkit. Will need Teams app manifest and webhook endpoints',
    is_next: false
  },
  {
    project: 'BubbleUp',
    epic: 'Teams-Integration',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    user_story: 'As a developer, I need BubbleUp to post notifications to Teams channels so that the team stays informed of story updates and documentation additions',
    acceptance_criteria: [
      'Webhook configuration for Teams channels',
      'Notifications sent when stories change status',
      'Notifications sent when documentation is added',
      'Adaptive cards format with rich formatting',
      'Channel mapping configurable per project'
    ],
    effort: 3,
    business_value: 6,
    dependencies: [],
    technical_notes: 'Use Teams incoming webhooks. Store webhook URLs per project in database',
    is_next: false
  },

  // EPIC 3: Claude Integration & Automation
  {
    project: 'BubbleUp',
    epic: 'Claude-Integration',
    priority: 'HIGH',
    status: 'NOT_STARTED',
    user_story: 'As Claude, I need a documented API for adding documentation to BubbleUp stories so that I can automatically capture valuable insights during development',
    acceptance_criteria: [
      'API documentation created with examples',
      'curl examples for POST /api/documentation',
      'Authentication method documented',
      'Common use cases documented (build logs, decisions, test results)',
      'Error responses documented'
    ],
    effort: 2,
    business_value: 9,
    dependencies: [],
    technical_notes: 'Create OpenAPI/Swagger spec. Include in BubbleUp docs or README',
    is_next: false
  },
  {
    project: 'BubbleUp',
    epic: 'Claude-Integration',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    user_story: 'As a developer, I need Claude to automatically log build results to BubbleUp so that I have a persistent record of build successes and failures',
    acceptance_criteria: [
      'Claude detects build commands (npm run build, etc.)',
      'Build output is parsed for errors/warnings',
      'Summary posted to BubbleUp documentation API',
      'Links to relevant story IDs when mentioned',
      'Includes timestamp and build duration'
    ],
    effort: 5,
    business_value: 8,
    dependencies: [],
    technical_notes: 'May require Claude Code hook or custom slash command. Parse build output to extract key info',
    is_next: false
  },
  {
    project: 'BubbleUp',
    epic: 'Claude-Integration',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    user_story: 'As a developer, I need Claude to automatically log test results to BubbleUp so that I can track test coverage and failures over time',
    acceptance_criteria: [
      'Claude detects test commands (npm test, pytest, etc.)',
      'Test results parsed for pass/fail counts',
      'Failed tests highlighted with error messages',
      'Summary posted to BubbleUp documentation API',
      'Links to relevant story IDs'
    ],
    effort: 5,
    business_value: 8,
    dependencies: [],
    technical_notes: 'Similar to build logging. Parse test framework output (Jest, Mocha, pytest, etc.)',
    is_next: false
  },

  // EPIC 4: Knowledge Management
  {
    project: 'BubbleUp',
    epic: 'Knowledge-Management',
    priority: 'LOW',
    status: 'NOT_STARTED',
    user_story: 'As a team, we need Teams channels organized by topic so that we can centralize knowledge about database design, coding standards, testing, etc.',
    acceptance_criteria: [
      'Channels created: Database Design, Coding Standards, Testing, Claude Agents, Architecture',
      'Each channel has description and purpose',
      'Pinned messages with key resources',
      'Channel owners assigned',
      'Links to BubbleUp documentation'
    ],
    effort: 1,
    business_value: 6,
    dependencies: [],
    technical_notes: 'This is mostly organizational/manual setup, not development work',
    is_next: false
  },
  {
    project: 'BubbleUp',
    epic: 'Knowledge-Management',
    priority: 'LOW',
    status: 'NOT_STARTED',
    user_story: 'As a developer, I need reverse-engineered style guides and architecture docs stored in the repository so that I can reference standards and patterns',
    acceptance_criteria: [
      'Style guide documents created from SOC MicroApp',
      'Database structure diagrams created and stored',
      'Middle-tier code patterns documented',
      'Documents stored in /docs folder',
      'Links added to relevant Teams channels and BubbleUp stories'
    ],
    effort: 8,
    business_value: 7,
    dependencies: [],
    technical_notes: 'Manual documentation effort. Consider using tools like mermaid for diagrams',
    is_next: false
  },

  // EPIC 5: Version Control & Change Tracking
  {
    project: 'BubbleUp',
    epic: 'Documentation-Repository',
    priority: 'LOW',
    status: 'NOT_STARTED',
    user_story: 'As a developer, I need documentation entries to support versioning so that I can track how decisions and designs evolve over time',
    acceptance_criteria: [
      'Documentation entries include version field',
      'API supports updating existing docs (creates new version)',
      'UI shows version history',
      'Diff view between versions',
      'Ability to revert to previous version'
    ],
    effort: 5,
    business_value: 5,
    dependencies: [],
    technical_notes: 'Consider using soft deletes and version_number field, or separate versions table',
    is_next: false
  },
  {
    project: 'BubbleUp',
    epic: 'Documentation-Repository',
    priority: 'LOW',
    status: 'NOT_STARTED',
    user_story: 'As a developer, I need to link documentation entries across stories so that I can show how decisions impact multiple stories',
    acceptance_criteria: [
      'Documentation entries support related_stories array',
      'UI shows backlinks to other stories',
      'API endpoint to find all docs related to a set of stories',
      'Visual graph/network view of story relationships',
      'Ability to add/remove story links from UI'
    ],
    effort: 5,
    business_value: 6,
    dependencies: [],
    technical_notes: 'Store as jsonb array of story IDs. Consider using graph visualization library',
    is_next: false
  }
];

async function addStories() {
  console.log('\n🚀 Adding documentation repository stories to BubbleUp backlog...\n');

  // Get current max display_order
  const { data: existingItems } = await supabase
    .from('backlog_items')
    .select('display_order')
    .eq('project', 'BubbleUp')
    .order('display_order', { ascending: false })
    .limit(1);

  let nextOrder = existingItems && existingItems.length > 0 ? existingItems[0].display_order + 1 : 1;

  // Get next ID
  const { data: maxIdItem } = await supabase
    .from('backlog_items')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);

  let nextId = 1;
  if (maxIdItem && maxIdItem.length > 0) {
    const currentMaxId = parseInt(maxIdItem[0].id);
    nextId = currentMaxId + 1;
  }

  for (const story of stories) {
    const id = String(nextId).padStart(3, '0');
    console.log(`Adding story ${id}: ${story.user_story.substring(0, 60)}...`);

    const { error } = await supabase
      .from('backlog_items')
      .insert({
        id,
        ...story,
        display_order: nextOrder,
        owner: 'Development'
      });

    if (error) {
      console.error(`  ❌ Failed to add story ${id}:`, error.message);
    } else {
      console.log(`  ✅ Added story ${id}`);
    }

    nextId++;
    nextOrder++;
  }

  console.log(`\n✅ Added ${stories.length} stories to BubbleUp backlog!\n`);
  console.log('📊 Summary:');
  console.log(`  - Documentation-Repository epic: ${stories.filter(s => s.epic === 'Documentation-Repository').length} stories`);
  console.log(`  - Teams-Integration epic: ${stories.filter(s => s.epic === 'Teams-Integration').length} stories`);
  console.log(`  - Claude-Integration epic: ${stories.filter(s => s.epic === 'Claude-Integration').length} stories`);
  console.log(`  - Knowledge-Management epic: ${stories.filter(s => s.epic === 'Knowledge-Management').length} stories`);
}

addStories().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
