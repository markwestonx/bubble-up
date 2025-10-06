# Email Notification Setup Instructions

## Quick Setup (5 minutes)

### Step 1: Create Gmail Account for Backups

1. Go to https://accounts.google.com/signup
2. Create account:
   - **Email**: `claude.bubble.backups@gmail.com` (or similar)
   - **Password**: Choose a strong password

### Step 2: Enable 2-Factor Authentication

1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the prompts to enable 2FA

### Step 3: Generate App Password

1. Still in Security settings, scroll to "App passwords"
2. Click "App passwords"
3. Select:
   - **App**: Mail
   - **Device**: Windows Computer (or Other)
4. Click "Generate"
5. **COPY THE 16-CHARACTER PASSWORD** - you'll need this next

### Step 4: Add Credentials to .env.local

Add these lines to your `.env.local` file:

```bash
# Email Notification Settings
BACKUP_EMAIL_USER=claude.bubble.backups@gmail.com
BACKUP_EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-char app password from Step 3
BACKUP_EMAIL_FROM=Claude Backup Bot <claude.bubble.backups@gmail.com>
BACKUP_EMAIL_TO=mark.weston@regulativ.ai
```

**Replace** `xxxx xxxx xxxx xxxx` with the actual 16-character app password.

### Step 5: Enable Intensive Monitoring

Run this command to enable hourly emails for the next 24 hours:

```bash
node email-notifier.js enable-intensive
```

### Step 6: Test the Setup

Send a test email:

```bash
node email-notifier.js test
```

Check `mark.weston@regulativ.ai` inbox for the test email.

---

## Usage Commands

### Enable/Disable Monitoring Modes

```bash
# Enable hourly emails for next 24 hours
node email-notifier.js enable-intensive

# Switch to end-of-day summary only
node email-notifier.js disable-intensive

# Check current status
node email-notifier.js status
```

### Manual Backup with Email

```bash
npm run backup
```

This will automatically send an email if:
- Intensive mode is enabled (sends every hour)
- OR it's a daily/weekly backup

---

## How It Works

### Intensive Mode (First 24 Hours)

When enabled, you receive an email **after every backup**:
- ✅ Hourly backups (07:00 - 00:00)
- ✅ Daily backup (07:00)
- ✅ Weekly backup (Sunday 07:00)

Email includes:
- Backup type (Son/Father/Grandfather)
- Timestamp
- File size
- Number of stories backed up
- Success/failure status

### Daily Summary Mode (After 24 Hours)

After 24 hours, automatically switches to **one email per day at 6 PM UK time**:
- Summary of all backups that day
- Total data backed up
- Success/failure count
- Next backup time

### Failure Alerts

If a backup fails:
- ❌ Immediate email notification (regardless of mode)
- Error details
- Stack trace for debugging

---

## Email Examples

### Success Email (Intensive Mode)

```
Subject: ✅ BubbleUp Backup Complete - SON (19:00)

BubbleUp Backup Completed Successfully

Backup Details:
--------------
Type: SON (Hourly backup)
Time: 06/10/2025, 19:00:00 UK
File: backup-2025-10-06-1900.json
Size: 167.23 KB
Stories Backed Up: 147

Backup Location:
---------------
C:\Users\m\OneDrive\Desktop\bubbleup\backups\hourly-son\backup-2025-10-06-1900.json

Retention Policy:
----------------
Hourly backups are kept for 7 days

Status: ✅ BACKUP SUCCESSFUL

---
This is an automated message from BubbleUp Backup System.
You are receiving hourly notifications for the next 24 hours.
```

### Failure Email

```
Subject: ❌ BubbleUp Backup FAILED - 19:00

BubbleUp Backup FAILED

Time: 06/10/2025, 19:00:00 UK

Error Details:
-------------
Cannot connect to Supabase

Stack Trace:
-----------
[error stack trace]

Action Required:
---------------
Please check the backup system immediately.
Run manual backup: npm run backup

Status: ❌ BACKUP FAILED

---
This is an automated alert from BubbleUp Backup System.
```

### Daily Summary Email

```
Subject: 📊 BubbleUp Daily Backup Summary - 06/10/2025

BubbleUp Daily Backup Summary

Date: 06/10/2025

Summary:
--------
Total Backups Today: 18
Total Data Backed Up: 3.01 MB
All Backups: ✅ SUCCESSFUL

Backup Timeline:
---------------
  07:00 - SON            - 0.17 MB - 147 stories
  08:00 - SON            - 0.17 MB - 147 stories
  09:00 - SON            - 0.17 MB - 147 stories
  ...
  00:00 - SON            - 0.17 MB - 147 stories

Retention Status:
----------------
Hourly (Son): Last 7 days
Daily (Father): Last 28 days
Weekly (Grandfather): Last 84 days

Next Backup: Tomorrow at 07:00 UK time

Status: ✅ ALL SYSTEMS OPERATIONAL

---
This is an automated daily summary from BubbleUp Backup System.
You will receive this summary every evening at 6 PM UK time.
```

---

## Troubleshooting

### Email Not Sending

1. Check `.env.local` has correct credentials
2. Verify app password (16 characters, no spaces in actual password)
3. Check Gmail account is not locked
4. Look for error messages in console

### Wrong Email Address

Update in `.env.local`:
```bash
BACKUP_EMAIL_TO=your.email@domain.com
```

### Change Email Account

Update both in `.env.local`:
```bash
BACKUP_EMAIL_USER=new.email@gmail.com
BACKUP_EMAIL_PASSWORD=new app password
```

---

## Security Notes

- ✅ App passwords are safer than regular passwords
- ✅ App passwords can be revoked anytime
- ✅ 2FA required for app passwords
- ⚠️  Never commit `.env.local` to git (already in `.gitignore`)
- ⚠️  Don't share app password

---

## Timeline

**Next 24 Hours**:
- Email after EVERY backup (18 emails/day)
- Helps verify system is working

**After 24 Hours**:
- One email per day at 6 PM
- Summary of all backups
- Failure alerts still immediate

**To Check Anytime**:
```bash
node email-notifier.js status
```

---

*Last updated: 2025-10-06*
