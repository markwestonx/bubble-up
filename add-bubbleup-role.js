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

async function addBubbleUpRole() {
  console.log('\n🔍 Adding BubbleUp role to all users...\n');

  // Get all users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error('❌ Failed to list users:', usersError);
    process.exit(1);
  }

  console.log(`Found ${users.users.length} users\n`);

  for (const user of users.users) {
    console.log(`Processing user: ${user.email}`);

    // Check if user already has BubbleUp role
    const { data: existingRole } = await supabase
      .from('user_project_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('project', 'BubbleUp')
      .single();

    if (existingRole) {
      console.log(`  ✅ Already has BubbleUp role: ${existingRole.role}`);
      continue;
    }

    // Add BubbleUp admin role (lowercase to match database constraint)
    const { error } = await supabase
      .from('user_project_roles')
      .insert({
        user_id: user.id,
        project: 'BubbleUp',
        role: 'admin'
      });

    if (error) {
      console.error(`  ❌ Failed to add role:`, error.message);
    } else {
      console.log(`  ✅ Added BubbleUp Admin role`);
    }
  }

  console.log('\n✅ Done!\n');
}

addBubbleUpRole().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
