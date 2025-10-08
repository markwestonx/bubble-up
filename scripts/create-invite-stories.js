const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function createStories() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'claude_mw@regulativ.ai',
    password: '31iYTgxdPdBi'
  });

  if (authError) {
    console.error('❌ Auth failed:', authError.message);
    return;
  }

  const token = authData.session.access_token;

  // Story 1: Temporary Password for New Users (ID: 210)
  const story1 = {
    id: '210',
    project: 'BubbleUp',
    epic: 'User Management',
    user_story: 'As an admin inviting a new user, I want them to receive a temporary password via email so they can log in immediately and set their own password',
    acceptance_criteria: [
      'When admin invites new user, system generates secure temporary password (e.g. Welcome2024! + random)',
      'Email sent to user contains their email address and temporary password',
      'User can log in with temporary password',
      'After first login with temp password, user is redirected to /profile or password change page',
      'User must change password on first login before accessing other features',
      'Temporary password flag is cleared after user sets new password'
    ],
    priority: 'HIGH',
    effort: 3,
    business_value: 8,
    status: 'TO_DO',
    technical_notes: 'Quick solution to unblock user invites. Replaces broken password reset email flow. Implement this first.'
  };

  // Story 2: Custom Invite Token System (ID: 211)
  const story2 = {
    id: '211',
    project: 'BubbleUp',
    epic: 'User Management',
    user_story: 'As an admin inviting a new user, I want to send them a secure invite link so they can set their password without authentication issues',
    acceptance_criteria: [
      'Create invite_tokens table (token, email, expires_at, used_at, created_by)',
      'Admin invite generates secure random token with 7-day expiry',
      'Email contains invite link: /invite/accept?token=xyz',
      'Invite acceptance page validates token and shows password set form',
      'User sets password without logging in first',
      'Token is marked as used and cannot be reused',
      'Admin can see pending/accepted/expired invites in admin dashboard',
      'Admin can resend or revoke invite tokens'
    ],
    priority: 'MEDIUM',
    effort: 8,
    business_value: 7,
    status: 'BACKLOG',
    technical_notes: 'More secure long-term solution. Implement after temporary password system (#210) is working.'
  };

  const stories = [story1, story2];

  for (const story of stories) {
    const response = await fetch('http://localhost:3010/api/backlog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(story)
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Created story #${result.id}: ${story.user_story.substring(0, 60)}...`);
    } else {
      console.error('❌ Failed:', result.error);
    }
  }

  await supabase.auth.signOut();
  console.log('\n✅ Stories created successfully!');
}

createStories().catch(console.error);
