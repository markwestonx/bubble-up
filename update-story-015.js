const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bzqgoppjuynxfyrrhsbg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cWdvcHBqdXlueGZ5cnJoc2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTg2MTcsImV4cCI6MjA3NDg3NDYxN30.zLAWXYAK5FNgA2ohQqc0z_Ufy93iCKWMGqkM5pTO95Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateStory015() {
  try {
    console.log('📝 Updating Story 015 to include Linked Helper import...');

    const { data, error } = await supabase
      .from('backlog_items')
      .update({
        user_story: 'As a user, I need LinkedIn Sales Navigator and Linked Helper CSV import so that I can bulk import prospects from multiple sources',
        acceptance_criteria: [
          'Upload CSV endpoint functional',
          'Parse LinkedIn Sales Navigator export format',
          'Parse Linked Helper export format',
          'Map Linked Helper fields to Sales Genie schema',
          'Deduplicate prospects across imports (by email, LinkedIn URL)',
          'Tag prospects with import source (Sales Navigator or Linked Helper)',
          'Validate and clean prospect data',
          'Store in database with qualification scores',
          'Support imports up to 2,500 records',
          'Display import summary (new, duplicates, errors)'
        ],
        technical_notes: 'ToS-compliant approach - manual exports only. Support both Sales Navigator and Linked Helper CSV formats. Use LinkedIn URL as unique identifier for deduplication. Store import metadata (source, date, batch ID).'
      })
      .eq('id', '015');

    if (error) {
      console.error('❌ Error updating story:', error);
      process.exit(1);
    }

    console.log('✅ Successfully updated Story 015!');
    console.log('');
    console.log('Updated acceptance criteria to include:');
    console.log('  - Linked Helper CSV import');
    console.log('  - Field mapping for Linked Helper format');
    console.log('  - Enhanced deduplication logic');
    console.log('  - Source tagging');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

updateStory015();
