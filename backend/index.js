require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { Hocuspocus } = require('@hocuspocus/server');
const { Database } = require('@hocuspocus/extension-database');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const authController = require('./controllers/auth.controller');
const noteController = require('./controllers/note.controller');
const authMiddleware = require('./middlewares/auth.middleware').authMiddleware;
const optionalAuthMiddleware = require('./middlewares/auth.middleware').optionalAuthMiddleware;

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Note routes
app.get('/api/notes', authMiddleware, noteController.getNotes);
app.post('/api/notes', authMiddleware, noteController.createNote);
app.get('/api/notes/:id', optionalAuthMiddleware, noteController.getNote);
app.put('/api/notes/:id', authMiddleware, noteController.updateNote);
app.delete('/api/notes/:id', authMiddleware, noteController.deleteNote);

// Permission routes
app.post('/api/notes/:id/permissions', authMiddleware, noteController.addPermission);
app.delete('/api/notes/:id/permissions/:userId', authMiddleware, noteController.removePermission);

// Socket.io for global toast notifications
io.on('connection', (socket) => {
  socket.on('join_note', (noteId) => {
    socket.join(`note_${noteId}`);
  });
});

// Hocuspocus Server
const hocuspocusServer = new Hocuspocus({
  async onAuthenticate(data) {
    const { token, documentName } = data;

    // 1. Identify User
    let user = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = { id: decoded.id, name: decoded.name };
      } catch (e) {
        // Invalid token? Treat as guest if we want to support public access
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
        // We already handled fetching in onLoadDocument, but Database extension might call this.
        // Hocuspocus documentation says onLoadDocument is the entry point if provided.
        // Let's keep this as fallback.
        const note = await prisma.note.findUnique({
          where: { id: documentName },
        });
        return note?.content ? Buffer.from(note.content, 'hex') : null;
      },
      store: async ({ documentName, state }) => {
        // Save the binary state as hex string in the database
        await prisma.note.update({
          where: { id: documentName },
          data: {
            content: state.toString('hex'),
            updatedAt: new Date()
          },
        });

        // Emit saved event via Socket.io
        io.to(`note_${documentName}`).emit('document_saved', { noteId: documentName });
      },
    }),
  ],
});

const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, request) => {
  // Prevent invalid WebSocket frames from crashing the process
  ws.on('error', (err) => {
    console.warn('[WS] Connection error (ignored):', err.code || err.message);
  });
  hocuspocusServer.handleConnection(ws, request);
});

wss.on('error', (err) => {
  console.warn('[WS Server] Error (ignored):', err.message);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

const PORT = process.env.PORT || 4015;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
