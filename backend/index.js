/**
 * @fileoverview Main entry point for the backend server.
 * Initializes the HTTP server, Socket.io, and Hocuspocus (Y.js) server.
 * Also starts scheduled cron jobs for backups.
 */

const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const { WebSocketServer } = require('ws');
const createHocuspocusServer = require('./config/hocuspocus');
const { initCron } = require('./services/backup.service');

/**
 * Initialize Cron Jobs for automated tasks like database backups.
 */
initCron();

/**
 * Create HTTP server using the Express app.
 */
const server = http.createServer(app);

/**
 * Initialize Socket.io server with CORS enabled for all origins.
 */
const io = new Server(server, { cors: { origin: '*' } });

/**
 * Make the Socket.io instance accessible from the Express app.
 */
app.set('io', io);

/**
 * Inisialisasi Hocuspocus dengan io
 * Hocuspocus handles collaborative editing synchronization.
 */
const hocuspocusServer = createHocuspocusServer(io);

const jwt = require('jsonwebtoken');

/**
 * Socket.io connection logic.
 * Handles room joining for targeted notifications and note-specific updates.
 */
io.on('connection', (socket) => {
  // Join user's personal room for targeted notifications if token is provided
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.join(`user_${decoded.id}`);
    } catch (e) { }
  }

  /**
   * Listen for room join requests for specific notes.
   * @param {string|string[]} noteIds - ID or array of IDs of notes to join.
   */
  socket.on('join_note', (noteIds) => {
    const ids = Array.isArray(noteIds) ? noteIds : [noteIds];
    ids.forEach(id => socket.join(`note_${id}`));
  });

  /**
   * Listen for manual title updates and broadcast to the note's room.
   * @param {Object} data - Update data.
   * @param {string} data.noteId - The note ID.
   * @param {string} data.title - The new title.
   */
  socket.on('update_title', ({ noteId, title }) => {
    socket.to(`note_${noteId}`).emit('title_updated', { noteId, title });
  });
});

/**
 * Create a WebSocket server (ws) for Hocuspocus.
 * It does not listen on a separate port but handles upgrades from the main server.
 */
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, request) => {
  ws.on('error', (err) => {
    console.warn('[WS] Connection error (ignored):', err.code || err.message);
  });
  hocuspocusServer.handleConnection(ws, request);
});

/**
 * Handle HTTP protocol upgrade to WebSocket.
 * Delegates the connection to the Hocuspocus WebSocket server.
 */
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

/**
 * Set the server port and start listening.
 */
const PORT = process.env.PORT || 4015;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
