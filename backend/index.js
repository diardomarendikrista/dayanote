const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const { WebSocketServer } = require('ws');
const createHocuspocusServer = require('./config/hocuspocus');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Inisialisasi Hocuspocus dengan io
const hocuspocusServer = createHocuspocusServer(io);

// Socket.io logic
io.on('connection', (socket) => {
  socket.on('join_note', (noteId) => {
    socket.join(`note_${noteId}`);
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
