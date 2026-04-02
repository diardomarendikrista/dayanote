const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const { WebSocketServer } = require('ws');
const createHocuspocusServer = require('./config/hocuspocus');
const { initCron } = require('./services/backup.service');

// Initialize Cron Jobs
initCron();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

// Inisialisasi Hocuspocus dengan io
const hocuspocusServer = createHocuspocusServer(io);

const jwt = require('jsonwebtoken');

// Socket.io logic
io.on('connection', (socket) => {
  // Join user's personal room for targeted notifications
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.join(`user_${decoded.id}`);
    } catch (e) { }
  }

  socket.on('join_note', (noteIds) => {
    const ids = Array.isArray(noteIds) ? noteIds : [noteIds];
    ids.forEach(id => socket.join(`note_${id}`));
  });

  socket.on('update_title', ({ noteId, title }) => {
    socket.to(`note_${noteId}`).emit('title_updated', { noteId, title });
  });
});

// WebSocket Handling
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, request) => {
  ws.on('error', (err) => {
    console.warn('[WS] Connection error (ignored):', err.code || err.message);
  });
  hocuspocusServer.handleConnection(ws, request);
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
