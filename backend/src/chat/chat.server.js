// src/chat/chatServer.js - CORREGIDO
import { Server } from "socket.io";
import { guardarMensaje, obtenerMensajes } from "./chat.controller.js";

export const initChatServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Usuario conectado:", socket.id);

    socket.on("registrarUsuario", (userId) => {
      socket.userId = userId;
      socket.join(`user_${userId}`); // ← Agregar a sala del usuario
      console.log(`Usuario ${userId} registrado con socket ${socket.id}`);
    });

    socket.on("solicitarHistorial", async ({ emisorId, receptorId }) => {
      try {
        console.log(`📨 Solicitando historial entre ${emisorId} y ${receptorId}`);
        const mensajes = await obtenerMensajes(emisorId, receptorId);
        console.log(`📊 Historial obtenido: ${mensajes.length} mensajes`);
        
        // DEBUG: Verificar estructura de mensajes
        if (mensajes.length > 0) {
          console.log("🔍 Primer mensaje del historial:", {
            contenido: mensajes[0].contenido,
            fecha_original: mensajes[0].fecha,
            fecha_envio: mensajes[0].fecha_envio,
            id_mensaje: mensajes[0].id_mensaje
          });
        }
        
        socket.emit("historial", mensajes);
      } catch (error) {
        console.error("❌ Error obteniendo historial:", error);
        socket.emit("historial", []);
      }
    });

    socket.on("enviarMensaje", async (data) => {
      const { emisorId, receptorId, contenido } = data;

      // Verificación para asegurar que receptorId no es nulo
      if (!receptorId) {
        console.error("❌ Error: receptorId es nulo. Mensaje no guardado.");
        return; 
      }

      console.log(`💬 Mensaje de ${emisorId} para ${receptorId}: ${contenido}`);

      try {
        const mensajeGuardado = await guardarMensaje(emisorId, receptorId, contenido);

        if (mensajeGuardado) {
          console.log("✅ Mensaje guardado:", {
            id: mensajeGuardado.id,
            fecha_envio: mensajeGuardado.fecha_envio,
            contenido: mensajeGuardado.contenido
          });

          // Emitir usando rooms (más eficiente)
          socket.to(`user_${receptorId}`).emit("recibirMensaje", mensajeGuardado);
          // También emitir al emisor para confirmación
          socket.emit("recibirMensaje", mensajeGuardado);
        } else {
          console.error("❌ No se pudo guardar el mensaje");
        }
      } catch (error) {
        console.error("❌ Error guardando mensaje:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Usuario desconectado: ${socket.id}`);
    });
  });

  return io;
};