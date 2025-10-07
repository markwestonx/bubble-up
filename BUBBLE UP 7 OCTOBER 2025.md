BUBBLE UP 7 OCTOBER 2025



Testing the new authorisation features. 



Changes completed:



&nbsp; 1. ✅ Added "Back to Backlog" link on admin dashboard

&nbsp; 2. ✅ Fixed read-only users being able to edit in expanded view - all fields now check canEditThisItem permission:

&nbsp;   - Acceptance Criteria (add, edit, delete)

&nbsp;   - Technical Notes

&nbsp;   - Dependencies

&nbsp;   - Assigned To

&nbsp;   - Effort

&nbsp;   - Project

&nbsp;   - Business Value



Regarding the Supabase Admin Dashboard note:



The current implementation has a "Invite User" feature that sends email invitations, but it doesn't directly create user accounts or reset passwords. Here's why:



1\. User Creation: Supabase requires users to sign up via their authentication flow (email/password, magic link, OAuth, etc.). The invite flow sends an email, but the user completes registration themselves.

2\. Password Reset: Supabase handles password resets through their built-in auth flow (auth.resetPasswordForEmail()), but for admins to reset passwords for other users, you need admin privileges.



Better alternatives:



1\. For password reset - I can add a "Reset Password" button next to each user that sends a password reset email via the /api/admin/reset-password endpoint

2\. For admin password change - The profile page already allows users (including admins) to update their own password



Would you like me to:

&nbsp; - Add a "Send Password Reset Email" button for each user in the admin dashboard?

&nbsp; - Remove or update that note to be more accurate?

&nbsp; - Create users directly through the Supabase Admin API (requires service role key)?



------



  **Option 1: "Send Password Reset Email" button**



&nbsp; How it works:

&nbsp; - Uses Supabase's built-in password reset flow: supabase.auth.resetPasswordForEmail(email)

&nbsp; - Supabase automatically sends an email to the user with a secure reset link

&nbsp; - User clicks the link, enters new password, done

&nbsp; - Requires: Supabase has email configured (which it already does since your invite system works)

&nbsp; - Benefit: Standard, secure, no custom email setup needed



  **Option 2: Update the note**



&nbsp; Currently the admin dashboard shows:

&nbsp; "Note: To add new users or reset passwords, use the Supabase Admin Dashboard."



&nbsp; This is confusing because:

&nbsp; - You already have "Invite User" button (which adds users via email invite)

&nbsp; - Password reset could be added as a button



&nbsp; I could:

&nbsp; - Remove this note entirely (since it's outdated)

&nbsp; - Change it to:  



&nbsp; Option 3: Create users directly via Supabase Admin API



&nbsp; How it works:

&nbsp; - Admin clicks "Create User" in BubbleUp UI

&nbsp; - BubbleUp backend calls Supabase Admin API using service role key

&nbsp; - Creates user account immediately with a temporary password

&nbsp; - User receives email with credentials



&nbsp; Difference from current "Invite User":

&nbsp; - Current: Sends invite email → user signs up themselves → user creates their own password

&nbsp; - New: Admin creates account with password → user receives credentials → user can login immediately



&nbsp; My recommendation:

&nbsp; Keep the current "Invite User" flow (cleaner, more secure) + add "Send Password Reset Email" button for each user row. This gives you

&nbsp; full user management without needing direct access to Supabase dashboard.



&nbsp; Would you like me to add the "Send Password Reset Email" button?



-------------



&nbsp; Summary of Changes:



&nbsp; 1. ✅ Fixed read-only permission bug - All fields in the expanded view now properly check canEditThisItem before allowing edits:

&nbsp;   - Acceptance Criteria (add/edit/delete buttons)

&nbsp;   - Technical Notes

&nbsp;   - Dependencies

&nbsp;   - Assigned To

&nbsp;   - Effort

&nbsp;   - Project

&nbsp;   - Business Value

&nbsp; 2. ✅ Added "Reset Password" button - Each user in the admin dashboard now has a "Reset Password" button that:

&nbsp;   - Sends a password reset email via Supabase's built-in auth flow

&nbsp;   - Shows confirmation dialog before sending

&nbsp;   - Displays success/error messages

&nbsp;   - Redirects to /reset-password page when user clicks the email link

&nbsp; 3. ✅ Updated the note - Changed from "use the Supabase Admin Dashboard" to "Users can reset their own password from the Profile page, or

&nbsp;  you can send a password reset email"

&nbsp; 4. ✅ Added "Back to Backlog" link on the admin dashboard



The password reset functionality uses Supabase's resetPasswordForEmail() method, which sends a secure email with a reset link. When users click the link, they'll be redirected to the reset password page where they can set a new password.



------------------



&nbsp;Summary of Changes:



&nbsp; 1. ✅ Added "Add Role" functionality - When you expand a user in the admin dashboard, you'll now see a "+ Add Role" button at the bottom

&nbsp; of their roles list. Clicking it opens a form where you can:

&nbsp;   - Enter a project name (e.g., "BubbleUp", "ALL", or any custom project)

&nbsp;   - Select a role (Admin, Editor, Read/Write, Read Only)

&nbsp;   - Add the role with validation to prevent duplicates

&nbsp; 2. ✅ Sorted users alphabetically - User emails now appear in alphabetical order in the "View by Users" tab

&nbsp; 3. ✅ Sorted projects alphabetically with ALL at top - Projects are now sorted with "ALL" at the top, followed by all other projects in

&nbsp; alphabetical order in the "View by Projects" tab



&nbsp; The add role form includes:

&nbsp; - Auto-focus on the project name input

&nbsp; - Validation to prevent duplicate roles

&nbsp; - Success/error messaging

&nbsp; - Cancel button to close the form



&nbsp; Try it out - expand any user and click the "+ Add Role" button to add a new project role!



------------------



TESTING



KEEP regulativ.ai 

SET AUTH 

