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
const authMiddleware = require('./middlewares/auth.middleware');

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
app.get('/api/notes/:id', authMiddleware, noteController.getNote);
app.put('/api/notes/:id', authMiddleware, noteController.updateNote);
app.delete('/api/notes/:id', authMiddleware, noteController.deleteNote);

// Socket.io for global toast notifications
io.on('connection', (socket) => {
  socket.on('join_note', (noteId) => {
    socket.join(`note_${noteId}`);
  });
});

// Hocuspocus Server
const hocuspocusServer = new Hocuspocus({
  port: process.env.PORT || 4015,
  async onAuthenticate(data) {
    const { token } = data;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return {
        user: { id: decoded.id, name: decoded.name },
      };
    } catch (e) {
      return null; // Deny access
    }
  },
  extensions: [
    new Database({
      fetch: async ({ documentName }) => {
        const note = await prisma.note.findUnique({
          where: { id: documentName },
        });
        // Hocuspocus expects a Uint8Array for binary data (Yjs state)
        // If we store it as a Buffer in JSONB or separate field, we return it.
        // For simplicity, we assume 'content' might store the Yjs update buffer as binary if we use another field, 
        // but Prisma JSONB might not be best for binary. 
        // Let's assume we store it as stringified JSON or hex for now if needed, 
        // or just return null to start a new document if empty.
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

server.on('upgrade', (request, socket, head) => {
  hocuspocusServer.handleUpgrade(request, socket, head);
});

const PORT = process.env.PORT || 4015;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
