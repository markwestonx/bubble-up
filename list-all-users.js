#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function listAllUsers() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`👥 BubbleUp User Accounts`);
    console.log(`${'='.repeat(70)}\n`);

    console.log(`Total users: ${data.users.length}\n`);

    data.users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  UUID: ${user.id}`);
      console.log(`  Created: ${new Date(user.created_at).toLocaleString('en-GB')}`);
      console.log(`  Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('en-GB') : 'Never'}`);
      console.log(`  Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log('');
    });

  } catch (err) {
    console.error('Error:', err);
  }
}

listAllUsers();
