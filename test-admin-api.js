#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Service key exists:', !!supabaseServiceKey);
console.log('Service key length:', supabaseServiceKey?.length);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testListUsers() {
  try {
    console.log('\nAttempting to list users...');
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Supabase error:', error);
      return;
    }

    console.log('Success! Users:', data?.users?.length);
    if (data?.users?.length > 0) {
      console.log('Sample user:', data.users[0].email, data.users[0].id);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testListUsers();
