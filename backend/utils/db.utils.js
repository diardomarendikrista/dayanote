/**
 * @fileoverview Database utility functions.
 * Provides helper methods for database-wide operations like backup data extraction.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Fetches all relevant data (users, notes, permissions) from the database for backup purposes.
 * Includes a timestamp and a version tag.
 * 
 * @async
 * @returns {Promise<{users: Array, notes: Array, permissions: Array, timestamp: string, version: string}>}
 */
const getBackupData = async () => {
  const users = await prisma.user.findMany();
  const notes = await prisma.note.findMany();
  const permissions = await prisma.permission.findMany();

  return {
    users,
    notes,
    permissions,
    timestamp: new Date().toISOString(),
    version: '1.4.0',
  };
};

module.exports = { getBackupData };
