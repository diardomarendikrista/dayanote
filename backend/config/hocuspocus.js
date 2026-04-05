/**
 * @fileoverview Hocuspocus server configuration.
 * Hocuspocus is a collaborative editing server for Y.js.
 * This module integrates Y.js documents with Prisma for persistence and Socket.io for real-time notifications.
 */

const { Hocuspocus } = require('@hocuspocus/server');
const { Database } = require('@hocuspocus/extension-database');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

/**
 * Creates and configures a Hocuspocus server instance.
 * 
 * @param {Object} io - Socket.io instance for broadcasting updates.
 * @returns {Hocuspocus} A configured Hocuspocus server instance.
 */
const createHocuspocusServer = (io) => {
  return new Hocuspocus({
    /**
     * Authentication hook.
     * Verifies the user's JWT and checks their permission for the specific document (note).
     * 
     * @param {Object} data - Authentication data.
     * @param {string} data.token - JWT token.
     * @param {string} data.documentName - ID of the note being accessed.
     * @returns {Object} context - User and role info to be used in other hooks.
     * @throws {Error} If note is not found or access is denied.
     */
    async onAuthenticate(data) {
      const { token, documentName } = data;

      // 1. Identify User
      let user = null;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          user = { id: decoded.id, name: decoded.name };
        } catch (e) {
          // Invalid token? Treat as guest
        }
      }

      if (!user) {
        /**
         * Fallback for unauthenticated users (Guests).
         */
        user = { id: `guest_${Math.random().toString(36).substr(2, 9)}`, name: 'Guest', isGuest: true };
      }

      // 2. Check Permissions for this specific document
      const note = await prisma.note.findUnique({
        where: { id: documentName },
        include: { permissions: true }
      });

      if (!note) throw new Error('Note not found');

      const isOwner = note.ownerId === user.id;
      const userPermission = note.permissions.find(p => p.userId === user.id);
      const hasPermission = userPermission || isOwner;

      /**
       * Access check: Only allow access if the user has explicit permission OR the note is public.
       */
      if (!hasPermission && !note.isPublic) {
        throw new Error('Access denied');
      }

      const role = isOwner ? 'OWNER' : (userPermission?.role || note.publicRole);

      // Return context for other hooks
      return { user, role };
    },

    /**
     * Hook called when a document is first requested.
     * Retrieves the binary Y.js state from the database.
     */
    async onLoadDocument(data) {
      const { documentName } = data;
      const note = await prisma.note.findUnique({ where: { id: documentName } });
      return note?.content ? Buffer.from(note.content, 'hex') : null;
    },

    /**
     * Hook called when a client connects.
     * Sets the connection to read-only if the user has a 'VIEWER' role.
     */
    async onConnect(data) {
      const { connection, context } = data;
      if (context?.role === 'VIEWER') {
        connection.readOnly = true;
      }
    },

    /**
     * Extensions for additional functionality.
     */
    extensions: [
      /**
       * Database extension for automatic persistence of Y.js documents.
       */
      new Database({
        /**
         * Fetch the current state from the database.
         */
        fetch: async ({ documentName }) => {
          const note = await prisma.note.findUnique({ where: { id: documentName } });
          return note?.content ? Buffer.from(note.content, 'hex') : null;
        },
        /**
         * Persist the updated state to the database.
         * Also broadcasts a 'note_updated' event via Socket.io for real-time list sorting.
         */
        store: async ({ documentName, state }) => {
          const updatedNote = await prisma.note.update({
            where: { id: documentName },
            data: {
              content: state.toString('hex'),
              updatedAt: new Date()
            },
          });
          
          if (io) {
            io.to(`note_${documentName}`).emit('note_updated', updatedNote);
          }
        },
      }),
    ],
  });
};

module.exports = createHocuspocusServer;
