#!/usr/bin/env node

/**
 * BubbleUp Documentation Capture Agent
 *
 * Monitors Claude's responses and automatically extracts documentation-worthy
 * content, then posts it to the BubbleUp documentation API.
 *
 * Usage:
 *   node bubbleup-doc-capture-agent.js <response-text>
 *   or pipe responses: echo "..." | node bubbleup-doc-capture-agent.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Load configuration
const configPath = path.join(__dirname, 'bubbleup-doc-capture-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Logging utility
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;

  if (config.logging.verbose) {
    console.error(logMessage); // Use stderr to not interfere with stdout
  }

  if (config.logging.log_file) {
    fs.appendFileSync(config.logging.log_file, logMessage + '\n');
  }
}

// Extract story IDs from text
function extractStoryIds(text) {
  const storyIds = new Set();

  for (const pattern of config.story_id_patterns) {
    const regex = new RegExp(pattern, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const id = match[1].padStart(3, '0');
      storyIds.add(id);
    }
  }

  return Array.from(storyIds);
}

// Detect document type based on trigger patterns
function detectDocType(text) {
  const scores = {};

  for (const [docType, triggerConfig] of Object.entries(config.triggers)) {
    let matchCount = 0;
    for (const pattern of triggerConfig.patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(text)) {
        matchCount++;
      }
    }

    // If at least one pattern matches, consider it detected
    // Score is based on number of matches
    if (matchCount > 0) {
      scores[docType] = matchCount;
    }
  }

  // Return doc type with highest confidence
  if (Object.keys(scores).length === 0) return null;

  return Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0][0];
}

// Extract meaningful content (remove conversational fluff)
function extractContent(text, maxLength = config.extraction.max_content_length) {
  let content = text;

  if (config.extraction.exclude_conversational_fluff) {
    // Remove common conversational phrases
    const fluff = [
      'Let me',
      'I\'ll',
      'Sure!',
      'Great question!',
      'Excellent!',
      'Perfect!',
      'Now let\'s'
    ];

    // Split into sentences
    const sentences = content.split(/\. |\n\n/);
    const meaningful = sentences.filter(s => {
      const trimmed = s.trim();
      // Keep sentences that don't start with conversational fluff
      return trimmed.length > 20 && !fluff.some(f => trimmed.startsWith(f));
    });

    content = meaningful.join('. ');
  }

  // Truncate if too long
  if (content.length > maxLength) {
    content = content.substring(0, maxLength) + '...';
  }

  return content.trim();
}

// Extract title from content (first line or first sentence)
function extractTitle(text, docType) {
  // Look for lines starting with trigger patterns
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 10 && trimmed.length < 150) {
      // Check if it's a header-like line
      if (trimmed.match(/^#+\s/) || trimmed.endsWith(':')) {
        return trimmed.replace(/^#+\s/, '').replace(/:$/, '');
      }
    }
  }

  // Fall back to first sentence
  const firstSentence = text.split(/\. |\n/)[0].trim();
  if (firstSentence.length > 10 && firstSentence.length < 150) {
    return firstSentence;
  }

  // Generate generic title
  return `${docType.replace('_', ' ')} update`;
}

// Extract tags from content
function extractTags(text) {
  const tags = new Set();

  // Common technical terms
  const techTerms = [
    'api', 'database', 'frontend', 'backend', 'ui', 'ux', 'design',
    'testing', 'bug', 'feature', 'migration', 'schema', 'endpoint',
    'authentication', 'authorization', 'security', 'performance',
    'typescript', 'javascript', 'react', 'node', 'supabase', 'postgres'
  ];

  const lowerText = text.toLowerCase();
  for (const term of techTerms) {
    if (lowerText.includes(term)) {
      tags.add(term);
    }
  }

  // Limit to top 5 tags
  return Array.from(tags).slice(0, 5);
}

// Create documentation entry
async function createDocumentation(storyId, docType, content, originalText) {
  const title = extractTitle(originalText, docType);
  const tags = extractTags(originalText);

  log(`Creating documentation for story #${storyId} (${docType}): ${title}`);

  try {
    const { data, error } = await supabase
      .from('documentation')
      .insert({
        story_id: storyId,
        doc_type: docType,
        title,
        content,
        author: 'Claude (Auto-captured)',
        tags,
        links: [],
        related_stories: [],
        category: 'auto-captured',
        priority: 'medium',
        metadata: {
          auto_captured: true,
          captured_at: new Date().toISOString(),
          confidence: 'high'
        }
      })
      .select()
      .single();

    if (error) {
      log(`Error creating documentation: ${error.message}`, 'ERROR');
      return null;
    }

    log(`✅ Documentation created: ${data.id}`, 'SUCCESS');
    return data;
  } catch (err) {
    log(`Exception creating documentation: ${err.message}`, 'ERROR');
    return null;
  }
}

// Main processing function
async function processResponse(responseText) {
  if (!config.enabled) {
    log('Documentation capture is disabled');
    return;
  }

  log(`Processing response (${responseText.length} characters)`);

  // Extract story IDs
  const storyIds = extractStoryIds(responseText);
  if (storyIds.length === 0) {
    log('No story IDs found in response');
    return;
  }

  log(`Found story IDs: ${storyIds.join(', ')}`);

  // Detect document type
  const docType = detectDocType(responseText);
  if (!docType) {
    log('No matching document type detected');
    return;
  }

  log(`Detected document type: ${docType}`);

  // Extract meaningful content
  const content = extractContent(responseText);
  if (content.length < 50) {
    log('Content too short to be meaningful');
    return;
  }

  // Create documentation for each story ID
  for (const storyId of storyIds) {
    await createDocumentation(storyId, docType, content, responseText);
  }
}

// Main entry point
async function main() {
  let inputText = '';

  // Check if text is provided as argument
  if (process.argv.length > 2) {
    inputText = process.argv.slice(2).join(' ');
  } else if (!process.stdin.isTTY) {
    // Read from stdin (piped input)
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    inputText = Buffer.concat(chunks).toString('utf8');
  } else {
    console.error('Usage: node bubbleup-doc-capture-agent.js <response-text>');
    console.error('   or: echo "..." | node bubbleup-doc-capture-agent.js');
    process.exit(1);
  }

  await processResponse(inputText);
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    log(`Fatal error: ${err.message}`, 'FATAL');
    process.exit(1);
  });
}

// Export for testing
module.exports = {
  extractStoryIds,
  detectDocType,
  extractContent,
  extractTitle,
  extractTags,
  processResponse
};
