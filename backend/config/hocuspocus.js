const { Hocuspocus } = require('@hocuspocus/server');
const { Database } = require('@hocuspocus/extension-database');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const createHocuspocusServer = (io) => {
  return new Hocuspocus({
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

      if (!hasPermission && !note.isPublic) {
        throw new Error('Access denied');
      }

      const role = isOwner ? 'OWNER' : (userPermission?.role || note.publicRole);

      // Return context for other hooks
      return { user, role };
    },
    async onLoadDocument(data) {
      const { documentName } = data;
      const note = await prisma.note.findUnique({ where: { id: documentName } });
      return note?.content ? Buffer.from(note.content, 'hex') : null;
    },
    async onConnect(data) {
      const { connection, context } = data;
      // Set readOnly based on the role we determined in onAuthenticate
      if (context?.role === 'VIEWER') {
        connection.readOnly = true;
      }
    },
    extensions: [
      new Database({
        fetch: async ({ documentName }) => {
          const note = await prisma.note.findUnique({ where: { id: documentName } });
          return note?.content ? Buffer.from(note.content, 'hex') : null;
        },
        store: async ({ documentName, state }) => {
          const updatedNote = await prisma.note.update({
            where: { id: documentName },
            data: {
              content: state.toString('hex'),
              updatedAt: new Date()
            },
          });
          // Notify via Socket.io if io instance is provided
          // We send note_updated instead of document_saved for real-time sorting
          if (io) {
            io.to(`note_${documentName}`).emit('note_updated', updatedNote);
          }
        },
      }),
    ],
  });
};

module.exports = createHocuspocusServer;
