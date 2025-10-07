import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's view state
    const { data, error } = await supabase
      .from('user_view_state')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no view state exists yet, return null (not an error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ viewState: null });
      }
      console.error('Error fetching view state:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ viewState: data });
  } catch (err) {
    console.error('Error in GET /api/view-state:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      current_project,
      sort_by,
      sort_direction,
      filter_epic,
      filter_priority,
      filter_status,
      is_custom_order,
      expanded_items,
      context_menu_filters
    } = body;

    // Upsert (insert or update) the view state
    const { data, error } = await supabase
      .from('user_view_state')
      .upsert({
        user_id: user.id,
        current_project,
        sort_by,
        sort_direction,
        filter_epic,
        filter_priority,
        filter_status,
        is_custom_order,
        expanded_items,
        context_menu_filters,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving view state:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ viewState: data });
  } catch (err) {
    console.error('Error in POST /api/view-state:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
