const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function deleteStory(email, password, storyId, project, port = 3000) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in
  console.log(`🔐 Signing in as ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    console.error('❌ Authentication failed:', authError.message);
    return;
  }

  console.log('✅ Authenticated successfully');

  // Get the session token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('❌ No session token available');
    return;
  }

  // Use the API endpoint (respects RBAC) instead of direct database access
  console.log(`🗑️  Deleting story ${storyId} via API (enforces permissions)...`);
  const response = await fetch(`http://localhost:${port}/api/stories/${storyId}?project=${encodeURIComponent(project)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await response.json();

  if (!response.ok) {
    console.error(`❌ Failed to delete story: ${result.error}`);
    console.error(`   This likely means you don't have permission (only admins can delete)`);
    await supabase.auth.signOut();
    return;
  }

  console.log(`✅ Story ${storyId} deleted successfully`);
  console.log(`   Deleted by: ${email}`);
  console.log(`   From project: ${project}`);

  // Sign out
  await supabase.auth.signOut();
}

// Get arguments from command line
const email = process.argv[2] || 'claude_mw@regulativ.ai';
const password = process.argv[3] || '31iYTgxdPdBi';
const storyId = process.argv[4] || '216';
const project = process.argv[5] || 'BubbleUp';
const port = process.argv[6] || 3000;

console.log('⚠️  NOTE: This script now uses the API endpoint which enforces RBAC.');
console.log('   Only users with admin role can delete stories.\n');

deleteStory(email, password, storyId, project, port).catch(console.error);
