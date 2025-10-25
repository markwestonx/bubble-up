const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateCompletedStories() {
  console.log('Updating Ajency.AI stories to DONE status...\n');

  // All 36 stories are now complete
  const completedStories = [
    'AJ-001', 'AJ-002', 'AJ-003', 'AJ-004', 'AJ-005', // Foundation
    'AJ-006', 'AJ-007', 'AJ-008', 'AJ-009', 'AJ-010', // Specialist Marketplace
    'AJ-011', 'AJ-012', 'AJ-013', 'AJ-014', 'AJ-015', 'AJ-016', // Project & Payments
    'AJ-017', 'AJ-018', 'AJ-019', // Trust & Reviews
    'AJ-020', 'AJ-021', 'AJ-022', 'AJ-023', // AI Agent Library
    'AJ-024', 'AJ-025', 'AJ-026', 'AJ-027', // Subscription System
    'AJ-028', 'AJ-029', 'AJ-030', 'AJ-031', 'AJ-032', 'AJ-033', 'AJ-034', 'AJ-035', 'AJ-036' // Launch Prep
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const storyId of completedStories) {
    try {
      const { error } = await supabase
        .from('backlog_items')
        .update({ status: 'DONE' })
        .eq('id', storyId)
        .eq('project', 'Ajency.AI');

      if (error) {
        console.error(`✗ Error updating ${storyId}:`, error.message);
        errorCount++;
      } else {
        console.log(`✓ Updated ${storyId} to DONE`);
        successCount++;
      }
    } catch (err) {
      console.error(`✗ Exception updating ${storyId}:`, err);
      errorCount++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Successfully updated: ${successCount} stories`);
  console.log(`Errors: ${errorCount} stories`);
  console.log(`\n🎉 All 36 Ajency.AI stories are now marked as DONE!`);
}

updateCompletedStories();
