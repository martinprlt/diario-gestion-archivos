// server.js
import 'dotenv/config.js';
import app from './src/app.js';
import { testDB } from './src/config/db.js';
import http from 'http';
import { initChatServer } from './src/chat/chat.server.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🔍 Probando conexión a PostgreSQL...');
    await testDB();
    console.log('✅ PostgreSQL conectado');

    const server = http.createServer(app);

    console.log('🔧 Inicializando servidor de chat...');
    const io = initChatServer(server);
    console.log('✅ Socket.io listo:', !!io);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor en puerto ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 URL: https://diario-gestion-archivos-production.up.railway.app`);
    });

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

startServer();