#!/usr/bin/env node
/**
 * Restore created_by and assigned_to fields for all backlog items
 * Set all stories to Mark Weston: 88c48796-c1a2-471d-808d-8f72f38d8359
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Mark Weston's UUID
const MARK_WESTON_UUID = '88c48796-c1a2-471d-808d-8f72f38d8359';

async function restoreCreatedBy() {
  console.log('\n' + '='.repeat(70));
  console.log('🔧 Restoring created_by and assigned_to fields for all backlog items');
  console.log('='.repeat(70) + '\n');

  try {
    // Fetch all backlog items
    console.log('📥 Fetching all backlog items...');
    const { data: stories, error: fetchError } = await supabase
      .from('backlog_items')
      .select('id, created_by, assigned_to, user_story')
      .order('id', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching stories:', fetchError);
      process.exit(1);
    }

    console.log(`✅ Fetched ${stories.length} stories\n`);

    // Count stories that need updating
    const storiesNeedingCreatedByUpdate = stories.filter(s => s.created_by !== MARK_WESTON_UUID);
    const storiesNeedingAssignedToUpdate = stories.filter(s => s.assigned_to !== MARK_WESTON_UUID);
    const storiesNeedingUpdate = stories.filter(s => s.created_by !== MARK_WESTON_UUID || s.assigned_to !== MARK_WESTON_UUID);

    console.log('📊 Current Status:');
    console.log(`   - Stories with correct created_by: ${stories.length - storiesNeedingCreatedByUpdate.length}`);
    console.log(`   - Stories with correct assigned_to: ${stories.length - storiesNeedingAssignedToUpdate.length}`);
    console.log(`   - Stories needing created_by update: ${storiesNeedingCreatedByUpdate.length}`);
    console.log(`   - Stories needing assigned_to update: ${storiesNeedingAssignedToUpdate.length}`);
    console.log(`   - Total stories needing any update: ${storiesNeedingUpdate.length}\n`);

    if (storiesNeedingUpdate.length === 0) {
      console.log('✅ All stories already have correct created_by value!');
      console.log('');
      return;
    }

    // Show sample of stories to be updated
    console.log('📝 Sample stories to be updated:');
    storiesNeedingUpdate.slice(0, 5).forEach(s => {
      const story = s.user_story ? s.user_story.substring(0, 60) : 'N/A';
      const currentCreatedBy = s.created_by || 'null';
      console.log(`   ID ${s.id}: ${currentCreatedBy.substring(0, 8)}... → ${MARK_WESTON_UUID.substring(0, 8)}...`);
      console.log(`           ${story}...`);
    });
    console.log('');

    // Confirm before updating
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question(`Set created_by AND assigned_to for ${storiesNeedingUpdate.length} stories to Mark Weston? (yes/no): `, resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Operation cancelled\n');
      return;
    }

    // Update all stories
    console.log('\n📝 Updating stories...\n');
    let successCount = 0;
    let errorCount = 0;

    for (const story of storiesNeedingUpdate) {
      const { error } = await supabase
        .from('backlog_items')
        .update({
          created_by: MARK_WESTON_UUID,
          assigned_to: MARK_WESTON_UUID
        })
        .eq('id', story.id);

      if (error) {
        console.error(`  ❌ Failed to update ${story.id}:`, error.message);
        errorCount++;
      } else {
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`  ✅ Updated ${successCount}/${storiesNeedingUpdate.length} stories...`);
        }
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`✅ Complete: ${successCount} updated, ${errorCount} failed`);
    console.log('='.repeat(70) + '\n');

    // Verify the update
    console.log('🔍 Verifying update...');
    const { data: verifyStories, error: verifyError } = await supabase
      .from('backlog_items')
      .select('id, created_by')
      .eq('created_by', MARK_WESTON_UUID);

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      console.log(`✅ Verified: ${verifyStories.length} stories now have created_by = Mark Weston`);
    }

    // Check for any remaining nulls
    const { data: nullStories } = await supabase
      .from('backlog_items')
      .select('id')
      .is('created_by', null);

    if (nullStories && nullStories.length > 0) {
      console.log(`⚠️  Warning: ${nullStories.length} stories still have null created_by`);
    } else {
      console.log('✅ No stories with null created_by remaining');
    }

    console.log('');

  } catch (err) {
    console.error('\n❌ Error:', err);
    process.exit(1);
  }
}

restoreCreatedBy();
