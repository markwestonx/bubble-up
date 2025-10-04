# User Management Setup (Story 120)

## Overview
BubbleUp now includes a user management page that allows you to:
- View all registered users
- Create new users with email and password
- Delete users (except the currently logged-in user)
- See user creation dates and last sign-in times

## Setup Instructions

### 1. Add Service Role Key to Environment Variables

The user management feature requires a Supabase service role key to perform admin operations securely on the server side.

1. Go to your Supabase dashboard: https://app.supabase.com/project/bzqgoppjuynxfyrrhsbg/settings/api

2. Scroll down to the "Project API keys" section

3. Copy the **service_role** secret key (NOT the anon public key)

4. Edit `.env.local` and replace `your_service_role_key_here` with your actual service role key:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_actual_service_role_key_here
```

5. **IMPORTANT**: Never commit the `.env.local` file with the real service role key to version control

### 2. Restart the Development Server

After adding the service role key, restart the Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Access the User Management Page

1. Navigate to http://localhost:3004 (or your dev server port)
2. Log in with your credentials
3. Click the **Users icon** (👥) in the top right toolbar
4. You should now see the User Management page

## Features

### View Users
- See all registered users in a table
- View user emails, creation dates, and last sign-in times
- See user IDs for reference

### Create New User
- Enter email and password (min 6 characters)
- User is automatically confirmed (no email verification needed)
- Newly created users can log in immediately

### Delete User
- Click "Delete" next to any user (except yourself)
- Confirmation dialog prevents accidental deletions
- User is permanently removed from Supabase Auth

## Security Notes

1. **Service Role Key**: This key has FULL admin access to your Supabase project
   - Never expose it in client-side code
   - Never commit it to git
   - It's only used in server-side API routes (`/app/api/admin/users/route.ts`)

2. **Access Control**: Currently, any authenticated user can access the user management page
   - For production, you should add role-based access control
   - Consider adding an `is_admin` flag to your user profiles table
   - Verify admin status in the API route before allowing operations

## Files Created/Modified

- `app/admin/users/page.tsx` - User management UI
- `app/api/admin/users/route.ts` - Server-side API for admin operations
- `app/page.tsx` - Added Users icon button in toolbar
- `.env.local` - Added SUPABASE_SERVICE_ROLE_KEY placeholder

## Testing

1. **Test User Creation**:
   - Go to user management page
   - Create a new user with email `test@example.com` and password `test123`
   - Verify user appears in the table
   - Log out and try logging in as the new user

2. **Test User Deletion**:
   - Create a test user
   - Delete the test user
   - Verify user is removed from the table
   - Try logging in as deleted user (should fail)

3. **Test Protection**:
   - Try deleting your current user (should show "Current User" instead of Delete button)

## Troubleshooting

### "Missing Supabase environment variables" Error
- Make sure you've added the `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Restart the dev server after adding the key

### "Failed to load users" Error
- Check that the service role key is correct
- Verify network connection to Supabase
- Check browser console for detailed error messages

### Users Not Loading
- Make sure you're logged in first
- Check that you have an active internet connection
- Verify the Supabase project URL is correct in `.env.local`
