// src/chat/chat.server.js
import { Server } from "socket.io";
import { guardarMensaje, obtenerMensajes } from "./chat.controller.js";

export const initChatServer = (httpServer) => {
  // ✅ CONFIGURACIÓN SUPER PERMISIVA TEMPORAL
  const io = new Server(httpServer, {
    cors: {
      origin: "*",  // ← PERMITE TODOS LOS ORÍGENES
      methods: ["GET", "POST"],
      credentials: false  // ← IMPORTANTE: false cuando origin es "*"
    }
  });

  console.log('💬 Servidor de chat inicializado - CORS: *');
  console.log('🚨 MODO PERMISIVO TEMPORAL - CORS PARA TODOS LOS ORÍGENES');

  io.on("connection", (socket) => {
    console.log("🟢 Usuario conectado:", socket.id, 'Origen:', socket.handshake.headers.origin);

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

  return io;
};