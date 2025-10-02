// Fetch Sales Genie backlog from Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://bzqgoppjuynxfyrrhsbg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cWdvcHBqdXlueGZ5cnJoc2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTg2MTcsImV4cCI6MjA3NDg3NDYxN30.zLAWXYAK5FNgA2ohQqc0z_Ufy93iCKWMGqkM5pTO95Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchSalesGenieBacklog() {
  console.log('🔍 Fetching Sales Genie backlog from Supabase...\n');

  // Fetch all backlog items for Sales Genie project
  const { data, error } = await supabase
    .from('backlog_items')
    .select('*')
    .eq('project', 'Sales Genie')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('❌ Error fetching backlog:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No Sales Genie backlog items found.');
    return;
  }

  console.log(`✅ Found ${data.length} backlog items for Sales Genie\n`);

  // Group by epic
  const epicGroups = {};
  data.forEach(item => {
    if (!epicGroups[item.epic]) {
      epicGroups[item.epic] = [];
    }
    epicGroups[item.epic].push(item);
  });

  // Display summary
  console.log('📊 Backlog Summary by Epic:');
  console.log('─'.repeat(80));

  Object.entries(epicGroups).forEach(([epic, items]) => {
    const statuses = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    console.log(`\n${epic.toUpperCase()} (${items.length} stories)`);
    console.log(`  Status breakdown:`, statuses);
  });

  console.log('\n' + '─'.repeat(80));
  console.log('\n📝 Detailed Story List:\n');

  // Display all stories
  Object.entries(epicGroups).forEach(([epic, items]) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`EPIC: ${epic.toUpperCase()}`);
    console.log('='.repeat(80));

    items.forEach((item, idx) => {
      console.log(`\n[${item.id}] ${item.user_story}`);
      console.log(`  Priority: ${item.priority} | Status: ${item.status}`);
      if (item.owner) console.log(`  Owner: ${item.owner}`);
      if (item.dependencies && item.dependencies.length > 0) {
        console.log(`  Dependencies: ${item.dependencies.join(', ')}`);
      }
      if (item.technical_notes) {
        console.log(`  Notes: ${item.technical_notes}`);
      }
      if (item.acceptance_criteria && item.acceptance_criteria.length > 0) {
        console.log(`  Acceptance Criteria:`);
        item.acceptance_criteria.forEach((criteria, i) => {
          console.log(`    ${i + 1}. ${criteria}`);
        });
      }
    });
  });

  // Save to JSON file
  const outputPath = 'sales-genie-backlog.json';
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n✅ Full backlog saved to: ${outputPath}\n`);

  // Summary stats
  const totalStories = data.length;
  const statusCounts = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  const priorityCounts = data.reduce((acc, item) => {
    acc[item.priority] = (acc[item.priority] || 0) + 1;
    return acc;
  }, {});

  console.log('📈 Overall Statistics:');
  console.log('─'.repeat(80));
  console.log(`Total Stories: ${totalStories}`);
  console.log(`Total Epics: ${Object.keys(epicGroups).length}`);
  console.log('\nBy Status:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} (${((count/totalStories)*100).toFixed(1)}%)`);
  });
  console.log('\nBy Priority:');
  Object.entries(priorityCounts).forEach(([priority, count]) => {
    console.log(`  ${priority}: ${count} (${((count/totalStories)*100).toFixed(1)}%)`);
  });
  console.log('─'.repeat(80) + '\n');
}

fetchSalesGenieBacklog();
