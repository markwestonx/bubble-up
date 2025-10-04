import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * PUT /api/tasks/:id
 * Update an existing task
 *
 * Required headers:
 * - Authorization: Bearer <token>
 *
 * Query params:
 * - project: Project name
 *
 * Request body (all fields optional):
 * {
 *   "title": "Updated title",
 *   "description": "Updated description",
 *   "effort": 8,
 *   "assignedUserId": "uuid"
 * }
 *
 * Response:
 * {
 *   "updated_at": "timestamp",
 *   "task": { ... }
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and check permissions (Contributor can update)
    const authResult = await authenticateRequest(request, ['Admin', 'Editor', 'Contributor'], true);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { context } = authResult;
    const taskId = params.id;

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify task exists and belongs to a story in this project
    const { data: task, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        backlog_items!inner(project)
      `)
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if task belongs to the specified project
    if (task.backlog_items.project !== context.project) {
      return NextResponse.json(
        { error: 'Task not found in this project' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Build update object with only provided fields
    const updates: any = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.effort !== undefined) updates.effort = body.effort;
    if (body.assignedUserId !== undefined) updates.assigned_to = body.assignedUserId || null;

    // Ensure at least one field is being updated
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 422 }
      );
    }

    // Update the task
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    return NextResponse.json({
      updated_at: data.updated_at,
      task: data
    });

  } catch (err) {
    console.error('Error in PUT /api/tasks/:id:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/tasks/:id
 * Get a single task by ID
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
    const taskId = params.id;

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get task with story project
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        backlog_items!inner(project)
      `)
      .eq('id', taskId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if task belongs to the specified project
    if (data.backlog_items.project !== context.project) {
      return NextResponse.json(
        { error: 'Task not found in this project' },
        { status: 404 }
      );
    }

    return NextResponse.json({ task: data });

  } catch (err) {
    console.error('Error in GET /api/tasks/:id:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
