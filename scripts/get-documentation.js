const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getDocumentation() {
  const email = process.argv[2] || 'mark.weston@regulativ.ai';
  const password = process.argv[3];
  const story_id = process.argv[4] || '196';
  const port = process.argv[5] || '3010';

  if (!password) {
    console.error('❌ Please provide password');
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

  const token = authData.session.access_token;

  // Fetch documentation
  const response = await fetch(`http://localhost:${port}/api/documentation?story_id=${story_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('❌ Failed to fetch documentation:', result.error);
    return;
  }

  console.log(`\n📚 Found ${result.total} documentation entries for Story #${story_id}:\n`);

  result.documentation.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc.title}`);
    console.log(`   Type: ${doc.doc_type}`);
    console.log(`   Author: ${doc.author}`);
    console.log(`   Created: ${doc.created_at}`);
    console.log(`   Tags: ${doc.tags?.join(', ') || 'none'}`);
    console.log(`   ID: ${doc.id}\n`);
  });

  // Sign out
  await supabase.auth.signOut();
}

getDocumentation().catch(console.error);
