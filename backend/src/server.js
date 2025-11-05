// server.js (EN LA RAIZ del proyecto)
import 'dotenv/config.js';
import app from './app.js';  // ← CORREGIDO: './src/app.js' no '/app/src/src/app.js'
import { testDB } from './src/config/db.js';
import http from 'http';
import { initChatServer } from './src/chat/chat.server.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🔍 Probando conexión a PostgreSQL...');
    await testDB();
    console.log('✅ PostgreSQL conectado correctamente');

    const server = http.createServer(app);

    console.log('🔧 Inicializando servidor de chat...');
    // Iniciar servidor de chat (Socket.io)
    const io = initChatServer(server);
    
    // Verificar que Socket.io se inicializó
    console.log('✅ Socket.io inicializado:', !!io);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor HTTP + Chat en puerto ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 URL: https://diario-gestion-archivos-production.up.railway.app`);
      console.log(`🔧 CORS configurado para Socket.io`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();