const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://bzqgoppjuynxfyrrhsbg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cWdvcHBqdXlueGZ5cnJoc2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTg2MTcsImV4cCI6MjA3NDg3NDYxN30.zLAWXYAK5FNgA2ohQqc0z_Ufy93iCKWMGqkM5pTO95Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importOutreachStories() {
  try {
    console.log('📖 Reading outreach campaign stories from JSON file...');
    const storiesJson = fs.readFileSync(path.join(__dirname, 'outreach-campaign-stories.json'), 'utf8');
    const stories = JSON.parse(storiesJson);

    console.log(`📊 Found ${stories.length} stories to import (IDs 089-115)`);
    console.log('');

    // Transform stories to match Supabase schema
    const backlogItems = stories.map(story => ({
      id: story.id,
      project: story.project,
      epic: story.epic,
      priority: story.priority,
      status: story.status,
      user_story: story.userStory,
      acceptance_criteria: story.acceptanceCriteria,
      effort: story.effort,
      business_value: story.businessValue,
      dependencies: story.dependencies,
      technical_notes: story.technicalNotes,
      owner: story.owner,
      is_next: story.isNext,
      display_order: parseInt(story.id)
    }));

    console.log('🚀 Importing stories to Supabase...');
    console.log('');

    // Insert all stories
    const { data, error } = await supabase
      .from('backlog_items')
      .upsert(backlogItems, { onConflict: 'id' });

    if (error) {
      console.error('❌ Error importing stories:', error);
      process.exit(1);
    }

    console.log('✅ Successfully imported all outreach campaign stories!');
    console.log('');
    console.log('📋 Summary by Epic:');

    // Group by epic
    const epicGroups = {};
    stories.forEach(story => {
      if (!epicGroups[story.epic]) {
        epicGroups[story.epic] = [];
      }
      epicGroups[story.epic].push(story);
    });

    Object.entries(epicGroups).forEach(([epic, epicStories]) => {
      const totalEffort = epicStories.reduce((sum, s) => sum + s.effort, 0);
      const avgValue = (epicStories.reduce((sum, s) => sum + s.businessValue, 0) / epicStories.length).toFixed(1);
      console.log(`   ${epic}: ${epicStories.length} stories, ${totalEffort} points, avg value ${avgValue}/10`);
    });

    const totalEffort = stories.reduce((sum, s) => sum + s.effort, 0);
    const avgValue = (stories.reduce((sum, s) => sum + s.businessValue, 0) / stories.length).toFixed(1);

    console.log('');
    console.log(`💡 Total Effort: ${totalEffort} story points`);
    console.log(`💡 Average Business Value: ${avgValue}/10`);
    console.log('💡 All stories marked as NEXT (urgent)');
    console.log('');
    console.log('🔄 Run /sync in BubbleUp to see the new stories!');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

importOutreachStories();
