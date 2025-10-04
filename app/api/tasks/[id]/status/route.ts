import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * PATCH /api/tasks/:id/status
 * Update task status and progress
 *
 * Required headers:
 * - Authorization: Bearer <token>
 *
 * Query params:
 * - project: Project name
 *
 * Request body:
 * {
 *   "status": "In Progress", // Required: "To Do", "In Progress", "Blocked", "Done"
 *   "progress": 50 // Required: 0-100
 * }
 *
 * Response:
 * {
 *   "status": "In Progress",
 *   "progress": 50,
 *   "updated_at": "timestamp",
 *   "task": { ... }
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and check permissions (Contributor can update status)
    const authResult = await authenticateRequest(request, ['Admin', 'Editor', 'Contributor'], true);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { context } = authResult;
    const { id: taskId } = await params;

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

    // Validate required fields
    if (body.status === undefined || body.progress === undefined) {
      return NextResponse.json(
        { error: 'Both status and progress are required' },
        { status: 422 }
      );
    }

    // Validate status
    const validStatuses = ['To Do', 'In Progress', 'Blocked', 'Done'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 422 }
      );
    }

    // Validate progress (0-100)
    const progress = parseInt(body.progress, 10);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Invalid progress. Must be a number between 0 and 100' },
        { status: 422 }
      );
    }

    // Update task status and progress
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({
        status: body.status,
        progress: progress
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task status:', error);
      return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 });
    }

    return NextResponse.json({
      status: data.status,
      progress: data.progress,
      updated_at: data.updated_at,
      task: data
    });

  } catch (err) {
    console.error('Error in PATCH /api/tasks/:id/status:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
