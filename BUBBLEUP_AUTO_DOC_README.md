# BubbleUp Automatic Documentation Capture

## Overview

This system automatically captures valuable development insights from Claude's responses and stores them in BubbleUp documentation.

## How It Works

### 1. **Pattern Recognition**
The agent monitors Claude's responses for trigger phrases like:
- "Design decision:"
- "Implemented..."
- "Next steps:"
- "✅ Completed"
- "Fixed bug:"
- etc.

### 2. **Story ID Extraction**
Automatically finds story references like:
- `#208`
- `story 208`
- `Story #208`
- Plain numbers in context

### 3. **Content Classification**
Classifies content into 11 document types:
- `design` - Design decisions and architecture
- `plan` - Implementation plans
- `progress` - Development progress updates
- `next_steps` - What needs to be done next
- `testing` - Test results and coverage
- `success` - Completed work
- `error` - Bugs and issues
- `decision_log` - Trade-offs and rationale
- `technical_note` - Important technical notes
- `requirements` - Requirements clarifications
- `feedback` - Recommendations and suggestions

### 4. **Automatic Logging**
Posts extracted content to `/api/documentation` with:
- Auto-generated title
- Extracted tags
- Proper document type
- Story ID linkage

---

## Usage

### **Manual Mode** (Immediate Use)

When you want to log something Claude said:

```bash
node bubbleup-doc-capture-agent.js "Claude's response text here"
```

**Example:**
```bash
node bubbleup-doc-capture-agent.js "Design decision: For story #208, chose pattern matching over regex for better flexibility and accuracy."
```

### **Pipe Mode** (From File or Command)

```bash
echo "Completed implementing #208 documentation capture" | node bubbleup-doc-capture-agent.js
```

Or from a file:
```bash
cat response.txt | node bubbleup-doc-capture-agent.js
```

---

## Configuration

Edit `bubbleup-doc-capture-config.json` to customize:

### **Enable/Disable**
```json
{
  "enabled": true
}
```

### **Add Trigger Phrases**
```json
{
  "triggers": {
    "design": {
      "patterns": [
        "Design decision:",
        "Architectural choice:",
        "Your custom phrase here"
      ]
    }
  }
}
```

### **Adjust Story ID Patterns**
```json
{
  "story_id_patterns": [
    "#(\\d{3})",           // Matches #208
    "story (\\d{3})",      // Matches "story 208"
    "custom pattern here"
  ]
}
```

### **Content Extraction**
```json
{
  "extraction": {
    "max_content_length": 2000,           // Max chars to store
    "include_code_blocks": true,          // Include ```code blocks```
    "include_lists": true,                // Include bullet lists
    "exclude_conversational_fluff": true  // Remove "Let me", "Sure!", etc.
  }
}
```

---

## Integration with Your Workflow

### **Option 1: Manual Reminders**
After important conversations, you remind Claude:
> "Claude, log this session's insights for story #208"

Claude can then call the agent programmatically.

### **Option 2: End-of-Session Batch**
At the end of a work session:
> "Claude, review our conversation and log all documentation-worthy content"

Claude will analyze the full conversation and extract all insights.

### **Option 3: Real-Time Monitoring** (Future)
A wrapper script monitors Claude Code output in real-time and automatically pipes responses through the agent.

---

## Testing

Test the agent with sample responses:

```bash
# Test design decision
node bubbleup-doc-capture-agent.js "Design decision: For #208, chose PostgreSQL ENUM for type safety"

# Test progress update
node bubbleup-doc-capture-agent.js "Implemented documentation capture for story #208. All tests passing ✅"

# Test next steps
node bubbleup-doc-capture-agent.js "Next steps for #208: Add real-time monitoring, improve pattern matching, deploy to production"
```

Check BubbleUp (http://localhost:3000) - click the 📄 icon next to story #208 to see captured documentation!

---

## Logs

View activity in `bubbleup-doc-capture.log`:

```bash
tail -f bubbleup-doc-capture.log
```

Or disable logging in config:
```json
{
  "logging": {
    "verbose": false,
    "log_file": null
  }
}
```

---

## Troubleshooting

### **No documentation captured**
- Check that story ID is mentioned (e.g., "#208" or "story 208")
- Verify trigger phrases match patterns in config
- Enable verbose logging to see what's being detected

### **Wrong document type detected**
- Add more specific trigger phrases to config
- Adjust patterns to be more precise
- Check logs to see which patterns matched

### **Content too short**
- Minimum 50 characters required
- Provide more context in the response

---

## Advanced: Real-Time Monitoring

To monitor Claude's responses in real-time, create a wrapper script that:

1. Intercepts Claude Code stdout
2. Pipes each response through the agent
3. Logs results asynchronously

Example wrapper (future enhancement):
```bash
# claude-with-auto-doc.sh
claude "$@" 2>&1 | tee >(node bubbleup-doc-capture-agent.js)
```

---

## API

The agent posts to `POST /api/documentation` with:

```json
{
  "story_id": "208",
  "doc_type": "design",
  "title": "Design decision: Pattern matching over regex",
  "content": "Full extracted content here...",
  "author": "Claude (Auto-captured)",
  "tags": ["api", "design", "pattern-matching"],
  "category": "auto-captured",
  "priority": "medium",
  "metadata": {
    "auto_captured": true,
    "captured_at": "2025-10-07T15:46:47.000Z",
    "confidence": "high"
  }
}
```

---

## Next Steps

1. ✅ Test with real conversations
2. ⏳ Fine-tune trigger phrases based on your workflow
3. ⏳ Build real-time monitoring wrapper
4. ⏳ Add AI-powered content summarization
5. ⏳ Implement learning mechanism to improve over time

---

## Support

Story #208 in BubbleUp tracks this feature's development.

For issues, check:
- Configuration in `bubbleup-doc-capture-config.json`
- Logs in `bubbleup-doc-capture.log`
- API endpoint at `http://localhost:3000/api/documentation`
