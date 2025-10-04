#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Find and load config
function loadConfig() {
  const configPaths = [
    path.join(__dirname, '.bubbleup-config.json'),
    path.join(process.env.HOME || process.env.USERPROFILE, '.bubbleup-config.json'),
    path.join(process.env.HOME || process.env.USERPROFILE, 'OneDrive', 'Desktop', '.bubbleup-config.json')
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  }

  throw new Error('❌ .bubbleup-config.json not found in project root, home directory, or Desktop');
}

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('❌ .env.local not found');
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const config = loadConfig();
loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// User lookup with fuzzy matching
function findUser(input) {
  const search = input.toLowerCase().trim();

  // Check if it's "me" or current user
  if (search === 'me' || search === 'myself') {
    return config.currentUser;
  }

  // Search through all users
  for (const user of config.users) {
    // Check aliases
    if (user.aliases?.some(alias => alias.toLowerCase() === search)) {
      return user;
    }
    // Check name parts
    if (user.firstName?.toLowerCase() === search || user.lastName?.toLowerCase() === search) {
      return user;
    }
    // Check full name
    if (user.name?.toLowerCase().includes(search)) {
      return user;
    }
    // Check email
    if (user.email?.toLowerCase().includes(search)) {
      return user;
    }
    if (user.alternateEmails?.some(email => email.toLowerCase().includes(search))) {
      return user;
    }
  }

  return null;
}

async function createStory() {
  console.log('\n🎯 BubbleUp Story Creator\n');
  console.log(`👤 Creating as: ${config.currentUser.name} (${config.currentUser.email})\n`);

  try {
    // 1. Select Project
    console.log('📁 Select a project:');
    config.projects.forEach((project, idx) => {
      console.log(`   ${idx + 1}. ${project.name}`);
    });

    const projectChoice = await question('\n   Your choice (1-6): ');
    const projectIndex = parseInt(projectChoice) - 1;

    if (projectIndex < 0 || projectIndex >= config.projects.length) {
      console.log('❌ Invalid project selection');
      rl.close();
      return;
    }

    const selectedProject = config.projects[projectIndex];
    console.log(`   ✅ ${selectedProject.name}\n`);

    // 2. Assign to whom?
    const assignInput = await question('👥 Assign to (name/email or "unassigned"): ');

    let assignedUser = null;
    if (assignInput.toLowerCase() !== 'unassigned' && assignInput.trim() !== '') {
      assignedUser = findUser(assignInput);
      if (assignedUser) {
        console.log(`   ✅ Assigned to: ${assignedUser.name} (${assignedUser.email})\n`);
      } else {
        console.log(`   ⚠️  User not found. Story will be unassigned.\n`);
      }
    } else {
      console.log('   ✅ Unassigned\n');
    }

    // 3. Select Epic
    console.log(`🎭 Select epic for ${selectedProject.name}:`);
    selectedProject.epics.forEach((epic, idx) => {
      console.log(`   ${idx + 1}. ${epic}`);
    });
    console.log(`   ${selectedProject.epics.length + 1}. Custom epic (type your own)`);

    const epicChoice = await question('\n   Your choice: ');
    const epicIndex = parseInt(epicChoice) - 1;

    let epic;
    if (epicIndex >= 0 && epicIndex < selectedProject.epics.length) {
      epic = selectedProject.epics[epicIndex];
    } else {
      epic = await question('   Enter custom epic name: ');
    }
    console.log(`   ✅ ${epic}\n`);

    // 4. User Story
    const userStory = await question('📝 User story (start with "As a..."): ');
    console.log('');

    // 5. Acceptance Criteria
    console.log('✅ Acceptance criteria (one per line, empty line when done):');
    const acceptanceCriteria = [];
    let criteriaCount = 1;
    while (true) {
      const criteria = await question(`   ${criteriaCount}. `);
      if (!criteria.trim()) break;
      acceptanceCriteria.push(criteria);
      criteriaCount++;
    }
    console.log(`   ✅ ${acceptanceCriteria.length} criteria added\n`);

    // 6. Priority
    console.log('🔥 Priority:');
    config.priorities.forEach((priority, idx) => {
      console.log(`   ${idx + 1}. ${priority}`);
    });
    const priorityChoice = await question('\n   Your choice (1-4): ');
    const priority = config.priorities[parseInt(priorityChoice) - 1] || 'MEDIUM';
    console.log(`   ✅ ${priority}\n`);

    // 7. Effort
    console.log('💪 Effort (Fibonacci points):');
    config.effortPoints.forEach((points, idx) => {
      console.log(`   ${idx + 1}. ${points} points`);
    });
    const effortChoice = await question('\n   Your choice (1-6): ');
    const effort = config.effortPoints[parseInt(effortChoice) - 1] || 5;
    console.log(`   ✅ ${effort} points\n`);

    // 8. Business Value
    const businessValue = await question('💰 Business value (1-10): ');
    const bizValue = Math.min(10, Math.max(1, parseInt(businessValue) || 5));
    console.log(`   ✅ ${bizValue}/10\n`);

    // 9. Technical Notes
    const techNotes = await question('🔧 Technical notes (optional, press Enter to skip): ');
    console.log('');

    // 10. Dependencies
    const dependencies = await question('🔗 Dependencies (story IDs, comma-separated, or press Enter): ');
    const deps = dependencies ? dependencies.split(',').map(d => d.trim()).filter(Boolean) : [];
    console.log('');

    // 11. Mark as Next?
    const isNextInput = await question('⭐ Mark as "Next up"? (y/n): ');
    const isNext = isNextInput.toLowerCase().startsWith('y');
    console.log('');

    // Create the story
    console.log('🚀 Creating story...\n');

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get max display_order
    const { data: maxOrderData } = await supabaseAdmin
      .from('backlog_items')
      .select('display_order')
      .eq('project', selectedProject.name)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const displayOrder = maxOrderData ? maxOrderData.display_order + 1 : 0;

    // Generate story ID
    const storyId = Math.floor(Date.now() / 1000).toString();

    const newStory = {
      id: storyId,
      project: selectedProject.name,
      epic: epic,
      priority: priority,
      status: 'NOT_STARTED',
      user_story: userStory,
      acceptance_criteria: acceptanceCriteria,
      effort: effort,
      business_value: bizValue,
      dependencies: deps,
      technical_notes: techNotes || '',
      assigned_to: assignedUser?.uuid || null,
      is_next: isNext,
      display_order: displayOrder,
      created_by: config.currentUser.uuid
    };

    const { data, error } = await supabaseAdmin
      .from('backlog_items')
      .insert(newStory)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating story:', error);
      rl.close();
      return;
    }

    // Success!
    console.log('✅ Story created successfully!\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📝 Story #${data.id}`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📁 Project:        ${data.project}`);
    console.log(`🎭 Epic:           ${data.epic}`);
    console.log(`🔥 Priority:       ${data.priority}`);
    console.log(`💪 Effort:         ${data.effort} points`);
    console.log(`💰 Business Value: ${data.business_value}/10`);
    console.log(`👥 Assigned to:    ${assignedUser ? assignedUser.name : 'Unassigned'}`);
    console.log(`👨‍💻 Created by:     ${config.currentUser.name}`);
    console.log(`⭐ Next up:        ${data.is_next ? 'Yes' : 'No'}`);
    console.log(`📊 Status:         ${data.status}`);
    console.log('');
    console.log('📖 User Story:');
    console.log(`   ${data.user_story}`);
    console.log('');
    if (acceptanceCriteria.length > 0) {
      console.log('✅ Acceptance Criteria:');
      acceptanceCriteria.forEach((criteria, idx) => {
        console.log(`   ${idx + 1}. ${criteria}`);
      });
      console.log('');
    }
    if (techNotes) {
      console.log('🔧 Technical Notes:');
      console.log(`   ${techNotes}`);
      console.log('');
    }
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\n🌐 View in BubbleUp: http://localhost:3006\n`);

    rl.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    rl.close();
  }
}

createStory();
