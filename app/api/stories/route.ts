import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isEditorOrAdmin } from '@/lib/api-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/stories
 * List and search user stories
 *
 * Required headers:
 * - Authorization: Bearer <token>
 *
 * Query params:
 * - project: Project name (required)
 * - status: Filter by status (optional)
 * - priority: Filter by priority (optional)
 * - epic: Filter by epic (optional)
 * - assignedTo: Filter by assigned user UUID (optional)
 * - isNext: Filter by "next up" flag (optional, true/false)
 * - search: Search in user story text (optional)
 * - limit: Number of results (optional, default: all)
 *
 * Response:
 * {
 *   "stories": [...],
 *   "count": 42
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate (read access - all roles allowed)
    const authResult = await authenticateRequest(request, [], true);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { context } = authResult;
    const { searchParams } = new URL(request.url);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Build query
    let query = supabaseAdmin
      .from('backlog_items')
      .select('*')
      .eq('project', context.project);

    // Apply filters
    const status = searchParams.get('status');
    if (status) query = query.eq('status', status);

    const priority = searchParams.get('priority');
    if (priority) query = query.eq('priority', priority);

    const epic = searchParams.get('epic');
    if (epic) query = query.eq('epic', epic);

    const assignedTo = searchParams.get('assignedTo');
    if (assignedTo) query = query.eq('assigned_to', assignedTo);

    const isNext = searchParams.get('isNext');
    if (isNext === 'true') query = query.eq('is_next', true);
    if (isNext === 'false') query = query.eq('is_next', false);

    const search = searchParams.get('search');
    if (search) query = query.ilike('user_story', `%${search}%`);

    // Order by display_order
    query = query.order('display_order', { ascending: true });

    // Apply limit if provided
    const limit = searchParams.get('limit');
    if (limit) query = query.limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching stories:', error);
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
    }

    return NextResponse.json({
      stories: data || [],
      count: data?.length || 0
    });

  } catch (err) {
    console.error('Error in GET /api/stories:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/stories
 * Create a new user story
 *
 * Required headers:
 * - Authorization: Bearer <token>
 *
 * Request body:
 * {
 *   "project": "Sales Genie",
 *   "userStory": "As a user...",
 *   "epic": "foundation",
 *   "priority": "HIGH",
 *   "effort": 8,
 *   "businessValue": 10,
 *   "acceptanceCriteria": ["Criteria 1", "Criteria 2"],
 *   "technicalNotes": "Optional notes",
 *   "dependencies": ["story-id-1"],
 *   "status": "NOT_STARTED"
 * }
 *
 * Response:
 * {
 *   "id": "uuid",
 *   "created_at": "timestamp",
 *   "story": { ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and check permissions
    const authResult = await authenticateRequest(request, ['Admin', 'Editor'], true);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { context } = authResult;

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['userStory', 'epic', 'priority', 'effort', 'businessValue'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 422 }
      );
    }

    // Validate priority
    const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    if (!validPriorities.includes(body.priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 422 }
      );
    }

    // Validate status
    const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'TESTING', 'BLOCKED', 'COMPLETE'];
    const status = body.status || 'NOT_STARTED';
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 422 }
      );
    }

    // Validate effort (should be Fibonacci: 1, 2, 3, 5, 8, 13)
    const validEfforts = [1, 2, 3, 5, 8, 13];
    if (!validEfforts.includes(body.effort)) {
      return NextResponse.json(
        { error: `Invalid effort. Must be a Fibonacci number: ${validEfforts.join(', ')}` },
        { status: 422 }
      );
    }

    // Validate businessValue (1-10)
    if (body.businessValue < 1 || body.businessValue > 10) {
      return NextResponse.json(
        { error: 'Invalid businessValue. Must be between 1 and 10' },
        { status: 422 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get the next sequential ID
    const { data: allItems } = await supabaseAdmin
      .from('backlog_items')
      .select('id');

    const numericIds = allItems
      ?.map(item => parseInt(item.id))
      .filter(id => !isNaN(id))
      .sort((a, b) => b - a) || [];

    const highestId = numericIds.length > 0 ? numericIds[0] : 0;
    const nextId = (highestId + 1).toString();

    // Get the highest display_order for this project
    const { data: maxOrderData } = await supabaseAdmin
      .from('backlog_items')
      .select('display_order')
      .eq('project', context.project)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextDisplayOrder = maxOrderData ? maxOrderData.display_order + 1 : 0;

    // Create the story
    const newStory = {
      id: nextId,
      project: context.project,
      epic: body.epic,
      priority: body.priority,
      status: status,
      user_story: body.userStory,
      acceptance_criteria: body.acceptanceCriteria || [],
      effort: body.effort,
      business_value: body.businessValue,
      dependencies: body.dependencies || [],
      technical_notes: body.technicalNotes || '',
      assigned_to: body.assignedTo || null,
      is_next: body.isNext || false,
      display_order: nextDisplayOrder,
      created_by: context.userId
    };

    const { data, error } = await supabaseAdmin
      .from('backlog_items')
      .insert(newStory)
      .select()
      .single();

    if (error) {
      console.error('Error creating story:', error);
      return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      created_at: data.created_at,
      story: data
    }, { status: 201 });

  } catch (err) {
    console.error('Error in POST /api/stories:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
