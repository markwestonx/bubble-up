#!/usr/bin/env node

/**
 * Set up Ajency.AI team in BubbleUp with epics and stories
 * Run: node setup-ajency-team.js
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

// Epic definitions
const EPICS = [
  { name: 'Foundation', description: 'Core infrastructure and setup', color: 'blue' },
  { name: 'Specialist Marketplace', description: 'Marketplace for AI specialists', color: 'purple' },
  { name: 'Project & Payments', description: 'Project management and payment processing', color: 'green' },
  { name: 'Trust & Reviews', description: 'Review system and trust building', color: 'orange' },
  { name: 'AI Agent Library', description: 'AI agent marketplace', color: 'indigo' },
  { name: 'Subscription System', description: 'Subscription billing and management', color: 'cyan' },
  { name: 'Launch Prep', description: 'Final touches for launch', color: 'red' }
];

async function setupAjencyTeam() {
  try {
    console.log('🚀 Setting up Ajency.AI in BubbleUp...\n');

    // Load config
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const currentUser = config.currentUser;
    console.log(`👤 Current user: ${currentUser.name}`);
    console.log(`📧 UUID: ${currentUser.uuid}\n`);

    // Load backlog
    const backlog = JSON.parse(fs.readFileSync(backlogPath, 'utf8'));
    console.log(`📦 Loaded ${backlog.stories.length} stories\n`);

    // Step 1: Create team
    console.log('📁 Creating Ajency.AI team...');
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: 'Ajency.AI',
        slug: 'ajency-ai'
      })
      .select()
      .single();

    if (teamError) {
      console.error('❌ Error creating team:', teamError);
      process.exit(1);
    }

    console.log(`✅ Team created with ID: ${team.id}\n`);

    // Step 2: Add user to team
    console.log('👥 Adding you to the team...');
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: currentUser.uuid,
        role: 'owner'
      });

    if (memberError) {
      console.error('❌ Error adding team member:', memberError);
      process.exit(1);
    }

    console.log('✅ You are now the team owner\n');

    // Step 3: Create epics
    console.log('🎯 Creating epics...');
    const epicMap = {};

    for (let i = 0; i < EPICS.length; i++) {
      const epic = EPICS[i];
      const { data: createdEpic, error: epicError } = await supabase
        .from('epics')
        .insert({
          team_id: team.id,
          name: epic.name,
          description: epic.description,
          color: epic.color,
          display_order: i + 1
        })
        .select()
        .single();

      if (epicError) {
        console.error(`❌ Error creating epic ${epic.name}:`, epicError);
      } else {
        epicMap[epic.name] = createdEpic.id;
        console.log(`   ✅ ${epic.name}`);
      }
    }

    console.log('\n📝 Creating stories...');

    let storyNum = 1;
    let imported = 0;
    let failed = 0;

    for (const story of backlog.stories) {
      const storyId = String(storyNum).padStart(3, '0'); // '001', '002', etc.

      const storyData = {
        id: storyId,
        team_id: team.id,
        project: 'Ajency.AI',
        epic_id: epicMap[story.epic],
        epic_name: story.epic,
        story: story.title,
        details: story.description,
        acceptance_criteria: story.acceptanceCriteria.join('\n'),
        notes: story.technicalNotes || '',
        owner: currentUser.name,
        dependencies: Array.isArray(story.dependencies) ? story.dependencies.join(', ') : '',
        status: story.status,
        priority: story.priority,
        display_order: storyNum
      };

      const { error } = await supabase.from('stories').insert(storyData);

      if (error) {
        console.error(`   ❌ Story ${storyId}: ${story.title}`);
        console.error(`      Error: ${error.message}`);
        failed++;
      } else {
        console.log(`   ✅ Story ${storyId}: ${story.title}`);
        imported++;
      }

      storyNum++;
    }

    console.log(`\n📊 Setup Summary:`);
    console.log(`   🏢 Team: Ajency.AI (${team.id})`);
    console.log(`   🎯 Epics: ${EPICS.length}`);
    console.log(`   ✅ Stories imported: ${imported}`);
    console.log(`   ❌ Stories failed: ${failed}`);
    console.log(`\n🎉 Setup complete!`);
    console.log(`\n👉 View at http://localhost:3000`);
    console.log(`👉 Or use /bubble command in Claude Code\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run setup
setupAjencyTeam();
