import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Valid documentation types
const DOC_TYPES = [
  'design', 'plan', 'progress', 'next_steps', 'testing', 'requirements',
  'feedback', 'build_log', 'test_result', 'decision_log', 'technical_note',
  'error', 'success'
] as const;

type DocType = typeof DOC_TYPES[number];

// POST /api/documentation - Create new documentation entry
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      story_id,
      doc_type,
      title,
      content,
      tags = [],
      links = [],
      related_stories = [],
      category = 'general',
      priority = 'medium',
      metadata = {}
    } = body;

    // Validation
    if (!story_id) {
      return NextResponse.json({ error: 'story_id is required' }, { status: 400 });
    }

    if (!doc_type || !DOC_TYPES.includes(doc_type)) {
      return NextResponse.json({
        error: `doc_type must be one of: ${DOC_TYPES.join(', ')}`
      }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json({
        error: 'title and content are required'
      }, { status: 400 });
    }

    // Verify story exists and user has access
    const { data: story, error: storyError } = await supabase
      .from('backlog_items')
      .select('id, project')
      .eq('id', story_id)
      .single();

    if (storyError || !story) {
      return NextResponse.json({
        error: 'Story not found or access denied'
      }, { status: 404 });
    }

    // Check user has permission to create documentation for this project
    const { data: roles } = await supabase
      .from('user_project_roles')
      .select('role, project')
      .eq('user_id', user.id);

    const hasAccess = roles?.some(r =>
      (r.project === story.project || r.project === 'ALL') &&
      ['admin', 'editor', 'read_write'].includes(r.role)
    );

    if (!hasAccess) {
      return NextResponse.json({
        error: 'Permission denied. You cannot create documentation for this project.'
      }, { status: 403 });
    }

    // Get user email
    const { data: userData } = await supabase.auth.getUser();
    const author_email = userData?.user?.email || '';

    // Create documentation entry
    const { data: doc, error: docError } = await supabase
      .from('documentation')
      .insert({
        story_id,
        doc_type,
        title,
        content,
        author: 'Claude',
        author_email,
        tags,
        links,
        related_stories,
        category,
        priority,
        metadata,
        version_number: 1,
        is_latest: true
      })
      .select()
      .single();

    if (docError) {
      console.error('Error creating documentation:', docError);
      return NextResponse.json({
        error: docError.message
      }, { status: 500 });
    }

    // TODO: Send Teams notification if webhook configured
    // await sendTeamsNotification(story.project, 'documentation_added', doc);

    return NextResponse.json({ documentation: doc }, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/documentation:', err);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// GET /api/documentation - Retrieve documentation entries
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const story_id = searchParams.get('story_id');
    const doc_type = searchParams.get('doc_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const include_versions = searchParams.get('include_versions') === 'true';

    // Build query
    let query = supabase
      .from('documentation')
      .select('*', { count: 'exact' });

    // Filter by story_id
    if (story_id) {
      query = query.eq('story_id', story_id);
    }

    // Filter by doc_type
    if (doc_type) {
      query = query.eq('doc_type', doc_type);
    }

    // Filter to latest versions only (unless requesting all versions)
    if (!include_versions) {
      query = query.eq('is_latest', true);
    }

    // Sort by created_at descending (newest first)
    query = query.order('created_at', { ascending: false });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: docs, error: docsError, count } = await query;

    if (docsError) {
      console.error('Error fetching documentation:', docsError);
      return NextResponse.json({
        error: docsError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      documentation: docs || [],
      total: count || 0,
      limit,
      offset
    });
  } catch (err) {
    console.error('Error in GET /api/documentation:', err);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// PATCH /api/documentation/:id - Update documentation (creates new version)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const doc_id = searchParams.get('id');

    if (!doc_id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { content, title, tags, links, related_stories, metadata } = body;

    // Get existing document
    const { data: existingDoc, error: fetchError } = await supabase
      .from('documentation')
      .select('*')
      .eq('id', doc_id)
      .single();

    if (fetchError || !existingDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Mark old version as not latest
    await supabase
      .from('documentation')
      .update({ is_latest: false })
      .eq('id', doc_id);

    // Create new version
    const { data: newDoc, error: createError } = await supabase
      .from('documentation')
      .insert({
        ...existingDoc,
        id: undefined, // Let DB generate new ID
        content: content || existingDoc.content,
        title: title || existingDoc.title,
        tags: tags || existingDoc.tags,
        links: links || existingDoc.links,
        related_stories: related_stories || existingDoc.related_stories,
        metadata: metadata || existingDoc.metadata,
        version_number: existingDoc.version_number + 1,
        parent_doc_id: doc_id,
        is_latest: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating new version:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ documentation: newDoc });
  } catch (err) {
    console.error('Error in PATCH /api/documentation:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
