import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isEditorOrAdmin } from '@/lib/api-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/stories/:storyId/tasks
 * Create a new task linked to a user story
 *
 * Required headers:
 * - Authorization: Bearer <token>
 *
 * Query params:
 * - project: Project name
 *
 * Request body:
 * {
 *   "title": "Task title",
 *   "description": "Optional description",
 *   "status": "To Do", // Optional, defaults to "To Do"
 *   "effort": 5, // Optional
 *   "assignedUserId": "uuid" // Optional
 * }
 *
 * Response:
 * {
 *   "id": "uuid",
 *   "created_at": "timestamp",
 *   "task": { ... }
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and check permissions
    const authResult = await authenticateRequest(request, ['Admin', 'Editor', 'Contributor'], true);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { context } = authResult;
    const storyId = params.id;

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the story exists and belongs to the project
    const { data: story, error: storyError } = await supabaseAdmin
      .from('backlog_items')
      .select('id')
      .eq('id', storyId)
      .eq('project', context.project)
      .single();

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found in this project' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 422 }
      );
    }

    // Validate status if provided
    const validStatuses = ['To Do', 'In Progress', 'Blocked', 'Done'];
    const status = body.status || 'To Do';
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 422 }
      );
    }

    // Get the highest display_order for tasks in this story
    const { data: maxOrderData } = await supabaseAdmin
      .from('tasks')
      .select('display_order')
      .eq('backlog_item_id', storyId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextDisplayOrder = maxOrderData ? maxOrderData.display_order + 1 : 0;

    // Create the task
    const newTask = {
      backlog_item_id: storyId,
      title: body.title,
      description: body.description || null,
      status: status,
      effort: body.effort || null,
      assigned_to: body.assignedUserId || null,
      progress: 0,
      display_order: nextDisplayOrder,
      created_by: context.userId
    };

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert(newTask)
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      status: data.status,
      task: data
    }, { status: 201 });

  } catch (err) {
    console.error('Error in POST /api/stories/:storyId/tasks:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/stories/:storyId/tasks
 * Get all tasks for a user story
 *
 * Required headers:
 * - Authorization: Bearer <token>
 *
 * Query params:
 * - project: Project name
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate (read access - all roles allowed)
    const authResult = await authenticateRequest(request, [], true);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { context } = authResult;
    const storyId = params.id;

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the story exists and belongs to the project
    const { data: story, error: storyError } = await supabaseAdmin
      .from('backlog_items')
      .select('id')
      .eq('id', storyId)
      .eq('project', context.project)
      .single();

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found in this project' },
        { status: 404 }
      );
    }

    // Get all tasks for this story
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('backlog_item_id', storyId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    return NextResponse.json({ tasks: data || [] });

  } catch (err) {
    console.error('Error in GET /api/stories/:storyId/tasks:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
