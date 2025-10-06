#!/usr/bin/env node
/**
 * BubbleUp Database Backup Script
 * Creates a full backup of all backlog items with timestamp
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupDir = path.join(__dirname, 'backups');

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
    console.log('📁 Created backups directory\n');
  }

  console.log(`🔄 Starting database backup at ${new Date().toLocaleString()}...\n`);

  try {
    // Backup backlog items
    console.log('📥 Fetching backlog items...');
    const { data: backlogItems, error: backlogError } = await supabase
      .from('backlog_items')
      .select('*')
      .order('id', { ascending: true });

    if (backlogError) throw backlogError;
    console.log(`✅ Fetched ${backlogItems.length} backlog items\n`);

    // Backup user roles
    console.log('📥 Fetching user roles...');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_project_roles')
      .select('*')
      .order('created_at', { ascending: true });

    if (rolesError) throw rolesError;
    console.log(`✅ Fetched ${userRoles.length} user roles\n`);

    // Backup custom order
    console.log('📥 Fetching custom orders...');
    const { data: customOrders, error: ordersError } = await supabase
      .from('user_custom_order')
      .select('*')
      .order('created_at', { ascending: true });

    if (ordersError) throw ordersError;
    console.log(`✅ Fetched ${customOrders.length} custom order records\n`);

    // Create backup object
    const backup = {
      timestamp,
      version: '1.0',
      counts: {
        backlog_items: backlogItems.length,
        user_roles: userRoles.length,
        custom_orders: customOrders.length
      },
      data: {
        backlog_items: backlogItems,
        user_project_roles: userRoles,
        user_custom_order: customOrders
      }
    };

    // Save full backup
    const fullBackupPath = path.join(backupDir, `backup-full-${timestamp}.json`);
    fs.writeFileSync(fullBackupPath, JSON.stringify(backup, null, 2));
    console.log(`💾 Saved full backup: ${fullBackupPath}`);

    // Also save backlog-only for easy access (like current backlog.json)
    const backlogBackupPath = path.join(backupDir, `backup-backlog-${timestamp}.json`);
    fs.writeFileSync(backlogBackupPath, JSON.stringify(backlogItems, null, 2));
    console.log(`💾 Saved backlog backup: ${backlogBackupPath}`);

    // Update latest backup symlinks
    const latestFullPath = path.join(backupDir, 'latest-full.json');
    const latestBacklogPath = path.join(backupDir, 'latest-backlog.json');

    fs.writeFileSync(latestFullPath, JSON.stringify(backup, null, 2));
    fs.writeFileSync(latestBacklogPath, JSON.stringify(backlogItems, null, 2));
    console.log(`💾 Updated latest backup pointers\n`);

    // Calculate backup size
    const fullSize = (fs.statSync(fullBackupPath).size / 1024).toFixed(2);
    console.log(`📊 Backup Statistics:`);
    console.log(`   - Backlog Items: ${backlogItems.length}`);
    console.log(`   - User Roles: ${userRoles.length}`);
    console.log(`   - Custom Orders: ${customOrders.length}`);
    console.log(`   - Backup Size: ${fullSize} KB`);
    console.log(`   - Timestamp: ${timestamp}\n`);

    console.log(`✅ Backup completed successfully!\n`);
    console.log(`📁 Backups saved in: ${backupDir}`);

    // Cleanup old backups (keep last 30 days)
    cleanupOldBackups(backupDir);

  } catch (err) {
    console.error('❌ Backup failed:', err);
    process.exit(1);
  }
}

function cleanupOldBackups(backupDir) {
  try {
    const files = fs.readdirSync(backupDir);
    const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json') && !f.startsWith('latest-'));

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    let deletedCount = 0;
    backupFiles.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      console.log(`\n🗑️  Cleaned up ${deletedCount} backup(s) older than 30 days`);
    }
  } catch (err) {
    console.warn('⚠️  Warning: Could not cleanup old backups:', err.message);
  }
}

backupDatabase();
