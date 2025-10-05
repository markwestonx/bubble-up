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

// Get next sequential ID
async function getNextId(supabaseAdmin) {
  const { data: allItems } = await supabaseAdmin
    .from('backlog_items')
    .select('id');

  const numericIds = allItems
    ?.map(item => parseInt(item.id))
    .filter(id => !isNaN(id))
    .sort((a, b) => b - a) || [];

  const highestId = numericIds.length > 0 ? numericIds[0] : 0;
  return (highestId + 1).toString();
}

// Get next display order for project
async function getNextDisplayOrder(supabaseAdmin, project) {
  const { data: maxOrderData } = await supabaseAdmin
    .from('backlog_items')
    .select('display_order')
    .eq('project', project)
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  return maxOrderData ? maxOrderData.display_order + 1 : 0;
}

// 1. ADD A STORY
async function addStory(supabaseAdmin) {
  console.log('\n➕ ADD A NEW STORY\n');

  // Select Project
  console.log('📁 Select a project:');
  config.projects.forEach((project, idx) => {
    console.log(`   ${idx + 1}. ${project.name}`);
  });

  const projectChoice = await question(`\n   Your choice (1-${config.projects.length}): `);
  const projectIndex = parseInt(projectChoice) - 1;

  if (projectIndex < 0 || projectIndex >= config.projects.length) {
    console.log('❌ Invalid project selection');
    return;
  }

  const selectedProject = config.projects[projectIndex];
  console.log(`   ✅ ${selectedProject.name}\n`);

  // Assign to whom?
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

  // Select Epic
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

  // User Story
  const userStory = await question('📝 User story (start with "As a..."): ');
  console.log('');

  // Acceptance Criteria
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

  // Priority
  console.log('🔥 Priority:');
  config.priorities.forEach((priority, idx) => {
    console.log(`   ${idx + 1}. ${priority}`);
  });
  const priorityChoice = await question('\n   Your choice (1-4): ');
  const priority = config.priorities[parseInt(priorityChoice) - 1] || 'MEDIUM';
  console.log(`   ✅ ${priority}\n`);

  // Effort
  console.log('💪 Effort (Fibonacci points):');
  config.effortPoints.forEach((points, idx) => {
    console.log(`   ${idx + 1}. ${points} points`);
  });
  const effortChoice = await question('\n   Your choice (1-6): ');
  const effort = config.effortPoints[parseInt(effortChoice) - 1] || 5;
  console.log(`   ✅ ${effort} points\n`);

  // Business Value
  const businessValue = await question('💰 Business value (1-10): ');
  const bizValue = Math.min(10, Math.max(1, parseInt(businessValue) || 5));
  console.log(`   ✅ ${bizValue}/10\n`);

  // Technical Notes
  const techNotes = await question('🔧 Technical notes (optional, press Enter to skip): ');
  console.log('');

  // Dependencies
  const dependencies = await question('🔗 Dependencies (story IDs, comma-separated, or press Enter): ');
  const deps = dependencies ? dependencies.split(',').map(d => d.trim()).filter(Boolean) : [];
  console.log('');

  // Mark as Next?
  const isNextInput = await question('⭐ Mark as "Next up"? (y/n): ');
  const isNext = isNextInput.toLowerCase().startsWith('y');
  console.log('');

  // Create the story
  console.log('🚀 Creating story...\n');

  const storyId = await getNextId(supabaseAdmin);
  const displayOrder = await getNextDisplayOrder(supabaseAdmin, selectedProject.name);

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
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// 2. DELETE A STORY
async function deleteStory(supabaseAdmin) {
  console.log('\n❌ DELETE A STORY\n');

  const storyId = await question('Enter story ID to delete: ');

  // Fetch the story first
  const { data: story, error: fetchError } = await supabaseAdmin
    .from('backlog_items')
    .select('*')
    .eq('id', storyId)
    .single();

  if (fetchError || !story) {
    console.log('❌ Story not found');
    return;
  }

  // Show story details
  console.log('\n📝 Story to delete:');
  console.log(`   ID: ${story.id}`);
  console.log(`   Project: ${story.project}`);
  console.log(`   Story: ${story.user_story}`);
  console.log('');

  const confirm = await question('⚠️  Are you sure you want to delete this story? (yes/no): ');

  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Deletion cancelled');
    return;
  }

  const { error: deleteError } = await supabaseAdmin
    .from('backlog_items')
    .delete()
    .eq('id', storyId);

  if (deleteError) {
    console.error('❌ Error deleting story:', deleteError);
    return;
  }

  console.log('✅ Story deleted successfully!\n');
}

// 3. EDIT A STORY
async function editStory(supabaseAdmin) {
  console.log('\n✏️  EDIT A STORY\n');

  const storyId = await question('Enter story ID to edit: ');

  // Fetch the story
  const { data: story, error: fetchError } = await supabaseAdmin
    .from('backlog_items')
    .select('*')
    .eq('id', storyId)
    .single();

  if (fetchError || !story) {
    console.log('❌ Story not found');
    return;
  }

  // Show current story
  console.log('\n📝 Current Story:');
  console.log(`   Project: ${story.project}`);
  console.log(`   Epic: ${story.epic}`);
  console.log(`   Priority: ${story.priority}`);
  console.log(`   Status: ${story.status}`);
  console.log(`   User Story: ${story.user_story}`);
  console.log(`   Effort: ${story.effort} points`);
  console.log(`   Business Value: ${story.business_value}/10`);
  console.log('');

  console.log('What would you like to edit?');
  console.log('   1. User Story Text');
  console.log('   2. Epic');
  console.log('   3. Priority');
  console.log('   4. Status');
  console.log('   5. Effort');
  console.log('   6. Business Value');
  console.log('   7. Acceptance Criteria');
  console.log('   8. Technical Notes');
  console.log('   9. Assignment');
  console.log('   0. Cancel');

  const choice = await question('\n   Your choice: ');

  const updates = {};

  switch (choice) {
    case '1':
      const newStory = await question('\nNew user story text: ');
      updates.user_story = newStory;
      break;
    case '2':
      const newEpic = await question('\nNew epic: ');
      updates.epic = newEpic;
      break;
    case '3':
      console.log('\nPriority:');
      config.priorities.forEach((p, idx) => console.log(`   ${idx + 1}. ${p}`));
      const pChoice = await question('\nYour choice: ');
      updates.priority = config.priorities[parseInt(pChoice) - 1];
      break;
    case '4':
      console.log('\nStatus:');
      config.statuses.forEach((s, idx) => console.log(`   ${idx + 1}. ${s}`));
      const sChoice = await question('\nYour choice: ');
      updates.status = config.statuses[parseInt(sChoice) - 1];
      break;
    case '5':
      console.log('\nEffort:');
      config.effortPoints.forEach((e, idx) => console.log(`   ${idx + 1}. ${e} points`));
      const eChoice = await question('\nYour choice: ');
      updates.effort = config.effortPoints[parseInt(eChoice) - 1];
      break;
    case '6':
      const newBizValue = await question('\nNew business value (1-10): ');
      updates.business_value = Math.min(10, Math.max(1, parseInt(newBizValue)));
      break;
    case '7':
      console.log('\nEnter new acceptance criteria (one per line, empty line when done):');
      const newCriteria = [];
      let count = 1;
      while (true) {
        const c = await question(`   ${count}. `);
        if (!c.trim()) break;
        newCriteria.push(c);
        count++;
      }
      updates.acceptance_criteria = newCriteria;
      break;
    case '8':
      const newNotes = await question('\nNew technical notes: ');
      updates.technical_notes = newNotes;
      break;
    case '9':
      const assignInput = await question('\nAssign to (name/email or "unassigned"): ');
      if (assignInput.toLowerCase() === 'unassigned' || !assignInput.trim()) {
        updates.assigned_to = null;
      } else {
        const user = findUser(assignInput);
        if (user) {
          updates.assigned_to = user.uuid;
          console.log(`   ✅ Assigned to: ${user.name}`);
        } else {
          console.log('   ⚠️  User not found. Assignment unchanged.');
        }
      }
      break;
    case '0':
      console.log('❌ Edit cancelled');
      return;
    default:
      console.log('❌ Invalid choice');
      return;
  }

  if (Object.keys(updates).length === 0) {
    console.log('❌ No changes made');
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('backlog_items')
    .update(updates)
    .eq('id', storyId);

  if (updateError) {
    console.error('❌ Error updating story:', updateError);
    return;
  }

  console.log('✅ Story updated successfully!\n');
}

// 4. ADD A NEW PROJECT
async function addProject(supabaseAdmin) {
  console.log('\n📁 ADD A NEW PROJECT\n');

  const projectName = await question('Enter new project name: ');
  console.log('');

  // Check if project already exists
  const exists = config.projects.some(p => p.name.toLowerCase() === projectName.toLowerCase());
  if (exists) {
    console.log('❌ Project already exists in config');
    return;
  }

  // Get epics
  console.log('Enter epics for this project (one per line, empty line when done):');
  const epics = [];
  let count = 1;
  while (true) {
    const epic = await question(`   ${count}. `);
    if (!epic.trim()) break;
    epics.push(epic);
    count++;
  }

  if (epics.length === 0) {
    epics.push('Foundation'); // Default epic
  }

  console.log(`\n✅ Project "${projectName}" configured with ${epics.length} epics\n`);

  // Now create the first story for this project
  console.log('You must create at least one story for this project to exist in the database.\n');

  const proceed = await question('Create first story now? (y/n): ');
  if (!proceed.toLowerCase().startsWith('y')) {
    console.log('❌ Project creation cancelled (no story created)');
    return;
  }

  // Temporarily add project to config for story creation
  const tempProject = { name: projectName, epics };
  config.projects.push(tempProject);

  console.log('\n📝 Creating first story for this project...\n');

  // Use the addStory function but pre-select this project
  const userStory = await question('User story: ');
  console.log('');

  const storyId = await getNextId(supabaseAdmin);
  const displayOrder = 0; // First story in project

  const newStory = {
    id: storyId,
    project: projectName,
    epic: epics[0],
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    user_story: userStory,
    acceptance_criteria: ['Project baseline established'],
    effort: 1,
    business_value: 5,
    dependencies: [],
    technical_notes: 'Initial project setup story',
    assigned_to: null,
    is_next: false,
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
    config.projects.pop(); // Remove temporary project
    return;
  }

  console.log(`✅ Project "${projectName}" created successfully with story #${data.id}!\n`);
  console.log('⚠️  Note: Add this project to your .bubbleup-config.json to persist it:\n');
  console.log(JSON.stringify(tempProject, null, 2));
  console.log('');
}

// 5. VIEW/SEARCH STORIES
async function viewStories(supabaseAdmin) {
  console.log('\n🔍 VIEW/SEARCH STORIES\n');

  console.log('Filter by:');
  console.log('   1. Project');
  console.log('   2. Status');
  console.log('   3. Priority');
  console.log('   4. Story ID');
  console.log('   5. List all');

  const choice = await question('\n   Your choice: ');

  let query = supabaseAdmin.from('backlog_items').select('*');

  switch (choice) {
    case '1':
      console.log('\nProjects:');
      config.projects.forEach((p, idx) => console.log(`   ${idx + 1}. ${p.name}`));
      const pChoice = await question('\nYour choice: ');
      const project = config.projects[parseInt(pChoice) - 1];
      if (project) query = query.eq('project', project.name);
      break;
    case '2':
      console.log('\nStatus:');
      config.statuses.forEach((s, idx) => console.log(`   ${idx + 1}. ${s}`));
      const sChoice = await question('\nYour choice: ');
      const status = config.statuses[parseInt(sChoice) - 1];
      if (status) query = query.eq('status', status);
      break;
    case '3':
      console.log('\nPriority:');
      config.priorities.forEach((p, idx) => console.log(`   ${idx + 1}. ${p}`));
      const prChoice = await question('\nYour choice: ');
      const priority = config.priorities[parseInt(prChoice) - 1];
      if (priority) query = query.eq('priority', priority);
      break;
    case '4':
      const storyId = await question('\nStory ID: ');
      query = query.eq('id', storyId);
      break;
    case '5':
      // List all
      break;
    default:
      console.log('❌ Invalid choice');
      return;
  }

  query = query.order('project').order('display_order');

  const { data: stories, error } = await query;

  if (error) {
    console.error('❌ Error fetching stories:', error);
    return;
  }

  if (!stories || stories.length === 0) {
    console.log('\n📭 No stories found\n');
    return;
  }

  console.log(`\n📋 Found ${stories.length} stories:\n`);
  console.log('═══════════════════════════════════════════════════════════════');

  stories.forEach(story => {
    console.log(`\n📝 Story #${story.id} - ${story.project}`);
    console.log(`   Status: ${story.status} | Priority: ${story.priority} | Epic: ${story.epic}`);
    console.log(`   ${story.user_story}`);
    console.log('─'.repeat(63));
  });

  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

// 6. CHANGE STATUS
async function changeStatus(supabaseAdmin) {
  console.log('\n📊 CHANGE STORY STATUS\n');

  const storyId = await question('Enter story ID: ');

  // Fetch the story
  const { data: story, error: fetchError } = await supabaseAdmin
    .from('backlog_items')
    .select('*')
    .eq('id', storyId)
    .single();

  if (fetchError || !story) {
    console.log('❌ Story not found');
    return;
  }

  console.log(`\n📝 Story: ${story.user_story}`);
  console.log(`   Current Status: ${story.status}\n`);

  console.log('New Status:');
  config.statuses.forEach((s, idx) => {
    console.log(`   ${idx + 1}. ${s}${s === story.status ? ' (current)' : ''}`);
  });

  const choice = await question('\n   Your choice: ');
  const newStatus = config.statuses[parseInt(choice) - 1];

  if (!newStatus) {
    console.log('❌ Invalid choice');
    return;
  }

  if (newStatus === story.status) {
    console.log('⚠️  Status unchanged');
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('backlog_items')
    .update({ status: newStatus })
    .eq('id', storyId);

  if (updateError) {
    console.error('❌ Error updating status:', updateError);
    return;
  }

  console.log(`✅ Status changed from ${story.status} to ${newStatus}\n`);
}

// 7. REASSIGN STORY
async function reassignStory(supabaseAdmin) {
  console.log('\n👥 REASSIGN STORY\n');

  const storyId = await question('Enter story ID: ');

  // Fetch the story
  const { data: story, error: fetchError } = await supabaseAdmin
    .from('backlog_items')
    .select('*')
    .eq('id', storyId)
    .single();

  if (fetchError || !story) {
    console.log('❌ Story not found');
    return;
  }

  console.log(`\n📝 Story: ${story.user_story}`);
  console.log(`   Currently assigned to: ${story.assigned_to || 'Unassigned'}\n`);

  const assignInput = await question('Assign to (name/email or "unassigned"): ');

  let newAssignee = null;
  if (assignInput.toLowerCase() !== 'unassigned' && assignInput.trim()) {
    const user = findUser(assignInput);
    if (user) {
      newAssignee = user.uuid;
      console.log(`   ✅ Will assign to: ${user.name}`);
    } else {
      console.log('   ❌ User not found');
      return;
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from('backlog_items')
    .update({ assigned_to: newAssignee })
    .eq('id', storyId);

  if (updateError) {
    console.error('❌ Error reassigning story:', updateError);
    return;
  }

  console.log('✅ Story reassigned successfully!\n');
}

// 8. UPDATE PRIORITY/EFFORT
async function updatePriorityEffort(supabaseAdmin) {
  console.log('\n⚡ UPDATE PRIORITY/EFFORT\n');

  const storyId = await question('Enter story ID: ');

  // Fetch the story
  const { data: story, error: fetchError } = await supabaseAdmin
    .from('backlog_items')
    .select('*')
    .eq('id', storyId)
    .single();

  if (fetchError || !story) {
    console.log('❌ Story not found');
    return;
  }

  console.log(`\n📝 Story: ${story.user_story}`);
  console.log(`   Current Priority: ${story.priority}`);
  console.log(`   Current Effort: ${story.effort} points\n`);

  console.log('What would you like to update?');
  console.log('   1. Priority');
  console.log('   2. Effort');
  console.log('   3. Both');

  const choice = await question('\n   Your choice: ');

  const updates = {};

  if (choice === '1' || choice === '3') {
    console.log('\nPriority:');
    config.priorities.forEach((p, idx) => console.log(`   ${idx + 1}. ${p}`));
    const pChoice = await question('\nYour choice: ');
    updates.priority = config.priorities[parseInt(pChoice) - 1];
  }

  if (choice === '2' || choice === '3') {
    console.log('\nEffort:');
    config.effortPoints.forEach((e, idx) => console.log(`   ${idx + 1}. ${e} points`));
    const eChoice = await question('\nYour choice: ');
    updates.effort = config.effortPoints[parseInt(eChoice) - 1];
  }

  if (Object.keys(updates).length === 0) {
    console.log('❌ No changes made');
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('backlog_items')
    .update(updates)
    .eq('id', storyId);

  if (updateError) {
    console.error('❌ Error updating story:', updateError);
    return;
  }

  console.log('✅ Story updated successfully!\n');
}

// 9. MARK AS "NEXT UP"
async function toggleNextUp(supabaseAdmin) {
  console.log('\n⭐ MARK AS "NEXT UP"\n');

  const storyId = await question('Enter story ID: ');

  // Fetch the story
  const { data: story, error: fetchError } = await supabaseAdmin
    .from('backlog_items')
    .select('*')
    .eq('id', storyId)
    .single();

  if (fetchError || !story) {
    console.log('❌ Story not found');
    return;
  }

  console.log(`\n📝 Story: ${story.user_story}`);
  console.log(`   Currently marked as "Next up": ${story.is_next ? 'Yes' : 'No'}\n`);

  const newValue = !story.is_next;

  const { error: updateError } = await supabaseAdmin
    .from('backlog_items')
    .update({ is_next: newValue })
    .eq('id', storyId);

  if (updateError) {
    console.error('❌ Error updating story:', updateError);
    return;
  }

  console.log(`✅ Story ${newValue ? 'marked' : 'unmarked'} as "Next up"\n`);
}

// 10. VIEW PROJECT STATS
async function viewProjectStats(supabaseAdmin) {
  console.log('\n📈 PROJECT STATISTICS\n');

  console.log('Select a project:');
  config.projects.forEach((p, idx) => {
    console.log(`   ${idx + 1}. ${p.name}`);
  });
  console.log(`   ${config.projects.length + 1}. All projects`);

  const choice = await question('\n   Your choice: ');
  const projectIndex = parseInt(choice) - 1;

  let query = supabaseAdmin.from('backlog_items').select('*');

  if (projectIndex >= 0 && projectIndex < config.projects.length) {
    const selectedProject = config.projects[projectIndex];
    query = query.eq('project', selectedProject.name);
  }

  const { data: stories, error } = await query;

  if (error) {
    console.error('❌ Error fetching stats:', error);
    return;
  }

  if (!stories || stories.length === 0) {
    console.log('\n📭 No stories found\n');
    return;
  }

  // Calculate stats
  const stats = {
    total: stories.length,
    byStatus: {},
    byPriority: {},
    byEpic: {},
    avgEffort: 0,
    avgBusinessValue: 0,
    nextUp: 0
  };

  stories.forEach(story => {
    stats.byStatus[story.status] = (stats.byStatus[story.status] || 0) + 1;
    stats.byPriority[story.priority] = (stats.byPriority[story.priority] || 0) + 1;
    stats.byEpic[story.epic] = (stats.byEpic[story.epic] || 0) + 1;
    stats.avgEffort += story.effort;
    stats.avgBusinessValue += story.business_value;
    if (story.is_next) stats.nextUp++;
  });

  stats.avgEffort = (stats.avgEffort / stats.total).toFixed(1);
  stats.avgBusinessValue = (stats.avgBusinessValue / stats.total).toFixed(1);

  // Display stats
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 BACKLOG STATISTICS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`Total Stories: ${stats.total}`);
  console.log(`Average Effort: ${stats.avgEffort} points`);
  console.log(`Average Business Value: ${stats.avgBusinessValue}/10`);
  console.log(`Marked as "Next up": ${stats.nextUp}`);

  console.log('\n📊 By Status:');
  Object.entries(stats.byStatus).forEach(([status, count]) => {
    const pct = ((count / stats.total) * 100).toFixed(1);
    console.log(`   ${status}: ${count} (${pct}%)`);
  });

  console.log('\n🔥 By Priority:');
  Object.entries(stats.byPriority).forEach(([priority, count]) => {
    const pct = ((count / stats.total) * 100).toFixed(1);
    console.log(`   ${priority}: ${count} (${pct}%)`);
  });

  console.log('\n🎭 By Epic:');
  Object.entries(stats.byEpic).forEach(([epic, count]) => {
    const pct = ((count / stats.total) * 100).toFixed(1);
    console.log(`   ${epic}: ${count} (${pct}%)`);
  });

  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

// MAIN MENU
async function mainMenu() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                   🎯 BubbleUp Manager                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(`\n👤 User: ${config.currentUser.name} (${config.currentUser.email})\n`);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                      📋 CORE FEATURES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('   1. ➕ Add a story');
  console.log('   2. ❌ Delete a story');
  console.log('   3. ✏️  Edit a story');
  console.log('   4. 📁 Add a new project');
  console.log('   5. 🔍 View/search stories');
  console.log('   6. 📊 Change status');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                   ⚡ ADDITIONAL FEATURES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('   7. 👥 Reassign story');
  console.log('   8. ⚡ Update priority/effort');
  console.log('   9. ⭐ Mark as "Next up"');
  console.log('  10. 📈 View project stats');

  console.log('\n═══════════════════════════════════════════════════════════════\n');
  console.log('   0. 🚪 Exit');

  const choice = await question('\n   Your choice: ');

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  switch (choice) {
    case '1':
      await addStory(supabaseAdmin);
      break;
    case '2':
      await deleteStory(supabaseAdmin);
      break;
    case '3':
      await editStory(supabaseAdmin);
      break;
    case '4':
      await addProject(supabaseAdmin);
      break;
    case '5':
      await viewStories(supabaseAdmin);
      break;
    case '6':
      await changeStatus(supabaseAdmin);
      break;
    case '7':
      await reassignStory(supabaseAdmin);
      break;
    case '8':
      await updatePriorityEffort(supabaseAdmin);
      break;
    case '9':
      await toggleNextUp(supabaseAdmin);
      break;
    case '10':
      await viewProjectStats(supabaseAdmin);
      break;
    case '0':
      console.log('\n👋 Goodbye!\n');
      rl.close();
      return false;
    default:
      console.log('\n❌ Invalid choice\n');
  }

  return true;
}

// RUN THE APP
async function run() {
  try {
    let continueRunning = true;
    while (continueRunning) {
      continueRunning = await mainMenu();
    }
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    rl.close();
  }
}

run();
