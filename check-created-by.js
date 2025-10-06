#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkCreatedBy() {
  const { data, error } = await supabase
    .from('backlog_items')
    .select('id, project, user_story, created_by')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  const withCreatedBy = data.filter(d => d.created_by);
  const withoutCreatedBy = data.filter(d => !d.created_by);

  console.log('Stories WITH created_by:', withCreatedBy.length);
  console.log('Stories WITHOUT created_by (null):', withoutCreatedBy.length);

  console.log('\nSample stories WITH created_by:');
  withCreatedBy.slice(0, 5).forEach(s => {
    console.log(`  ID ${s.id}: ${s.created_by.substring(0, 36)}`);
  });

  console.log('\nSample stories WITHOUT created_by:');
  withoutCreatedBy.slice(0, 10).forEach(s => {
    const story = s.user_story ? s.user_story.substring(0, 60) : 'N/A';
    console.log(`  ID ${s.id} [${s.project}]: ${story}...`);
  });

  // Check unique created_by values
  const uniqueCreatedBy = [...new Set(withCreatedBy.map(s => s.created_by))];
  console.log('\nUnique created_by UUIDs:');
  uniqueCreatedBy.forEach(uuid => {
    const count = withCreatedBy.filter(s => s.created_by === uuid).length;
    console.log(`  ${uuid}: ${count} stories`);
  });
}

checkCreatedBy().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
