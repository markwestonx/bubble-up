#!/usr/bin/env node

/**
 * Import Ajency.AI stories into BubbleUp
 * Run: node import-ajency-stories.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration
const configPath = path.join(__dirname, '.bubbleup-config.json');
const backlogPath = path.join(__dirname, '..', 'ajency', 'ajency-ai-backlog.json');

async function importStories() {
  try {
    console.log('🚀 Starting Ajency.AI story import...\n');

    // Load config
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const currentUser = config.currentUser;
    console.log(`👤 Current user: ${currentUser.name} (${currentUser.email})`);
    console.log(`📧 UUID: ${currentUser.uuid}\n`);

    // Load backlog
    const backlog = JSON.parse(fs.readFileSync(backlogPath, 'utf8'));
    console.log(`📦 Loaded ${backlog.stories.length} stories from ${backlog.project}\n`);

    // Get next story ID
    const { data: existingStories, error: fetchError } = await supabase
      .from('backlog_items')
      .select('id')
      .eq('project', backlog.project)
      .order('id', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching existing stories:', fetchError);
      process.exit(1);
    }

    let nextId = existingStories && existingStories.length > 0 ? parseInt(existingStories[0].id.replace('AJ-', '')) + 1 : 1;
    console.log(`🔢 Starting from story ID: ${nextId}\n`);

    // Import each story
    let imported = 0;
    let failed = 0;

    for (const story of backlog.stories) {
      const storyId = `AJ-${String(nextId).padStart(3, '0')}`;

      const storyData = {
        id: storyId,
        project: backlog.project,
        epic: story.epic,
        user_story: story.title,
        acceptance_criteria: story.acceptanceCriteria,
        priority: story.priority,
        effort: story.effort,
        business_value: story.businessValue,
        status: story.status,
        technical_notes: story.technicalNotes || '',
        dependencies: story.dependencies || [],
        owner: currentUser.name,
        display_order: nextId,
        is_next: false
      };

      const { error } = await supabase.from('backlog_items').insert(storyData);

      if (error) {
        console.error(`❌ Failed to import story ${nextId}: ${story.title}`);
        console.error(`   Error: ${error.message}`);
        failed++;
      } else {
        console.log(`✅ Imported story ${nextId}: ${story.title}`);
        imported++;
      }

      nextId++;
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Successfully imported: ${imported}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📝 Total stories: ${backlog.stories.length}\n`);

    if (imported > 0) {
      console.log(`🎉 Import complete! View your stories at http://localhost:3000`);
      console.log(`   Or use the /bubble command in Claude Code\n`);
    }

  } catch (error) {
    console.error('❌ Fatal error during import:', error.message);
    process.exit(1);
  }
}

// Run import
importStories();
