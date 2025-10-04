const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔄 Running user_project_roles migration...\n');

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'create_user_project_roles.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split on semicolons to run each statement separately
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

      if (error) {
        // If exec_sql doesn't exist, try direct SQL execution
        const { error: directError } = await supabase.from('_').select('*').limit(0);
        console.log('Note: Cannot execute SQL directly via client. Please run this migration in Supabase SQL Editor:');
        console.log('\n--- SQL to Run ---');
        console.log(sql);
        console.log('\n--- End SQL ---\n');
        console.log('Go to: https://app.supabase.com/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql/new');
        return;
      }
    } catch (err) {
      console.log('ℹ️  Direct SQL execution not available via client.');
      console.log('Please run the migration manually in Supabase SQL Editor:\n');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Create a new query');
      console.log('4. Copy and paste the SQL from:');
      console.log('   supabase/migrations/create_user_project_roles.sql');
      console.log('5. Run the query\n');
      console.log('Direct link:');
      console.log('https://app.supabase.com/project/bzqgoppjuynxfyrrhsbg/sql/new\n');
      return;
    }
  }

  console.log('✅ Migration completed successfully!\n');
}

runMigration();
