const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testDocumentation() {
  console.log('🧪 Testing Documentation API...\n');

  // Get credentials from command line args or use defaults
  const email = process.argv[2] || 'mark.weston@regulativ.ai';
  const password = process.argv[3];

  if (!password) {
    console.error('❌ Please provide email and password as arguments:');
    console.error('   node scripts/test-documentation.js <email> <password>');
    console.error('\nExample:');
    console.error('   node scripts/test-documentation.js mark.weston@regulativ.ai YourPassword\n');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in to get auth token
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    console.error('❌ Authentication failed:', authError.message);
    return;
  }

  console.log('✅ Authenticated as:', authData.user.email);
  const token = authData.session.access_token;

  // Prepare documentation content
  const documentationContent = `**Story #196: API endpoint to create documentation entries**

**Implementation Summary:**

Created POST /api/documentation endpoint at \`app/api/documentation/route.ts:19-140\` with the following features:

1. **Authentication & Authorization:**
   - Requires valid Bearer token
   - Validates user has create permissions for the story's project
   - Checks roles: admin, editor, or read_write

2. **Validation:**
   - Ensures story_id exists in backlog_items
   - Validates doc_type is one of 13 allowed types
   - Requires title and content fields

3. **Supported Fields:**
   - story_id (required)
   - doc_type (required): design, plan, progress, next_steps, testing, requirements, feedback, build_log, test_result, decision_log, technical_note, error, success
   - title (required)
   - content (required)
   - tags (array, optional)
   - links (array of objects, optional)
   - related_stories (array, optional)
   - category (optional, defaults to 'general')
   - priority (optional, defaults to 'medium')
   - metadata (JSONB, optional)

4. **Auto-populated Fields:**
   - author: "Claude"
   - author_email: current user's email
   - version_number: 1
   - is_latest: true
   - timestamps: created_at, updated_at

5. **Response:**
   - Returns 201 Created with full documentation object
   - Includes generated UUID id

**Testing Results:**
This documentation entry was created using the POST endpoint itself, demonstrating the system works correctly!`;

  // Create documentation entry
  console.log('📝 Creating documentation for Story #196...\n');

  const port = process.argv[4] || '3000';
  const response = await fetch(`http://localhost:${port}/api/documentation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      story_id: '196',
      doc_type: 'success',
      title: 'Story #196 API Implementation Complete',
      content: documentationContent,
      tags: ['api', 'documentation', 'success', 'testing'],
      category: 'implementation',
      priority: 'high',
      related_stories: ['195', '197', '198', '201']
    })
  });

  const responseText = await response.text();

  let result;
  try {
    result = JSON.parse(responseText);
  } catch (err) {
    console.error('❌ Server returned non-JSON response:');
    console.error('Status:', response.status);
    console.error('Response:', responseText.substring(0, 500));
    return;
  }

  if (!response.ok) {
    console.error('❌ Failed to create documentation:', result.error);
    console.error('Status:', response.status);
    return;
  }

  console.log('\n✅ Documentation created successfully!');
  console.log('\nDocumentation ID:', result.documentation.id);
  console.log('Story ID:', result.documentation.story_id);
  console.log('Type:', result.documentation.doc_type);
  console.log('Title:', result.documentation.title);
  console.log('Author:', result.documentation.author);
  console.log('Created at:', result.documentation.created_at);
  console.log('Tags:', result.documentation.tags);
  console.log('Related stories:', result.documentation.related_stories);

  // Sign out
  await supabase.auth.signOut();

  console.log('\n✅ Test completed successfully!');
  console.log('You can now view this documentation in the BubbleUp UI by clicking the document icon on Story #196');
}

testDocumentation().catch(console.error);
