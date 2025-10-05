#!/usr/bin/env node
/**
 * Sync backlog from Supabase and clean up epic labels
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function syncAndCleanup() {
  console.log('📥 Fetching all stories from Supabase...\n');

  // Fetch all backlog items
  const { data: stories, error } = await supabase
    .from('backlog_items')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('❌ Error fetching stories:', error);
    process.exit(1);
  }

  console.log(`✅ Fetched ${stories.length} stories\n`);

  // Save original to backlog.json
  fs.writeFileSync('backlog.json', JSON.stringify(stories, null, 2));
  console.log('💾 Saved to backlog.json\n');

  // Clean up epic labels
  console.log('🧹 Cleaning up epic labels...\n');

  const epicMapping = {
    // API variations
    'API': 'API Integration',
    'Api': 'API Integration',
    'api': 'API Integration',
    'API & Integration': 'API Integration',
    'api integration': 'API Integration',
    'integration': 'API Integration',
    'Integration': 'API Integration',

    // Authentication variations
    'Authentication': 'Authentication',
    'authentication': 'Authentication',

    // Deployment variations
    'Deployment': 'Deployment',
    'deployment': 'Deployment',

    // Foundation variations
    'Foundation': 'Foundation',
    'foundation': 'Foundation',

    // Marketing variations
    'Marketing': 'Marketing',
    'marketing': 'Marketing',
    'Marketing Microsite': 'Marketing',
    'marketing microsite': 'Marketing'
  };

  const updates = [];

  for (const story of stories) {
    const currentEpic = story.epic;
    const normalizedEpic = epicMapping[currentEpic];

    if (normalizedEpic && normalizedEpic !== currentEpic) {
      updates.push({
        id: story.id,
        oldEpic: currentEpic,
        newEpic: normalizedEpic,
        project: story.project,
        userStory: story.user_story?.substring(0, 50) + '...'
      });
    }
  }

  if (updates.length === 0) {
    console.log('✅ No epic labels need cleaning\n');
    return;
  }

  console.log(`Found ${updates.length} stories to update:\n`);
  updates.forEach(u => {
    console.log(`  ${u.id}: "${u.oldEpic}" → "${u.newEpic}" [${u.project}]`);
    console.log(`     ${u.userStory}\n`);
  });

  // Confirm before updating
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question('Proceed with updates? (yes/no): ', resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Aborted\n');
    return;
  }

  // Update stories
  console.log('\n📝 Updating stories...\n');
  let successCount = 0;
  let errorCount = 0;

  for (const update of updates) {
    const { error } = await supabase
      .from('backlog_items')
      .update({ epic: update.newEpic })
      .eq('id', update.id);

    if (error) {
      console.error(`  ❌ Failed to update ${update.id}:`, error.message);
      errorCount++;
    } else {
      console.log(`  ✅ Updated ${update.id}: ${update.oldEpic} → ${update.newEpic}`);
      successCount++;
    }
  }

  console.log(`\n✅ Complete: ${successCount} updated, ${errorCount} failed\n`);

  // Fetch and display unique epic labels
  const { data: updatedStories } = await supabase
    .from('backlog_items')
    .select('epic')
    .order('epic', { ascending: true });

  const uniqueEpics = [...new Set(updatedStories.map(s => s.epic))].sort();
  console.log('📊 Current epic labels in database:');
  uniqueEpics.forEach(epic => console.log(`  - ${epic}`));
  console.log('');
}

syncAndCleanup().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
