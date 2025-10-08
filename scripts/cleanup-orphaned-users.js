const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function cleanupOrphanedUsers() {
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('🔍 Finding orphaned users...\n');

  // Get all users from Supabase Auth
  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    console.error('❌ Failed to fetch users:', usersError.message);
    return;
  }

  console.log(`Found ${users.length} total users in Supabase Auth`);

  // Get all user IDs from user_project_roles
  const { data: roles, error: rolesError } = await supabaseAdmin
    .from('user_project_roles')
    .select('user_id');

  if (rolesError) {
    console.error('❌ Failed to fetch roles:', rolesError.message);
    return;
  }

  const userIdsWithRoles = new Set(roles.map(r => r.user_id));
  console.log(`${userIdsWithRoles.size} users have assigned roles\n`);

  // Find orphaned users (in Auth but no roles)
  const orphanedUsers = users.filter(user => !userIdsWithRoles.has(user.id));

  if (orphanedUsers.length === 0) {
    console.log('✅ No orphaned users found!');
    return;
  }

  console.log(`Found ${orphanedUsers.length} orphaned user(s):\n`);

  for (const user of orphanedUsers) {
    console.log(`  - ${user.email} (ID: ${user.id})`);
  }

  console.log('\n🗑️  Deleting orphaned users...\n');

  for (const user of orphanedUsers) {
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error(`  ❌ Failed to delete ${user.email}:`, deleteError.message);
    } else {
      console.log(`  ✅ Deleted ${user.email}`);
    }
  }

  console.log('\n✨ Cleanup complete!');
}

cleanupOrphanedUsers().catch(console.error);
