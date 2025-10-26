// src/chat/chatServer.js
import { Server } from "socket.io";
import { guardarMensaje, obtenerMensajes } from "./chat.controller.js";

export const initChatServer = (httpServer) => {
  // ⭐ CONFIGURAR CORS DINÁMICAMENTE
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
    : ['http://localhost:5173', 'http://localhost:5174'];

  const io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        // Permitir requests sin origin (apps móviles, Postman)
        if (!origin) return callback(null, true);
        
        // En producción, verificar contra lista de orígenes permitidos
        if (process.env.NODE_ENV === 'production') {
          if (allowedOrigins.includes(origin)) {
            console.log('✅ Socket.io: Origen permitido:', origin);
            callback(null, true);
          } else {
            console.warn('❌ Socket.io bloqueado por CORS:', origin);
            callback(new Error('CORS not allowed'));
          }
        } else {
          // En desarrollo, permitir cualquier origen localhost
          console.log('🔧 Socket.io (dev): Origen permitido:', origin);
          callback(null, true);
        }
      },
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Usuario conectado:", socket.id);

    socket.on("registrarUsuario", (userId) => {
      socket.userId = userId;
      console.log(`👤 Usuario ${userId} registrado con socket ${socket.id}`);
    });

    socket.on("solicitarHistorial", async ({ emisorId, receptorId }) => {
      try {
        const mensajes = await obtenerMensajes(emisorId, receptorId);
        socket.emit("historial", mensajes);
      } catch (error) {
        console.error("❌ Error al obtener historial:", error);
        socket.emit("error", "No se pudo cargar el historial");
      }
    });

    socket.on("enviarMensaje", async (data) => {
      const { emisorId, receptorId, contenido } = data;

      // Verificación para asegurar que receptorId no es nulo
      if (!receptorId) {
        console.error("❌ Error: receptorId es nulo. Mensaje no guardado.");
        socket.emit("error", "Receptor no válido");
        return; 
      }

      try {
        const mensajeGuardado = await guardarMensaje(emisorId, receptorId, contenido);

        if (mensajeGuardado) {
          // Emitir al destinatario y al emisor
          for (let [id, s] of io.sockets.sockets) {
            if (s.userId === receptorId || s.userId === emisorId) {
              s.emit("recibirMensaje", mensajeGuardado);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error al enviar mensaje:", error);
        socket.emit("error", "No se pudo enviar el mensaje");
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Usuario desconectado: ${socket.id}`);
    });
  });

  console.log('💬 Servidor de chat inicializado');
  console.log('🌍 Orígenes permitidos para Socket.io:', allowedOrigins);

  return io;
};