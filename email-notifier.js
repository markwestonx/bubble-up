#!/usr/bin/env node
/**
 * Email Notification Module for BubbleUp Backups
 * Sends email notifications about backup status
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Email configuration (to be filled in .env.local)
const EMAIL_USER = process.env.BACKUP_EMAIL_USER || 'claude@bubble.example.com';
const EMAIL_PASSWORD = process.env.BACKUP_EMAIL_PASSWORD || '';
const EMAIL_FROM = process.env.BACKUP_EMAIL_FROM || 'Claude Backup Bot <claude@bubble.example.com>';
const EMAIL_TO = process.env.BACKUP_EMAIL_TO || 'mark.weston@regulativ.ai';

// Monitoring mode configuration
const MONITORING_FILE = path.join(__dirname, '.backup-monitoring.json');

/**
 * Get current monitoring configuration
 */
function getMonitoringConfig() {
  try {
    if (fs.existsSync(MONITORING_FILE)) {
      const config = JSON.parse(fs.readFileSync(MONITORING_FILE, 'utf8'));
      return config;
    }
  } catch (err) {
    console.error('Error reading monitoring config:', err);
  }

  // Default: intensive mode for 24 hours
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    intensiveMode: true,
    intensiveUntil: tomorrow.toISOString(),
    dailySummaryTime: '18:00' // 6 PM UK time
  };
}

/**
 * Save monitoring configuration
 */
function saveMonitoringConfig(config) {
  try {
    fs.writeFileSync(MONITORING_FILE, JSON.stringify(config, null, 2));
  } catch (err) {
    console.error('Error saving monitoring config:', err);
  }
}

/**
 * Check if we're in intensive monitoring mode
 */
function isIntensiveMode() {
  const config = getMonitoringConfig();

  if (!config.intensiveMode) {
    return false;
  }

  const now = new Date();
  const until = new Date(config.intensiveUntil);

  if (now > until) {
    // Intensive period ended, switch to daily summary mode
    config.intensiveMode = false;
    saveMonitoringConfig(config);
    return false;
  }

  return true;
}

/**
 * Create email transporter
 */
function createTransporter() {
  if (!EMAIL_PASSWORD) {
    console.warn('⚠️  Email password not configured. Skipping email notification.');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
  });
}

/**
 * Send backup success notification
 */
async function sendBackupNotification(backupInfo) {
  const transporter = createTransporter();
  if (!transporter) return;

  const { type, filename, size, count, timestamp } = backupInfo;

  const sizeKB = (size / 1024).toFixed(2);
  const sizeMB = (size / 1024 / 1024).toFixed(2);
  const displaySize = size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

  const emailBody = `
BubbleUp Backup Completed Successfully

Backup Details:
--------------
Type: ${type.toUpperCase()} (${getBackupTypeDescription(type)})
Time: ${new Date(timestamp).toLocaleString('en-GB', { timeZone: 'Europe/London' })} UK
File: ${filename}
Size: ${displaySize}
Stories Backed Up: ${count}

Backup Location:
---------------
${path.join(__dirname, 'backups', getBackupDirectory(type), filename)}

Retention Policy:
----------------
${getRetentionInfo(type)}

Status: ✅ BACKUP SUCCESSFUL

---
This is an automated message from BubbleUp Backup System.
${isIntensiveMode() ? 'You are receiving hourly notifications for the next 24 hours.' : 'Daily summary mode active.'}
  `.trim();

  const mailOptions = {
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject: `✅ BubbleUp Backup Complete - ${type.toUpperCase()} (${new Date(timestamp).toLocaleTimeString('en-GB')})`,
    text: emailBody
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Email notification sent to', EMAIL_TO);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
}

/**
 * Send backup failure notification
 */
async function sendBackupFailureNotification(error, timestamp) {
  const transporter = createTransporter();
  if (!transporter) return;

  const emailBody = `
BubbleUp Backup FAILED

Time: ${new Date(timestamp).toLocaleString('en-GB', { timeZone: 'Europe/London' })} UK

Error Details:
-------------
${error.message || error}

Stack Trace:
-----------
${error.stack || 'No stack trace available'}

Action Required:
---------------
Please check the backup system immediately.
Run manual backup: npm run backup

Status: ❌ BACKUP FAILED

---
This is an automated alert from BubbleUp Backup System.
  `.trim();

  const mailOptions = {
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject: `❌ BubbleUp Backup FAILED - ${new Date(timestamp).toLocaleTimeString('en-GB')}`,
    text: emailBody,
    priority: 'high'
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Failure alert sent to', EMAIL_TO);
  } catch (emailError) {
    console.error('❌ Error sending failure email:', emailError.message);
  }
}

/**
 * Send daily summary email
 */
async function sendDailySummary(backups) {
  const transporter = createTransporter();
  if (!transporter) return;

  const totalBackups = backups.length;
  const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
  const sizeMB = (totalSize / 1024 / 1024).toFixed(2);

  const backupList = backups.map(b => {
    const time = new Date(b.timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const size = (b.size / 1024 / 1024).toFixed(2);
    return `  ${time} - ${b.type.toUpperCase().padEnd(15)} - ${size} MB - ${b.count} stories`;
  }).join('\n');

  const emailBody = `
BubbleUp Daily Backup Summary

Date: ${new Date().toLocaleDateString('en-GB', { timeZone: 'Europe/London' })}

Summary:
--------
Total Backups Today: ${totalBackups}
Total Data Backed Up: ${sizeMB} MB
All Backups: ✅ SUCCESSFUL

Backup Timeline:
---------------
${backupList}

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
  `.trim();

  const mailOptions = {
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject: `📊 BubbleUp Daily Backup Summary - ${new Date().toLocaleDateString('en-GB')}`,
    text: emailBody
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Daily summary sent to', EMAIL_TO);
  } catch (error) {
    console.error('❌ Error sending daily summary:', error.message);
  }
}

/**
 * Helper functions
 */
function getBackupTypeDescription(type) {
  const descriptions = {
    'son': 'Hourly backup',
    'father': 'Daily backup',
    'grandfather': 'Weekly backup'
  };
  return descriptions[type] || 'Backup';
}

function getBackupDirectory(type) {
  const dirs = {
    'son': 'hourly-son',
    'father': 'daily-father',
    'grandfather': 'weekly-grandfather'
  };
  return dirs[type] || 'backups';
}

function getRetentionInfo(type) {
  const info = {
    'son': 'Hourly backups are kept for 7 days',
    'father': 'Daily backups are kept for 28 days (4 weeks)',
    'grandfather': 'Weekly backups are kept for 84 days (12 weeks)'
  };
  return info[type] || 'Standard retention policy';
}

/**
 * Enable intensive monitoring for next 24 hours
 */
function enableIntensiveMonitoring() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const config = {
    intensiveMode: true,
    intensiveUntil: tomorrow.toISOString(),
    dailySummaryTime: '18:00',
    enabledAt: now.toISOString()
  };

  saveMonitoringConfig(config);
  console.log('✅ Intensive monitoring enabled for 24 hours');
  console.log(`   Will switch to daily summaries after ${tomorrow.toLocaleString('en-GB')}`);
}

/**
 * Disable intensive monitoring (switch to daily summary)
 */
function disableIntensiveMonitoring() {
  const config = getMonitoringConfig();
  config.intensiveMode = false;
  saveMonitoringConfig(config);
  console.log('✅ Switched to daily summary mode');
}

module.exports = {
  sendBackupNotification,
  sendBackupFailureNotification,
  sendDailySummary,
  isIntensiveMode,
  enableIntensiveMonitoring,
  disableIntensiveMonitoring,
  getMonitoringConfig
};

// CLI usage
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'enable-intensive':
      enableIntensiveMonitoring();
      break;

    case 'disable-intensive':
      disableIntensiveMonitoring();
      break;

    case 'status':
      const config = getMonitoringConfig();
      console.log('Monitoring Status:', JSON.stringify(config, null, 2));
      console.log('Intensive Mode:', isIntensiveMode() ? 'ENABLED' : 'DISABLED');
      break;

    case 'test':
      // Send test email
      sendBackupNotification({
        type: 'son',
        filename: 'test-backup.json',
        size: 150000,
        count: 147,
        timestamp: new Date().toISOString()
      }).then(() => {
        console.log('Test email sent');
      });
      break;

    default:
      console.log('Usage:');
      console.log('  node email-notifier.js enable-intensive  - Enable 24-hour intensive monitoring');
      console.log('  node email-notifier.js disable-intensive - Switch to daily summary mode');
      console.log('  node email-notifier.js status           - Show monitoring status');
      console.log('  node email-notifier.js test             - Send test email');
  }
}
