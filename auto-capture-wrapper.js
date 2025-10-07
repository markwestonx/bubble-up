#!/usr/bin/env node

/**
 * Automatic Documentation Capture Wrapper
 *
 * This script runs AFTER Claude's response is complete and automatically
 * captures ALL information to BubbleUp documentation with 100% coverage.
 *
 * Usage:
 *   1. Save Claude's response to a temp file
 *   2. Run: node auto-capture-wrapper.js <response-file> [story-id]
 *   3. If story-id is provided, it overrides auto-detection
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load the documentation capture agent
const captureAgent = require('./bubbleup-doc-capture-agent.js');

async function main() {
  if (process.argv.length < 3) {
    console.error('Usage: node auto-capture-wrapper.js <response-file> [story-id]');
    process.exit(1);
  }

  const responseFile = process.argv[2];
  const forcedStoryId = process.argv[3];

  if (!fs.existsSync(responseFile)) {
    console.error(`Error: File not found: ${responseFile}`);
    process.exit(1);
  }

  const responseText = fs.readFileSync(responseFile, 'utf8');

  console.log('\n📝 Auto-capture wrapper starting...');
  console.log(`   Response length: ${responseText.length} characters`);

  // If story ID is forced, inject it into the text for extraction
  let processText = responseText;
  if (forcedStoryId) {
    console.log(`   Forced story ID: #${forcedStoryId}`);
    processText = `Story #${forcedStoryId}\n\n${responseText}`;
  }

  // Process the response through the capture agent
  try {
    await captureAgent.processResponse(processText);
    console.log('✅ Auto-capture complete\n');
  } catch (err) {
    console.error(`❌ Auto-capture failed: ${err.message}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
