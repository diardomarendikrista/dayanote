/**
 * @fileoverview Google Drive service for managing remote backups.
 * Handles OAuth2 authentication and file operations (list, create, delete).
 */

const { google } = require('googleapis');
const fs = require('fs');

/**
 * Initialize Google OAuth2 client with credentials from environment variables.
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

/**
 * Initialize Google Drive API client (v3).
 */
const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

/**
 * Root folder ID on Google Drive where backups will be stored.
 */
const DRIVE_ROOT_ID = process.env.DRIVE_ROOT_ID;

/**
 * Ensures a 'Backups' folder exists under the designated root on Google Drive.
 * If the folder exists, returns its ID; otherwise, creates it and returns the new ID.
 * 
 * @async
 * @returns {Promise<string>} The ID of the 'Backups' folder.
 * @throws {Error} If folder lookup or creation fails.
 */
const getOrCreateBackupFolder = async () => {
  const folderName = 'Backups';
  try {
    const response = await drive.files.list({
      q: `'${DRIVE_ROOT_ID}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
    });

    const folders = response.data.files || [];
    if (folders.length > 0) {
      return folders[0].id;
    }

    /**
     * Folder doesn't exist, so we create it.
     */
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [DRIVE_ROOT_ID]
    };

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    });

    console.log(`Created new '${folderName}' folder on Google Drive.`);
    return folder.data.id;
  } catch (error) {
    console.error('Error finding/creating Backups folder:', error);
    throw error;
  }
};

/**
 * Uploads a local file to the 'Backups' folder on Google Drive.
 * 
 * @async
 * @param {string} filePath - Local filesystem path to the file to be uploaded.
 * @param {string} fileName - Destination name for the file on Google Drive.
 * @returns {Promise<string>} The ID of the uploaded file on Drive.
 * @throws {Error} If upload fails.
 */
const uploadBackup = async (filePath, fileName) => {
  try {
    const backupFolderId = await getOrCreateBackupFolder();

    const fileMetadata = {
      name: fileName,
      parents: [backupFolderId]
    };
    const media = {
      mimeType: 'application/json',
      body: fs.createReadStream(filePath)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    });
    return response.data.id;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

/**
 * Identifies and deletes backup files on Google Drive that are older than a specific retention period.
 * 
 * @async
 * @param {number} retentionDays - The maximum age of a backup in days.
 * @returns {Promise<void>}
 */
const cleanupOldBackups = async (retentionDays) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  const rfc3339Date = cutoffDate.toISOString();

  try {
    const backupFolderId = await getOrCreateBackupFolder();

    /**
     * Query for JSON files in the backup folder created before the cutoff date.
     */
    const response = await drive.files.list({
      q: `'${backupFolderId}' in parents and mimeType='application/json' and createdTime < '${rfc3339Date}'`,
      fields: 'files(id, name, createdTime)',
    });

    const filesToDelete = response.data.files || [];
    for (const file of filesToDelete) {
      await drive.files.delete({ fileId: file.id });
      console.log(`Deleted old backup from Drive: ${file.name} (${file.createdTime})`);
    }
  } catch (error) {
    console.error('Error cleaning up old backups on Drive:', error);
  }
};

module.exports = { uploadBackup, cleanupOldBackups };
