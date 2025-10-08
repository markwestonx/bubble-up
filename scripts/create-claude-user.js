const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  console.error('Please add it to .env.local');
  process.exit(1);
}

async function createClaudeUser() {
  const email = 'claude_mw@regulativ.ai';
  const password = '31iYTgxdPdBi';

  // Create Supabase admin client (bypasses RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('📝 Creating Claude user account...');
  console.log(`   Email: ${email}`);

  // Create user via admin API
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (userError) {
    // User might already exist
    if (userError.message.includes('already been registered')) {
      console.log('ℹ️  User already exists, checking roles...');

      // Get user by email
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users.users.find(u => u.email === email);

      if (!existingUser) {
        console.error('❌ Could not find existing user');
        process.exit(1);
      }

      console.log('✅ Found existing user:', existingUser.id);

      // Check and add roles
      const { data: roles } = await supabase
        .from('user_project_roles')
        .select('*')
        .eq('user_id', existingUser.id);

      console.log(`   Current roles: ${roles?.length || 0}`);

      // Add admin role for BubbleUp if not present
      const hasBubbleUpRole = roles?.some(r => r.project === 'BubbleUp');
      if (!hasBubbleUpRole) {
        const { error: roleError } = await supabase
          .from('user_project_roles')
          .insert({
            user_id: existingUser.id,
            project: 'BubbleUp',
            role: 'admin'
          });

        if (roleError) {
          console.error('❌ Error adding BubbleUp role:', roleError.message);
        } else {
          console.log('✅ Added admin role for BubbleUp project');
        }
      } else {
        console.log('✅ BubbleUp role already exists');
      }

      // Add admin role for ALL if not present
      const hasAllRole = roles?.some(r => r.project === 'ALL');
      if (!hasAllRole) {
        const { error: roleError } = await supabase
          .from('user_project_roles')
          .insert({
            user_id: existingUser.id,
            project: 'ALL',
            role: 'admin'
          });

        if (roleError) {
          console.error('❌ Error adding ALL role:', roleError.message);
        } else {
          console.log('✅ Added admin role for ALL projects');
        }
      } else {
        console.log('✅ ALL role already exists');
      }

      console.log('\n✅ Setup completed!');
      console.log('\nCredentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      return;
    }

    console.error('❌ Error creating user:', userError.message);
    process.exit(1);
  }

  const userId = userData.user.id;
  console.log('✅ User created:', userId);

  // Add admin role for BubbleUp
  console.log('\n📝 Adding project roles...');

  const { error: bubbleUpRoleError } = await supabase
    .from('user_project_roles')
    .insert({
      user_id: userId,
      project: 'BubbleUp',
      role: 'admin'
    });

  if (bubbleUpRoleError) {
    console.error('❌ Error adding BubbleUp role:', bubbleUpRoleError.message);
  } else {
    console.log('✅ Added admin role for BubbleUp project');
  }

  // Add admin role for ALL projects
  const { error: allRoleError } = await supabase
    .from('user_project_roles')
    .insert({
      user_id: userId,
      project: 'ALL',
      role: 'admin'
    });

  if (allRoleError) {
    console.error('❌ Error adding ALL role:', allRoleError.message);
  } else {
    console.log('✅ Added admin role for ALL projects');
  }

  console.log('\n✅ Claude user account created successfully!');
  console.log('\nCredentials:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log('\nThis account can now:');
  console.log('   - Access all BubbleUp projects');
  console.log('   - Create, edit, and delete documentation');
  console.log('   - Manage stories and tasks');
}

createClaudeUser().catch(console.error);
