const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  console.error('Please add it to .env.local');
  process.exit(1);
}

async function addUserRole() {
  const userId = '88c48796-c1a2-471d-808d-8f72f38d8359'; // mark.weston@regulativ.ai
  const project = 'BubbleUp';
  const role = 'admin';

  // Create Supabase client with service role (bypasses RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log(`📝 Adding role for user ${userId}...`);
  console.log(`   Project: ${project}`);
  console.log(`   Role: ${role}`);

  // Insert or update role
  const { data, error } = await supabase
    .from('user_project_roles')
    .upsert({
      user_id: userId,
      project,
      role
    }, {
      onConflict: 'user_id,project'
    })
    .select();

  if (error) {
    console.error('❌ Error adding role:', error.message);
    process.exit(1);
  }

  console.log('✅ Role added successfully!');
  console.log(data);
}

addUserRole().catch(console.error);
