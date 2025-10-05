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

async function updateStories() {
  const storyIds = ['141', '139'];

  for (const storyId of storyIds) {
    const { data, error } = await supabaseAdmin
      .from('backlog_items')
      .update({
        priority: 'LOW',
        status: 'IN_PROGRESS'
      })
      .eq('id', storyId)
      .select()
      .single();

    if (error) {
      console.log(`❌ Error updating story ${storyId}:`, error.message);
    } else {
      console.log(`✅ Story #${storyId} updated`);
      console.log(`   Priority: ${data.priority} | Status: ${data.status}`);
      console.log(`   ${data.user_story.substring(0, 70)}...`);
    }
  }
}

updateStories();
