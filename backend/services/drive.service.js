const { google } = require('googleapis');
const fs = require('fs');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

const DRIVE_ROOT_ID = process.env.DRIVE_ROOT_ID;

/**
 * Uploads a local file to Google Drive.
 * @param {string} filePath - Local path to the file.
 * @param {string} fileName - Name for the file on Drive.
 * @returns {Promise<string>} - The ID of the uploaded file on Drive.
 */
const uploadBackup = async (filePath, fileName) => {
  const fileMetadata = {
    name: fileName,
    parents: [DRIVE_ROOT_ID]
  };
  const media = {
    mimeType: 'application/json',
    body: fs.createReadStream(filePath)
  };

  try {
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
 * Removes files from Drive that are older than the specified retention period.
 * @param {number} retentionDays - Number of days to keep backups.
 */
const cleanupOldBackups = async (retentionDays) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  const rfc3339Date = cutoffDate.toISOString();

  try {
    const response = await drive.files.list({
      q: `'${DRIVE_ROOT_ID}' in parents and mimeType='application/json' and createdTime < '${rfc3339Date}'`,
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
