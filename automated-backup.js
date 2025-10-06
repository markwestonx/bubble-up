#!/usr/bin/env node
/**
 * BubbleUp Automated Backup System
 * Grandfather-Father-Son rotation strategy
 *
 * Schedule:
 * - Hourly: 09:00 - 00:00 UK time (Son - kept for 7 days)
 * - Daily: One backup per day (Father - kept for 4 weeks)
 * - Weekly: One backup per week (Grandfather - kept for 12 weeks)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { sendBackupNotification, sendBackupFailureNotification, isIntensiveMode } = require('./email-notifier');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BACKUP_ROOT = path.join(__dirname, 'backups');
const SON_DIR = path.join(BACKUP_ROOT, 'hourly-son');
const FATHER_DIR = path.join(BACKUP_ROOT, 'daily-father');
const GRANDFATHER_DIR = path.join(BACKUP_ROOT, 'weekly-grandfather');

// Retention periods (in days)
const SON_RETENTION = 7;      // 7 days of hourly backups
const FATHER_RETENTION = 28;  // 4 weeks of daily backups
const GRANDFATHER_RETENTION = 84; // 12 weeks of weekly backups

function ensureDirectories() {
  [BACKUP_ROOT, SON_DIR, FATHER_DIR, GRANDFATHER_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

async function fetchAllData() {
  console.log('📥 Fetching all data from Supabase...');

  // Fetch backlog items
  const { data: backlogItems, error: backlogError } = await supabase
    .from('backlog_items')
    .select('*')
    .order('id', { ascending: true });

  if (backlogError) throw backlogError;

  // Fetch user roles
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_project_roles')
    .select('*')
    .order('created_at', { ascending: true });

  if (rolesError) throw rolesError;

  // Fetch custom order
  const { data: customOrders, error: ordersError } = await supabase
    .from('user_custom_order')
    .select('*')
    .order('created_at', { ascending: true });

  if (ordersError) throw ordersError;

  return {
    backlog_items: backlogItems,
    user_project_roles: userRoles,
    user_custom_order: customOrders
  };
}

function createBackup(data, directory, filename) {
  const timestamp = new Date().toISOString();

  const backup = {
    timestamp,
    version: '1.0',
    counts: {
      backlog_items: data.backlog_items.length,
      user_roles: data.user_project_roles.length,
      custom_orders: data.user_custom_order.length
    },
    data
  };

  const filepath = path.join(directory, filename);
  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

  const size = (fs.statSync(filepath).size / 1024).toFixed(2);
  return { filepath, size };
}

function cleanupOldBackups(directory, retentionDays) {
  const files = fs.readdirSync(directory);
  const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));

  const now = new Date();
  const cutoffDate = new Date(now.getTime() - (retentionDays * 24 * 60 * 60 * 1000));

  let deletedCount = 0;
  backupFiles.forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.mtime < cutoffDate) {
      fs.unlinkSync(filePath);
      deletedCount++;
    }
  });

  return deletedCount;
}

function getBackupType() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();

  // Weekly backup at 09:00 on Sunday
  if (dayOfWeek === 0 && hour === 9) {
    return 'grandfather';
  }

  // Daily backup at 09:00 (but not Sunday, that's grandfather)
  if (hour === 9) {
    return 'father';
  }

  // Hourly backup (09:00-00:00)
  if (hour >= 9 || hour === 0) {
    return 'son';
  }

  return null; // Outside backup window
}

async function performBackup() {
  const now = new Date();
  const ukTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  const timestamp = ukTime.toISOString().replace(/:/g, '-').split('.')[0];
  const dateStr = ukTime.toISOString().split('T')[0];
  const hourStr = String(ukTime.getHours()).padStart(2, '0');

  console.log(`\n${'='.repeat(70)}`);
  console.log(`🕐 BubbleUp Backup - ${ukTime.toLocaleString('en-GB', { timeZone: 'Europe/London' })}`);
  console.log(`${'='.repeat(70)}\n`);

  ensureDirectories();

  const backupType = getBackupType();

  if (!backupType) {
    console.log('⏸️  Outside backup window (09:00-00:00 UK time)');
    console.log('Next backup scheduled for 09:00 UK time\n');
    return;
  }

  try {
    // Fetch data
    const data = await fetchAllData();
    console.log(`✅ Fetched ${data.backlog_items.length} backlog items`);
    console.log(`✅ Fetched ${data.user_project_roles.length} user roles`);
    console.log(`✅ Fetched ${data.user_custom_order.length} custom orders\n`);

    // Create hourly backup (Son)
    const sonFilename = `backup-${dateStr}-${hourStr}00.json`;
    const sonResult = createBackup(data, SON_DIR, sonFilename);
    console.log(`💾 Hourly backup (Son): ${sonFilename} (${sonResult.size} KB)`);

    // Create daily backup at 09:00 (Father)
    if (backupType === 'father' || backupType === 'grandfather') {
      const fatherFilename = `backup-${dateStr}.json`;
      const fatherResult = createBackup(data, FATHER_DIR, fatherFilename);
      console.log(`💾 Daily backup (Father): ${fatherFilename} (${fatherResult.size} KB)`);
    }

    // Create weekly backup on Sunday 09:00 (Grandfather)
    if (backupType === 'grandfather') {
      const weekNumber = Math.ceil(ukTime.getDate() / 7);
      const grandfatherFilename = `backup-${dateStr}-week${weekNumber}.json`;
      const grandfatherResult = createBackup(data, GRANDFATHER_DIR, grandfatherFilename);
      console.log(`💾 Weekly backup (Grandfather): ${grandfatherFilename} (${grandfatherResult.size} KB)`);
    }

    console.log('');

    // Cleanup old backups
    const sonDeleted = cleanupOldBackups(SON_DIR, SON_RETENTION);
    const fatherDeleted = cleanupOldBackups(FATHER_DIR, FATHER_RETENTION);
    const grandfatherDeleted = cleanupOldBackups(GRANDFATHER_DIR, GRANDFATHER_RETENTION);

    if (sonDeleted + fatherDeleted + grandfatherDeleted > 0) {
      console.log(`🗑️  Cleaned up old backups:`);
      if (sonDeleted > 0) console.log(`   - Hourly: ${sonDeleted} backup(s) older than ${SON_RETENTION} days`);
      if (fatherDeleted > 0) console.log(`   - Daily: ${fatherDeleted} backup(s) older than ${FATHER_RETENTION} days`);
      if (grandfatherDeleted > 0) console.log(`   - Weekly: ${grandfatherDeleted} backup(s) older than ${GRANDFATHER_RETENTION} days`);
      console.log('');
    }

    // Show backup summary
    const sonFiles = fs.readdirSync(SON_DIR).filter(f => f.startsWith('backup-')).length;
    const fatherFiles = fs.readdirSync(FATHER_DIR).filter(f => f.startsWith('backup-')).length;
    const grandfatherFiles = fs.readdirSync(GRANDFATHER_DIR).filter(f => f.startsWith('backup-')).length;

    console.log(`📊 Backup Summary:`);
    console.log(`   - Hourly backups (Son): ${sonFiles} files (${SON_RETENTION} day retention)`);
    console.log(`   - Daily backups (Father): ${fatherFiles} files (${FATHER_RETENTION} day retention)`);
    console.log(`   - Weekly backups (Grandfather): ${grandfatherFiles} files (${GRANDFATHER_RETENTION} day retention)`);
    console.log('');

    console.log(`✅ Backup completed successfully!\n`);
    console.log(`📁 Backups location: ${BACKUP_ROOT}\n`);

    // Send email notification if in intensive mode or appropriate backup type
    if (isIntensiveMode() || backupType === 'father' || backupType === 'grandfather') {
      console.log('📧 Sending email notification...');
      try {
        const backupStats = fs.statSync(backupPath);
        await sendBackupNotification({
          type: backupType,
          filename: backupFilename,
          size: backupStats.size,
          count: allData.backlog_items?.length || 0,
          timestamp: new Date().toISOString()
        });
      } catch (emailErr) {
        console.warn('⚠️  Email notification failed (non-critical):', emailErr.message);
      }
    }

  } catch (err) {
    console.error('❌ Backup failed:', err);

    // Send failure notification
    try {
      await sendBackupFailureNotification(err, new Date().toISOString());
    } catch (emailErr) {
      console.warn('⚠️  Failure notification email failed:', emailErr.message);
    }

    process.exit(1);
  }
}

// Run backup if called directly
if (require.main === module) {
  performBackup();
}

module.exports = { performBackup };
