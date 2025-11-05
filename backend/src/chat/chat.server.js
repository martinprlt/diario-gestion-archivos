// src/chat/chatServer.js
import { Server } from "socket.io";
import { guardarMensaje, obtenerMensajes } from "./chat.controller.js";

export const initChatServer = (httpServer) => {
  // ✅ CONFIGURACIÓN SIMPLIFICADA Y DIRECTA
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'https://gestor-independiente.netlify.app',
        'http://localhost:5173', 
        'http://localhost:5174'
      ],
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
  console.log('🌍 Socket.io CORS configurado para producción');

  return io;
};