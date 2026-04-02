const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Fetches all data from the database for backup purposes.
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
