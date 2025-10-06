# BubbleUp Automated Backup System

## Overview
Since Supabase Free Plan doesn't include automated backups, this system provides local backups using the **Grandfather-Father-Son** rotation strategy.

## Backup Strategy

### Son (Hourly Backups)
- **Frequency**: Every hour from 09:00 to 00:00 (midnight) UK time
- **Retention**: 7 days
- **Location**: `backups/hourly-son/`
- **Purpose**: Quick recovery from recent changes

### Father (Daily Backups)
- **Frequency**: Once per day at 09:00 UK time
- **Retention**: 28 days (4 weeks)
- **Location**: `backups/daily-father/`
- **Purpose**: Medium-term recovery

### Grandfather (Weekly Backups)
- **Frequency**: Every Sunday at 09:00 UK time
- **Retention**: 84 days (12 weeks)
- **Location**: `backups/weekly-grandfather/`
- **Purpose**: Long-term historical backups

## What's Backed Up
- All backlog items (stories)
- User project roles
- Custom order preferences

## Setup Instructions

### Automatic Backups (Recommended)

1. **Open PowerShell as Administrator**
   - Right-click Start → Windows PowerShell (Admin)

2. **Navigate to project directory**
   ```powershell
   cd C:\Users\m\OneDrive\Desktop\bubbleup
   ```

3. **Run the setup script**
   ```powershell
   .\setup-backup-scheduler.ps1
   ```

4. **Verify in Task Scheduler**
   - Press Win+R, type `taskschd.msc`, press Enter
   - Look for "BubbleUp-Hourly-Backup" in Task Scheduler Library

### Manual Backup

Run a backup anytime with:
```bash
npm run backup
```

Or the old simple backup:
```bash
npm run backup:manual
```

## Backup Locations

All backups are stored in:
```
C:\Users\m\OneDrive\Desktop\bubbleup\backups\
├── hourly-son/         # Hourly backups (7 day retention)
├── daily-father/       # Daily backups (28 day retention)
└── weekly-grandfather/ # Weekly backups (84 day retention)
```

## Restoring from Backup

### Method 1: Using Supabase Dashboard
1. Go to Supabase Dashboard → Database → SQL Editor
2. Open a backup file (`.json`)
3. Extract the data you need from the `data` object
4. Create SQL INSERT statements to restore

### Method 2: Using a Restore Script (Coming Soon)
A restore script will be created to automate this process.

## Monitoring

### Check Last Backup
Look at the most recent file in `backups/hourly-son/`

### Check Backup Status
```bash
npm run backup
```
This will show current backup counts and sizes.

### Task Scheduler Logs
1. Open Task Scheduler (`taskschd.msc`)
2. Find "BubbleUp-Hourly-Backup"
3. Click "History" tab to see backup run history

## Maintenance

### Automatic Cleanup
The system automatically:
- Deletes hourly backups older than 7 days
- Deletes daily backups older than 28 days
- Deletes weekly backups older than 84 days

### Manual Cleanup
If you need to free up space, you can safely delete old files from the backup directories.

## Troubleshooting

### Backups Not Running
1. Check Task Scheduler is enabled
2. Verify the task "BubbleUp-Hourly-Backup" exists
3. Check task history for errors
4. Verify `.env.local` has correct Supabase credentials

### Missing Backups
1. Check Windows Task Scheduler is running
2. Ensure computer is powered on during backup hours
3. Check the `backups/` directory exists
4. Verify network connectivity (Supabase access required)

### Large Backup Files
- Backups are JSON files, typically 100-200 KB each
- With full retention: ~168 hourly + 28 daily + 12 weekly = ~208 files max
- Expected total storage: ~30-40 MB

## Important Notes

⚠️ **Keep Computer Running**: For hourly backups to work, your computer must be running during backup hours (09:00-00:00 UK time).

✅ **Backup Redundancy**: The Grandfather-Father-Son strategy ensures you always have **at least 2 good copies** at different retention levels.

🔒 **Security**: Backup files contain full database data. Keep the `backups/` directory secure. It's already in `.gitignore`.

📊 **Data Loss Protection**: With hourly backups, maximum data loss is < 1 hour during business hours.

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run backup` | Run automated backup now |
| `npm run backup:manual` | Run simple one-time backup |
| `npm run sync` | Sync and clean epic labels |
| `taskschd.msc` | Open Task Scheduler |

## Support

For issues or questions, contact Mark Weston at mark.weston@regulativ.ai
