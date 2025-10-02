// Quick test to verify Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bzqgoppjuynxfyrrhsbg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cWdvcHBqdXlueGZ5cnJoc2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTg2MTcsImV4cCI6MjA3NDg3NDYxN30.zLAWXYAK5FNgA2ohQqc0z_Ufy93iCKWMGqkM5pTO95Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');

  // Try to insert a test item
  const testItem = {
    id: 'TEST001',
    project: 'Test Project',
    epic: 'foundation',
    priority: 'HIGH',
    status: 'NOT_STARTED',
    user_story: 'Test story',
    acceptance_criteria: ['Test criteria'],
    effort: 1,
    business_value: 1,
    dependencies: [],
    technical_notes: 'Test',
    owner: 'Test',
    is_next: false,
    display_order: 0
  };

  console.log('Attempting to insert test item...');
  const { data, error } = await supabase
    .from('backlog_items')
    .insert([testItem])
    .select();

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Success! Inserted:', data);

    // Clean up
    console.log('Cleaning up test item...');
    await supabase.from('backlog_items').delete().eq('id', 'TEST001');
    console.log('✅ Test complete!');
  }
}

testConnection();
