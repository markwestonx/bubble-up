# BubbleUp Session Context & Continuity
*Last Updated: 2025-10-07*
*Purpose: Complete context preservation for Claude Code sessions*

---

## 🚨 CRITICAL: READ THIS FIRST

### Session Start Protocol
1. **Read this file completely** before starting work
2. **Check backlog status**: Run query to see current story statuses
3. **Update stories to DONE immediately** after completing them (don't batch updates!)
4. **Update this file** at end of session with new learnings

### Key Learning: ALWAYS UPDATE BACKLOG STATUS
- ✅ **DO**: Mark stories as DONE immediately after completing implementation
- ❌ **DON'T**: Batch status updates at end of session
- ❌ **DON'T**: Assume status is updated automatically
- **Command to update**:
```bash
node -e "const { createClient } = require('@supabase/supabase-js'); require('dotenv').config({ path: '.env.local' }); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { await supabase.from('backlog_items').update({ status: 'DONE', updated_at: new Date().toISOString() }).eq('id', 'STORY_ID'); })();"
```

---

## 📁 PROJECT OVERVIEW

### What is BubbleUp?
- **Purpose**: Agile backlog management tool with AI-powered documentation capture
- **Stack**: Next.js 15.5.4, Supabase (PostgreSQL), TypeScript
- **Running on**: http://localhost:3000
- **Key Innovation**: Automatic documentation capture from Claude's responses

### Current Status (2025-10-07)
- **Total Stories**: 34
- **Completed**: 16 (47%)
- **Remaining**: 18 (53%)
- **Current Focus**: Documentation system (Stories 195-208)

---

## 🎯 MAJOR FEATURES COMPLETED

### 1. Documentation Capture System (Stories 195, 197, 198, 201, 208)
**Revolutionary AI-powered documentation system**

#### What Was Built:
1. **Database Schema** (`migrations/add-documentation-system.sql`)
   - 13 document types: design, plan, progress, next_steps, testing, requirements, feedback, build_log, test_result, decision_log, technical_note, error, success
   - Versioning support (parent_doc_id, version_number, is_latest)
   - Cross-story linking (related_stories array)
   - RLS policies for security
   - Helper functions (get_documentation_summary, get_related_documentation)

2. **API Endpoints** (`app/api/documentation/route.ts`)
   - POST /api/documentation - Create documentation entries
   - GET /api/documentation?story_id=XXX - Retrieve documentation
   - PATCH /api/documentation - Update (creates new version)
   - Full RBAC integration (canCreate, canEdit permissions)

3. **UI Modal** (`components/DocumentationModal.tsx`)
   - Click 📄 icon next to any story ID
   - Filter by document type with color-coded tabs
   - Expandable entries with tags, links, related stories
   - Version indicators
   - Beautiful Lucide React icons for each doc type

4. **API Documentation** (`CLAUDE_API_GUIDE.md`)
   - Complete curl examples
   - Authentication methods
   - Use cases and best practices

5. **Intelligent Capture Agent** (`bubbleup-doc-capture-agent.js`)
   - **Pattern Recognition**: Automatically detects documentation-worthy content
   - **Story ID Extraction**: Finds #208, "story 208", etc. in text
   - **Document Type Classification**: 11 types with configurable trigger phrases
   - **Content Extraction**: Removes conversational fluff, extracts meaningful content
   - **Title & Tag Generation**: Auto-generates titles and technical tags
   - **Automatic API Posting**: Posts to Supabase documentation table

6. **Configuration** (`bubbleup-doc-capture-config.json`)
   - Customizable trigger patterns for each doc type
   - Story ID extraction patterns
   - Content extraction settings (max length, fluff removal)
   - Logging configuration

7. **Usage Guide** (`BUBBLEUP_AUTO_DOC_README.md`)
   - Manual mode: `node bubbleup-doc-capture-agent.js "text"`
   - Pipe mode: `echo "text" | node bubbleup-doc-capture-agent.js`
   - Testing examples
   - Troubleshooting guide

8. **100% Capture System** (`auto-capture-wrapper.js`, `CAPTURE_INTEGRATION_GUIDE.md`)
   - Multi-layer capture system (real-time + end-of-response + batch)
   - Wrapper for guaranteed 100% documentation capture
   - Integration options (hooks, manual, batch)

#### How It Works:
```
Claude's Response → Pattern Recognition → Story ID Extraction →
Doc Type Detection → Content Extraction → Auto-Post to Supabase →
User Notification: "📝 Captured to BubbleUp: [description]"
```

#### Files Created/Modified:
- `migrations/add-documentation-system.sql` (NEW)
- `app/api/documentation/route.ts` (NEW)
- `components/DocumentationModal.tsx` (NEW)
- `CLAUDE_API_GUIDE.md` (NEW)
- `bubbleup-doc-capture-agent.js` (NEW)
- `bubbleup-doc-capture-config.json` (NEW)
- `BUBBLEUP_AUTO_DOC_README.md` (NEW)
- `auto-capture-wrapper.js` (NEW)
- `CAPTURE_INTEGRATION_GUIDE.md` (NEW)
- `app/page.tsx` (MODIFIED - added 📄 FileText icon next to story IDs)

### 2. User Management & RBAC (Stories 120, 121, plus earlier work)
- Full role-based access control (admin, editor, read_write, read_only)
- Project-level role assignments
- Password reset with email
- Admin page for user management (http://localhost:3000/admin)

### 3. API Integration (Stories 128-132)
- Create/update user stories via API
- Create/update tasks via API
- Update task status/progress via API
- Full CRUD operations for backlog management

### 4. Table Enhancements (Stories 116, 117, 137, 146)
- Dark mode
- Dependencies tooltips showing status
- Assign stories to team members
- Claude integration improvements

### 5. Recent Session Work (Not Tracked in Stories)
- **Project Column Addition**: Shows between ID and Epic (only in "All Projects" view)
- **Sort Override Fix**: Clicking any column header disables custom order mode
- **ID Sorting Fix**: Changed from string to numerical sorting (1, 2, 10 instead of 1, 10, 2)
- **Custom Order Mode**: Drag-and-drop with persistence to database
- **Collapse-All Button**: Collapse all expanded stories at once

---

## 📚 KEY TECHNICAL PATTERNS

### Database Schema (Snake_Case)
```sql
-- Always use snake_case for database columns
acceptance_criteria (NOT acceptanceCriteria)
technical_notes (NOT technicalNotes)
user_story (NOT userStory)
business_value (NOT businessValue)
is_next (NOT isNext)
```

### Updating Story Status
```javascript
// ALWAYS update status immediately after completing a story
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

await supabase
  .from('backlog_items')
  .update({
    status: 'DONE',
    updated_at: new Date().toISOString()
  })
  .eq('id', '195');
```

### Adding Documentation Icon to Stories
```tsx
// In app/page.tsx, add FileText icon next to story ID
import { FileText } from 'lucide-react';

<div className="flex items-center gap-2">
  <span className="text-sm font-mono">{item.id}</span>
  <button
    onClick={(e) => {
      e.stopPropagation();
      setShowDocumentation(true);
    }}
    className="p-1 hover:bg-blue-50 rounded transition-colors"
  >
    <FileText className="h-4 w-4 text-gray-400 hover:text-blue-600" />
  </button>
</div>

{showDocumentation && (
  <DocumentationModal
    isOpen={showDocumentation}
    onClose={() => setShowDocumentation(false)}
    storyId={item.id}
    storyTitle={item.user_story}
  />
)}
```

### Calling Documentation Capture Agent
```bash
# Manual capture
node bubbleup-doc-capture-agent.js "Design decision: For story #208, chose pattern matching for flexibility"

# Pipe capture
echo "Completed implementing #208 documentation capture" | node bubbleup-doc-capture-agent.js

# Test capture
node bubbleup-doc-capture-agent.js "Implemented story #208. All tests passing ✅"
```

### Notifying User of Captures
```javascript
// ALWAYS notify user when documentation is captured
console.log('📝 Captured to BubbleUp: [description of what was captured]');
```

---

## 🔧 COMMON ERRORS & FIXES

### Error 1: Field Naming Mismatch
**Symptom**: `Could not find the 'acceptanceCriteria' column`
**Cause**: Used camelCase instead of snake_case
**Fix**: Always use snake_case for database fields

### Error 2: Variable Naming Conflict
**Symptom**: `Cannot access 'config' before initialization`
**Cause**: Loop variable `config` shadowing global `config`
**Fix**: Rename loop variable (e.g., `triggerConfig`)

### Error 3: String-based ID Sorting
**Symptom**: IDs sort as 1, 10, 2, 20 instead of 1, 2, 10, 20
**Fix**: Use `parseInt(a.id) - parseInt(b.id)` instead of `a.id.localeCompare(b.id)`

### Error 4: Custom Sort Not Overridden
**Symptom**: Clicking column headers doesn't override custom sort
**Fix**: Add `setIsCustomOrder(false)` at start of handleSort function

### Error 5: Pattern Detection Not Triggering
**Symptom**: Documentation not captured even with trigger phrases
**Cause**: Confidence threshold too high
**Fix**: Changed from percentage-based (70%) to count-based (any match = detected)

---

## 📋 REMAINING WORK (18 Stories)

### High Priority
1. **#199** - Teams webhook integration (BLOCKED - need webhook URL from user)
2. **#200** - Teams notification templates
3. **#202** - Claude integration testing
4. **#203** - Pattern recognition tuning
5. **#124** - Audit logs of user activity
6. **#133** - API authentication with RBAC

### Medium Priority
7. **#122** - User profile page
8. **#123** - Logout and session expiry
9. **#125** - Invite users via email
10. **#126** - User registration and login
11. **#127** - Create and manage users (admin)
12. **#196** - Database migration scripts
13. **#204** - Real-time documentation capture
14. **#205** - Documentation search & filter
15. **#206** - Documentation export feature

### Low Priority
16. **#207** - Documentation version history UI

---

## 🚀 QUICK START FOR NEXT SESSION

### 1. Check Running Services
```bash
# Check background processes
/bashes

# Verify BubbleUp is running
# Should see: http://localhost:3000
```

### 2. Review Current Backlog
```bash
node -e "const { createClient } = require('@supabase/supabase-js'); require('dotenv').config({ path: '.env.local' }); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { const { data } = await supabase.from('backlog_items').select('id, user_story, status').eq('project', 'BubbleUp').order('id', { ascending: true }); data.forEach(s => console.log('#' + s.id + ': [' + s.status + '] ' + s.user_story)); })();"
```

### 3. Test Documentation Capture
```bash
# Test the capture agent
node bubbleup-doc-capture-agent.js "Design decision: Testing story #195 documentation capture after session restart"

# Check BubbleUp UI
# Go to http://localhost:3000
# Click 📄 icon next to story #195
# Verify documentation appears
```

### 4. Review This File
- Read through all sections
- Understand what's been completed
- Identify next priorities

---

## 💡 PROCESS LEARNINGS

### What Works Well
1. ✅ Building features incrementally (database → API → UI)
2. ✅ Creating comprehensive documentation as we go
3. ✅ Testing immediately after implementation
4. ✅ Using real story IDs in all examples and tests

### What Needs Improvement
1. ⚠️ **Update story status immediately** (not at end of session)
2. ⚠️ Always check for variable naming conflicts (global vs. local scope)
3. ⚠️ Verify database field names match schema (snake_case vs. camelCase)
4. ⚠️ Test pattern recognition with real-world examples before assuming it works

### Communication Protocol
1. 📝 **Always notify user** when documentation is captured
2. 💬 **Use format**: "📝 Captured to BubbleUp: [brief description]"
3. ✅ **Confirm completion** when marking stories as DONE
4. 🔄 **Update this file** at end of each session

---

## 🎯 RECOMMENDED NEXT STEPS

### Immediate (< 1 hour)
1. Test story #195 documentation capture
2. Complete story #202 (Claude integration testing)
3. Tune story #203 (pattern recognition - add more trigger phrases)

### Short-term (1-3 hours)
4. Story #200 (Teams notification templates)
5. Story #196 (Database migration scripts)
6. Story #199 (Teams webhooks - need URL from user)

### Medium-term (3-8 hours)
7. Stories #122-127 (User management features)
8. Story #133 (API authentication)
9. Stories #204-207 (Documentation enhancements)

---

## 📞 USER PREFERENCES

### Communication Style
- ✅ Concise, direct responses (< 4 lines when possible)
- ✅ Notify when documentation is captured
- ❌ No unnecessary preamble or postamble
- ❌ No emojis unless requested
- ❌ No explanations unless asked

### Work Style
- ✅ Update backlog status immediately
- ✅ Test after implementation
- ✅ Create documentation as we build
- ✅ Use TodoWrite for multi-step tasks
- ❌ Don't create files unless necessary
- ❌ Don't batch status updates

### Technical Preferences
- ✅ TypeScript with strict typing
- ✅ Supabase for backend
- ✅ Lucide React icons
- ✅ Snake_case for database fields
- ✅ RLS policies for security
- ✅ Comprehensive error handling

---

## 🔗 KEY FILES TO REFERENCE

### Project Structure
```
C:\Users\m\OneDrive\Desktop\bubbleup\
├── app/
│   ├── page.tsx                          # Main BubbleUp UI (story table)
│   ├── admin/page.tsx                    # Admin user management page
│   └── api/
│       └── documentation/route.ts        # Documentation API endpoints
├── components/
│   └── DocumentationModal.tsx            # Documentation viewing modal
├── migrations/
│   └── add-documentation-system.sql      # Documentation database schema
├── bubbleup-doc-capture-agent.js         # Intelligent capture agent
├── bubbleup-doc-capture-config.json      # Capture configuration
├── auto-capture-wrapper.js               # 100% capture wrapper
├── CLAUDE_API_GUIDE.md                   # API documentation for Claude
├── BUBBLEUP_AUTO_DOC_README.md          # Capture agent usage guide
├── CAPTURE_INTEGRATION_GUIDE.md          # 100% capture integration
├── BUBBLEUP_SESSION_CONTEXT.md          # THIS FILE (session continuity)
└── BACKLOG_STATUS_ANALYSIS.md           # Backlog status report
```

### Documentation to Read First
1. **This file** (BUBBLEUP_SESSION_CONTEXT.md) - Complete context
2. BUBBLEUP_AUTO_DOC_README.md - How to use capture agent
3. CLAUDE_API_GUIDE.md - API endpoint documentation
4. CAPTURE_INTEGRATION_GUIDE.md - 100% capture strategy

---

## 🧪 TESTING CHECKLIST

### Documentation System
- [ ] Can create documentation via API (POST /api/documentation)
- [ ] Can retrieve documentation via API (GET /api/documentation?story_id=XXX)
- [ ] Can update documentation via API (PATCH /api/documentation)
- [ ] Documentation modal opens when clicking 📄 icon
- [ ] Modal shows all documentation for story
- [ ] Can filter by document type
- [ ] Can expand/collapse documentation entries
- [ ] Capture agent detects story IDs (#195, "story 195", etc.)
- [ ] Capture agent detects document types (design, plan, progress, etc.)
- [ ] Capture agent posts to database successfully
- [ ] User receives notification when documentation is captured

### Backlog Management
- [ ] Stories display with correct status colors
- [ ] Can sort by any column
- [ ] Sorting overrides custom order mode
- [ ] Can drag-and-drop stories in custom order mode
- [ ] Project column shows only in "All Projects" view
- [ ] Dependencies tooltips show dependency status
- [ ] Can assign stories to team members
- [ ] Dark mode works

---

## 🆘 TROUBLESHOOTING

### BubbleUp Not Running
```bash
# Check if running
/bashes

# Start if needed
cd "C:\Users\m\OneDrive\Desktop\bubbleup"
npm run dev
```

### Documentation Not Capturing
```bash
# Check config is enabled
cat bubbleup-doc-capture-config.json | grep "enabled"

# Test manually
node bubbleup-doc-capture-agent.js "Test for story #195: Design decision implemented"

# Check logs
cat bubbleup-doc-capture.log
```

### Database Connection Issues
```bash
# Verify environment variables
cat .env.local | grep SUPABASE

# Test connection
node -e "const { createClient } = require('@supabase/supabase-js'); require('dotenv').config({ path: '.env.local' }); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { const { data, error } = await supabase.from('backlog_items').select('count'); console.log(data ? 'Connected!' : error); })();"
```

---

## ✅ SESSION END CHECKLIST

Before ending each session:

1. [ ] Update story statuses to DONE for all completed work
2. [ ] Test all new features
3. [ ] Update this file (BUBBLEUP_SESSION_CONTEXT.md) with:
   - New features completed
   - New files created/modified
   - New learnings or patterns discovered
   - Any blockers or issues encountered
4. [ ] Update BACKLOG_STATUS_ANALYSIS.md if significant progress made
5. [ ] Commit changes if requested by user
6. [ ] Notify user of session summary

---

## 📊 SESSION METRICS

### This Session (2025-10-07)
- **Duration**: Multi-day session
- **Stories Completed**: 5 (195, 197, 198, 201, 208)
- **Files Created**: 9 new files
- **Files Modified**: 1 file (app/page.tsx)
- **Lines of Code**: ~2000+ lines
- **Major Achievement**: Complete AI-powered documentation capture system

### Cumulative Progress
- **Total Stories Completed**: 16 / 34 (47%)
- **Total Stories Remaining**: 18 / 34 (53%)
- **Estimated Remaining Time**: ~3-5 days at current velocity

---

*This file is your lifeline between sessions. Keep it updated!* 🚀
