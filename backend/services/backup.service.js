const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const dbUtils = require('../utils/db.utils');
const driveService = require('./drive.service');

const CRON_CONFIG = {
  // '0 */12 * * *' -> Every 12 hours
  BACKUP_SCHEDULE: '0 */12 * * *',
  RETENTION_DAYS: 14
};

/**
 * Initializes the backup cron job.
 */
const initCron = () => {
  console.log(`Initialising Google Drive auto-backup (Schedule: ${CRON_CONFIG.BACKUP_SCHEDULE})`);

  cron.schedule(CRON_CONFIG.BACKUP_SCHEDULE, async () => {
    await performBackup();
  });
};

/**
 * Executes a manual backup process.
 */
const performBackup = async () => {
  console.log(`Running database backup process...`);
  const now = new Date();
  const dateStr = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    '_' + String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0');

  const backupFileName = `backup_dayanote_${dateStr}.json`;
  const tempDir = path.join(__dirname, '..', 'temp_backups');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  const backupPath = path.join(tempDir, backupFileName);

  try {
    const backupData = await dbUtils.getBackupData();
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    console.log(`Uploading ${backupFileName} to Google Drive...`);
    const driveId = await driveService.uploadBackup(backupPath, backupFileName);
    console.log(`Backup uploaded successfully. Drive ID: ${driveId}`);

    console.log(`Cleaning up Drive records older than ${CRON_CONFIG.RETENTION_DAYS} days...`);
    await driveService.cleanupOldBackups(CRON_CONFIG.RETENTION_DAYS);

    // Clean up local file
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
      console.log('Local temporary backup removed');
    }
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
};

module.exports = { initCron, performBackup };
