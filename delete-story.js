const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load env
const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const storyId = process.argv[2];

if (!storyId) {
  console.log('Usage: node delete-story.js <story-id>');
  process.exit(1);
}

async function deleteStory() {
  console.log(`\n🗑️  Deleting story #${storyId}...\n`);

  // First, check if it exists
  const { data: story, error: fetchError } = await supabaseAdmin
    .from('backlog_items')
    .select('*')
    .eq('id', storyId)
    .single();

  if (fetchError || !story) {
    console.log(`❌ Story #${storyId} not found`);
    return;
  }

  console.log('📋 Found story:');
  console.log(`   ID: ${story.id}`);
  console.log(`   Project: ${story.project}`);
  console.log(`   Epic: ${story.epic}`);
  console.log(`   Priority: ${story.priority}`);
  console.log(`   User Story: ${story.user_story.substring(0, 80)}...`);
  console.log('');

  // Delete it
  const { error: deleteError } = await supabaseAdmin
    .from('backlog_items')
    .delete()
    .eq('id', storyId);

  if (deleteError) {
    console.error('❌ Error deleting story:', deleteError);
    return;
  }

  console.log(`✅ Story #${storyId} deleted successfully!\n`);
}

deleteStory();
