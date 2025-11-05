import 'dotenv/config.js';
import app from './app.js';
import { testDB } from './config/db.js';
import http from 'http';
import { initChatServer } from './chat/chat.server.js';

const PORT = process.env.PORT || 5000;

// Función async para iniciar el servidor
async function startServer() {
  try {
    console.log('Probando conexión a PostgreSQL...');
    await testDB();
    console.log(' PostgreSQL conectado correctamente');

    const server = http.createServer(app);

    // Iniciar servidor de chat (Socket.io)
    initChatServer(server);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor HTTP + Chat en puerto ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Escuchando en todas las interfaces (0.0.0.0:${PORT})`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}


startServer();