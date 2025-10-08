import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Valid documentation types
const DOC_TYPES = [
  'design', 'plan', 'progress', 'next_steps', 'testing', 'requirements',
  'feedback', 'build_log', 'test_result', 'decision_log', 'technical_note',
  'error', 'success'
] as const;

type DocType = typeof DOC_TYPES[number];

interface UserProjectRole {
  role: string;
  project: string;
}

// POST /api/documentation - Create new documentation entry
export async function POST(request: Request) {
  try {
    // Check for Bearer token in Authorization header
    const authHeader = request.headers.get('authorization');
    let supabase;
    let user = null;
    let authError = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Create client with the provided token
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      const result = await supabase.auth.getUser();
      user = result.data.user;
      authError = result.error;
    } else {
      // Fall back to cookie-based auth
      supabase = await createClient();
      const result = await supabase.auth.getUser();
      user = result.data.user;
      authError = result.error;
    }

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
    const rolesQuery = await supabase
      .from('user_project_roles')
      .select('role, project')
      .eq('user_id', user.id);

    const roles: UserProjectRole[] = (rolesQuery.data as any) || [];

    let hasAccess = false;
    for (const role of roles as UserProjectRole[]) {
      // @ts-ignore - TypeScript incorrectly infers role as never despite explicit type assertions
      if ((role.project === story.project || role.project === 'ALL') &&
          ['admin', 'editor', 'contributor'].includes(role.role)) {
        hasAccess = true;
        break;
      }
    }

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
      // @ts-ignore - documentation table not in generated Supabase types
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
    // Check for Bearer token in Authorization header
    const authHeader = request.headers.get('authorization');
    let supabase;
    let user = null;
    let authError = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Create client with the provided token
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      const result = await supabase.auth.getUser();
      user = result.data.user;
      authError = result.error;
    } else {
      // Fall back to cookie-based auth
      supabase = await createClient();
      const result = await supabase.auth.getUser();
      user = result.data.user;
      authError = result.error;
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const story_id = searchParams.get('story_id');
    const doc_type = searchParams.get('doc_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const include_versions = searchParams.get('include_versions') === 'true';

    // Get user's authorized projects
    const rolesQuery = await supabase
      .from('user_project_roles')
      .select('role, project')
      .eq('user_id', user.id);

    const roles: UserProjectRole[] = (rolesQuery.data as any) || [];
    const hasAllAccess = roles.some((r: UserProjectRole) => r.project === 'ALL');
    const authorizedProjects = roles.map((r: UserProjectRole) => r.project);

    if (!hasAllAccess && authorizedProjects.length === 0) {
      return NextResponse.json({
        documentation: [],
        total: 0,
        limit,
        offset
      });
    }

    // Build query
    let query = supabase
      .from('documentation')
      .select('*, story:story_id(project)', { count: 'exact' });

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

    // Filter docs to only include those from authorized projects
    let filteredDocs = docs || [];
    if (!hasAllAccess) {
      filteredDocs = filteredDocs.filter((doc: any) => {
        const storyProject = doc.story?.project;
        return storyProject && authorizedProjects.includes(storyProject);
      });
    }

    return NextResponse.json({
      documentation: filteredDocs,
      total: filteredDocs.length,
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
    // Check for Bearer token in Authorization header
    const authHeader = request.headers.get('authorization');
    let supabase;
    let user = null;
    let authError = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Create client with the provided token
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      const result = await supabase.auth.getUser();
      user = result.data.user;
      authError = result.error;
    } else {
      // Fall back to cookie-based auth
      supabase = await createClient();
      const result = await supabase.auth.getUser();
      user = result.data.user;
      authError = result.error;
    }

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

    // Check user has permission to edit documentation for this project
    const { data: story } = await supabase
      .from('backlog_items')
      .select('project')
      .eq('id', existingDoc.story_id)
      .single();

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const rolesQuery = await supabase
      .from('user_project_roles')
      .select('role, project')
      .eq('user_id', user.id);

    const roles: UserProjectRole[] = (rolesQuery.data as any) || [];

    let hasAccess = false;
    for (const role of roles as UserProjectRole[]) {
      // @ts-ignore
      if ((role.project === story.project || role.project === 'ALL') &&
          ['admin', 'editor', 'contributor'].includes(role.role)) {
        hasAccess = true;
        break;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({
        error: 'Permission denied. You cannot edit documentation for this project.'
      }, { status: 403 });
    }

    // Mark old version as not latest
    await supabase
      .from('documentation')
      // @ts-ignore - documentation table not in generated Supabase types
      .update({ is_latest: false })
      .eq('id', doc_id);

    // Create new version
    const { data: newDoc, error: createError } = await supabase
      .from('documentation')
      // @ts-ignore - documentation table not in generated Supabase types
      .insert({
        // @ts-ignore - TypeScript incorrectly infers existingDoc type
        ...existingDoc,
        id: undefined, // Let DB generate new ID
        // @ts-ignore
        content: content || existingDoc.content,
        // @ts-ignore
        title: title || existingDoc.title,
        // @ts-ignore
        tags: tags || existingDoc.tags,
        // @ts-ignore
        links: links || existingDoc.links,
        // @ts-ignore
        related_stories: related_stories || existingDoc.related_stories,
        // @ts-ignore
        metadata: metadata || existingDoc.metadata,
        // @ts-ignore
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

// DELETE /api/documentation - Delete documentation entry
export async function DELETE(request: Request) {
  try {
    // Check for Bearer token in Authorization header
    const authHeader = request.headers.get('authorization');
    let supabase;
    let user = null;
    let authError = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Create client with the provided token
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      const result = await supabase.auth.getUser();
      user = result.data.user;
      authError = result.error;
    } else {
      // Fall back to cookie-based auth
      supabase = await createClient();
      const result = await supabase.auth.getUser();
      user = result.data.user;
      authError = result.error;
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const doc_id = searchParams.get('id');

    if (!doc_id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Get the document to check permissions
    const { data: doc, error: fetchError } = await supabase
      .from('documentation')
      .select('*, story:story_id(project)')
      .eq('id', doc_id)
      .single();

    if (fetchError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check user has permission to delete documentation for this project
    const { data: story } = await supabase
      .from('backlog_items')
      .select('project')
      .eq('id', doc.story_id)
      .single();

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const rolesQuery = await supabase
      .from('user_project_roles')
      .select('role, project')
      .eq('user_id', user.id);

    const roles: UserProjectRole[] = (rolesQuery.data as any) || [];

    let hasAccess = false;
    for (const role of roles as UserProjectRole[]) {
      // @ts-ignore
      if ((role.project === story.project || role.project === 'ALL') &&
          ['admin', 'editor', 'contributor'].includes(role.role)) {
        hasAccess = true;
        break;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({
        error: 'Permission denied. You cannot delete documentation for this project.'
      }, { status: 403 });
    }

    // Delete the document
    const { error: deleteError } = await supabase
      .from('documentation')
      .delete()
      .eq('id', doc_id);

    if (deleteError) {
      console.error('Error deleting documentation:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /api/documentation:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
