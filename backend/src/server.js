// src/server.js
import 'dotenv/config.js';
import app from './app.js';
import { testDB } from './config/db.js';
import http from 'http';
import { initChatServer } from './chat/chat.server.js';

const PORT = process.env.PORT || 5000;

// Probar conexión con PostgreSQL
await testDB();

// Crear servidor HTTP base
const server = http.createServer(app);

// Iniciar servidor de chat (Socket.io)
initChatServer(server);

server.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP + Chat en http://localhost:${PORT}`);
});
