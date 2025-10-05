#!/usr/bin/env node
/**
 * BubbleUp Manager - User Setup Script
 *
 * This script helps new users set up the /bubble command on their machine.
 * Run with: node setup-bubble-user.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         🎯 BubbleUp Manager - User Setup Wizard             ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log('This wizard will help you set up the /bubble command.\n');

  // Step 1: Get user details
  console.log('📝 STEP 1: User Information\n');

  const name = await question('Your full name: ');
  const firstName = name.split(' ')[0];
  const lastName = name.split(' ').slice(1).join(' ') || firstName;
  const email = await question('Your email (e.g., name@regulativ.ai): ');
  const uuid = await question('Your Supabase UUID (ask Mark if you don\'t have it): ');

  console.log('\nEnter aliases (shortcuts for your name when assigning stories):');
  console.log('Example: me, myself, john, j');
  const aliasesInput = await question('Aliases (comma-separated): ');
  const aliases = aliasesInput.split(',').map(a => a.trim()).filter(Boolean);
  if (!aliases.includes('me')) aliases.unshift('me');

  console.log('');

  // Step 2: Determine paths
  const homeDir = os.homedir();
  const desktopDir = path.join(homeDir, 'OneDrive', 'Desktop');
  const projectDir = __dirname;
  const claudeCommandsDir = path.join(homeDir, '.claude', 'commands');

  console.log('📂 STEP 2: Configuration Paths\n');
  console.log(`Home directory: ${homeDir}`);
  console.log(`Desktop directory: ${desktopDir}`);
  console.log(`Project directory: ${projectDir}`);
  console.log('');

  // Step 3: Create user config
  console.log('🔧 STEP 3: Creating Configuration\n');

  // Load existing config to get the full project list
  let baseConfig;
  try {
    const configPath = path.join(projectDir, '.bubbleup-config.json');
    baseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error('❌ Error reading base config:', err.message);
    console.log('Creating new config from scratch...');
    baseConfig = {
      projects: [],
      priorities: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      statuses: ["NOT_STARTED", "IN_PROGRESS", "TESTING", "BLOCKED", "DONE"],
      effortPoints: [1, 2, 3, 5, 8, 13]
    };
  }

  const userConfig = {
    currentUser: {
      name,
      email,
      uuid,
      role: "Admin"
    },
    users: [
      {
        name: "Mark Weston",
        firstName: "Mark",
        lastName: "Weston",
        email: "mark.weston@regulativ.ai",
        alternateEmails: ["mark.x.weston@gmail.com"],
        uuid: "88c48796-c1a2-471d-808d-8f72f38d8359",
        aliases: ["Mark", "mark", "MW"]
      },
      {
        name: "Jinal Shah",
        firstName: "Jinal",
        lastName: "Shah",
        email: "jinal.shah@regulativ.ai",
        alternateEmails: [],
        uuid: "9e09e6b9-fa9d-4cb9-8583-22cbb50e55b5",
        aliases: ["Jinal", "jinal", "JS"]
      },
      {
        name,
        firstName,
        lastName,
        email,
        alternateEmails: [],
        uuid,
        aliases
      }
    ],
    projects: baseConfig.projects,
    priorities: baseConfig.priorities,
    statuses: baseConfig.statuses,
    effortPoints: baseConfig.effortPoints
  };

  // Step 4: Write config files
  console.log('💾 STEP 4: Writing Configuration Files\n');

  const configLocations = [
    path.join(projectDir, '.bubbleup-config.json'),
    path.join(desktopDir, '.bubbleup-config.json'),
    path.join(homeDir, '.bubbleup-config.json')
  ];

  let successCount = 0;
  for (const location of configLocations) {
    try {
      // Create directory if needed
      const dir = path.dirname(location);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(location, JSON.stringify(userConfig, null, 2));
      console.log(`   ✅ Created: ${location}`);
      successCount++;
    } catch (err) {
      console.log(`   ⚠️  Failed: ${location} (${err.message})`);
    }
  }

  if (successCount === 0) {
    console.log('\n❌ Failed to create config files. Please create manually.');
    rl.close();
    return;
  }

  console.log('');

  // Step 5: Set up Claude slash command
  console.log('⚡ STEP 5: Setting Up /bubble Slash Command\n');

  try {
    // Create .claude/commands directory if it doesn't exist
    if (!fs.existsSync(claudeCommandsDir)) {
      fs.mkdirSync(claudeCommandsDir, { recursive: true });
      console.log(`   ✅ Created directory: ${claudeCommandsDir}`);
    }

    // Create bubble.md command file
    const commandFile = path.join(claudeCommandsDir, 'bubble.md');
    const commandContent = `---
description: Create a new user story in BubbleUp with interactive prompts
allowed-tools: Bash(node:*), Bash(cd:*)
---

Run the interactive BubbleUp story creator: cd ${projectDir.replace(/\\/g, '\\\\')} && node bubble-story-creator.js

This will guide you through creating a user story with:
- Project selection
- User assignment
- Epic selection
- User story text
- Acceptance criteria
- Priority, effort, business value
- Technical notes and dependencies
- Sequential ID generation
`;

    fs.writeFileSync(commandFile, commandContent);
    console.log(`   ✅ Created: ${commandFile}`);
  } catch (err) {
    console.log(`   ⚠️  Failed to create slash command: ${err.message}`);
    console.log('   You can create it manually later.');
  }

  console.log('');

  // Step 6: Check .env.local
  console.log('🔐 STEP 6: Checking Environment Variables\n');

  const envPath = path.join(projectDir, '.env.local');
  if (fs.existsSync(envPath)) {
    console.log('   ✅ .env.local exists');
  } else {
    console.log('   ⚠️  .env.local NOT FOUND!');
    console.log('');
    console.log('   You need to create .env.local in the project root:');
    console.log(`   ${envPath}`);
    console.log('');
    console.log('   With contents:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://bzqgoppjuynxfyrrhsbg.supabase.co');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=<ask-mark-for-this-key>');
  }

  console.log('');

  // Summary
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ SETUP COMPLETE!                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log('📋 Next Steps:\n');
  console.log('   1. Restart Claude Code to load the /bubble command');
  console.log('   2. Test the setup by running:');
  console.log(`      node ${path.join(projectDir, 'bubble-story-creator.js')}`);
  console.log('   3. Or type /bubble in Claude Code');
  console.log('');
  console.log('📚 For detailed usage, see: BUBBLE_COMMAND_SETUP.md');
  console.log('');
  console.log('🎯 Your Configuration:');
  console.log(`   Name: ${name}`);
  console.log(`   Email: ${email}`);
  console.log(`   UUID: ${uuid}`);
  console.log(`   Aliases: ${aliases.join(', ')}`);
  console.log('');

  rl.close();
}

// Run the setup
setup().catch(err => {
  console.error('\n❌ Setup failed:', err.message);
  rl.close();
  process.exit(1);
});
