/**
 * @fileoverview Backup service handling automated and manual database backups.
 * Backups are saved as JSON files and uploaded to Google Drive.
 * Uses node-cron for scheduling.
 */

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const dbUtils = require('../utils/db.utils');
const driveService = require('./drive.service');

/**
 * Configuration for backup scheduling and retention.
 */
const CRON_CONFIG = {
  /**
   * CRON schedule string. 
   * Example: '0 * / 12 * * *' -> Runs every 12 hours.
   */
  BACKUP_SCHEDULE: '0 */12 * * *',
  
  /**
   * Number of days to keep backups on Google Drive.
   */
  RETENTION_DAYS: 14
};

/**
 * Initializes the backup cron job based on CRON_CONFIG.
 */
const initCron = () => {
  console.log(`Initialising Google Drive auto-backup (Schedule: ${CRON_CONFIG.BACKUP_SCHEDULE})`);

  cron.schedule(CRON_CONFIG.BACKUP_SCHEDULE, async () => {
    try {
      await performBackup();
    } catch (error) {
      console.error('[Cron] Automated backup failed:', error.message);
    }
  });
};

/**
 * Executes the backup process:
 * 1. Generates a JSON backup from the database.
 * 2. Saves it to a temporary local file.
 * 3. Uploads the file to Google Drive.
 * 4. Cleans up old backups from Google Drive.
 * 5. Deletes the local temporary file.
 * 
 * @async
 * @returns {Promise<void>}
 */
const performBackup = async () => {
  console.log(`Running database backup process...`);
  const now = new Date();
  
  /**
   * Construct a timestamp string for the backup filename (YYYYMMDD_HHmm).
   */
  const dateStr = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    '_' + String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0');

  const backupFileName = `backup_dayanote_${dateStr}.json`;
  const tempDir = path.join(__dirname, '..', 'temp_backups');
  
  /**
   * Ensure the temporary backup directory exists.
   */
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  const backupPath = path.join(tempDir, backupFileName);

  try {
    /**
     * Fetch all relevant data for backup using dbUtils.
     */
    const backupData = await dbUtils.getBackupData();
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    console.log(`Uploading ${backupFileName} to Google Drive...`);
    const driveId = await driveService.uploadBackup(backupPath, backupFileName);
    console.log(`Backup uploaded successfully. Drive ID: ${driveId}`);

    /**
     * Cleanup old backups to stay within retention limits.
     */
    console.log(`Cleaning up Drive records older than ${CRON_CONFIG.RETENTION_DAYS} days...`);
    await driveService.cleanupOldBackups(CRON_CONFIG.RETENTION_DAYS);

    /**
     * Clean up the local temporary backup file.
     */
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
