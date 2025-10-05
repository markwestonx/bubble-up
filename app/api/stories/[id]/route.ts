import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isEditorOrAdmin } from '@/lib/api-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * PUT /api/stories/:id
 * Update an existing user story
 *
 * Required headers:
 * - Authorization: Bearer <token>
 *
 * Query params:
 * - project: Project name
 *
 * Request body (all fields optional):
 * {
 *   "userStory": "As a user...",
 *   "epic": "foundation",
 *   "priority": "HIGH",
 *   "effort": 8,
 *   "businessValue": 10,
 *   "acceptanceCriteria": ["Criteria 1", "Criteria 2"],
 *   "technicalNotes": "Optional notes",
 *   "dependencies": ["story-id-1"],
 *   "status": "IN_PROGRESS",
 *   "assignedTo": "uuid",
 *   "isNext": true
 * }
 *
 * Response:
 * {
 *   "updated_at": "timestamp",
 *   "story": { ... }
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and check permissions
    const authResult = await authenticateRequest(request, ['Admin', 'Editor'], true);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { context } = authResult;
    const { id: storyId } = await params;

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if story exists and belongs to the project
    const { data: existingStory, error: fetchError } = await supabaseAdmin
      .from('backlog_items')
      .select('*')
      .eq('id', storyId)
      .eq('project', context.project)
      .single();

    if (fetchError || !existingStory) {
      return NextResponse.json(
        { error: 'Story not found in this project' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Build update object with only provided fields
    const updates: any = {};

    if (body.userStory !== undefined) updates.user_story = body.userStory;
    if (body.epic !== undefined) updates.epic = body.epic;
    if (body.technicalNotes !== undefined) updates.technical_notes = body.technicalNotes;
    if (body.acceptanceCriteria !== undefined) updates.acceptance_criteria = body.acceptanceCriteria;
    if (body.dependencies !== undefined) updates.dependencies = body.dependencies;
    if (body.assignedTo !== undefined) updates.assigned_to = body.assignedTo || null;
    if (body.isNext !== undefined) updates.is_next = body.isNext;

    // Validate priority if provided
    if (body.priority !== undefined) {
      const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
          { status: 422 }
        );
      }
      updates.priority = body.priority;
    }

    // Validate status if provided
    if (body.status !== undefined) {
      const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'TESTING', 'BLOCKED', 'COMPLETE'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 422 }
        );
      }
      updates.status = body.status;
    }

    // Validate effort if provided
    if (body.effort !== undefined) {
      const validEfforts = [1, 2, 3, 5, 8, 13];
      if (!validEfforts.includes(body.effort)) {
        return NextResponse.json(
          { error: `Invalid effort. Must be a Fibonacci number: ${validEfforts.join(', ')}` },
          { status: 422 }
        );
      }
      updates.effort = body.effort;
    }

    // Validate businessValue if provided
    if (body.businessValue !== undefined) {
      if (body.businessValue < 1 || body.businessValue > 10) {
        return NextResponse.json(
          { error: 'Invalid businessValue. Must be between 1 and 10' },
          { status: 422 }
        );
      }
      updates.business_value = body.businessValue;
    }

    // Ensure updated_at is set
    updates.updated_at = new Date().toISOString();

    // Update the story
    const { data, error } = await supabaseAdmin
      .from('backlog_items')
      .update(updates)
      .eq('id', storyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating story:', error);
      return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
    }

    return NextResponse.json({
      updated_at: data.updated_at,
      story: data
    });

  } catch (err) {
    console.error('Error in PUT /api/stories/:id:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/stories/:id
 * Get a single story by ID
 *
 * Required headers:
 * - Authorization: Bearer <token>
 *
 * Query params:
 * - project: Project name
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate (read access - all roles allowed)
    const authResult = await authenticateRequest(request, [], true);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { context } = authResult;
    const { id: storyId } = await params;

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data, error } = await supabaseAdmin
      .from('backlog_items')
      .select('*')
      .eq('id', storyId)
      .eq('project', context.project)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Story not found in this project' },
        { status: 404 }
      );
    }

    return NextResponse.json({ story: data });

  } catch (err) {
    console.error('Error in GET /api/stories/:id:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/stories/:id
 * Delete a story by ID
 *
 * Required headers:
 * - Authorization: Bearer <token>
 *
 * Query params:
 * - project: Project name
 *
 * Response:
 * {
 *   "message": "Story deleted successfully",
 *   "deletedStory": { ... }
 * }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and check permissions (Admin or Editor only)
    const authResult = await authenticateRequest(request, ['Admin', 'Editor'], true);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { context } = authResult;
    const { id: storyId } = await params;

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if story exists and belongs to the project
    const { data: existingStory, error: fetchError } = await supabaseAdmin
      .from('backlog_items')
      .select('*')
      .eq('id', storyId)
      .eq('project', context.project)
      .single();

    if (fetchError || !existingStory) {
      return NextResponse.json(
        { error: 'Story not found in this project' },
        { status: 404 }
      );
    }

    // Delete the story
    const { error: deleteError } = await supabaseAdmin
      .from('backlog_items')
      .delete()
      .eq('id', storyId);

    if (deleteError) {
      console.error('Error deleting story:', deleteError);
      return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Story deleted successfully',
      deletedStory: existingStory
    });

  } catch (err) {
    console.error('Error in DELETE /api/stories/:id:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
