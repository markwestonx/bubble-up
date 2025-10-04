import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// GET: Read backlog items (requires canView)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');

    if (!project) {
      return NextResponse.json({ error: 'Project parameter is required' }, { status: 400 });
    }

    const user = await getUserFromRequest(request);
    const authCheck = await requirePermission(user?.id, project, 'canView');

    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin
      .from('backlog_items')
      .select('*')
      .eq('project', project)
      .order('display_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch backlog items' }, { status: 500 });
  }
}

// POST: Create backlog item (requires canCreate)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project } = body;

    if (!project) {
      return NextResponse.json({ error: 'Project is required' }, { status: 400 });
    }

    const user = await getUserFromRequest(request);
    const authCheck = await requirePermission(user?.id, project, 'canCreate');

    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin
      .from('backlog_items')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create backlog item' }, { status: 500 });
  }
}

// PATCH: Update backlog item (requires canEdit)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, project, ...updates } = body;

    if (!id || !project) {
      return NextResponse.json({ error: 'ID and project are required' }, { status: 400 });
    }

    const user = await getUserFromRequest(request);
    const authCheck = await requirePermission(user?.id, project, 'canEdit');

    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin
      .from('backlog_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update backlog item' }, { status: 500 });
  }
}

// DELETE: Delete backlog item (requires canDelete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const project = searchParams.get('project');

    if (!id || !project) {
      return NextResponse.json({ error: 'ID and project are required' }, { status: 400 });
    }

    const user = await getUserFromRequest(request);
    const authCheck = await requirePermission(user?.id, project, 'canDelete');

    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await supabaseAdmin
      .from('backlog_items')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete backlog item' }, { status: 500 });
  }
}
