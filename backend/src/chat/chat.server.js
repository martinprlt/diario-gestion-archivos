// src/chat/chat.server.js - ACTUALIZADO
import { Server } from "socket.io";
import { guardarMensaje, obtenerMensajes } from "./chat.controller.js";

export const initChatServer = (httpServer) => {
  // Configuración CORS sincronizada con app.js
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://sgdi-independiente.up.railway.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    },
    // Configuración adicional para producción
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on("connection", (socket) => {
    console.log("🟢 Usuario conectado al chat:", socket.id);

    socket.on("registrarUsuario", (userId) => {
      if (!userId) {
        console.log("❌ userId no proporcionado");
        return;
      }
      
      socket.userId = userId;
      socket.join(`user_${userId}`);
      console.log(`👤 Usuario ${userId} registrado en sala user_${userId}`);
      
      // Debug: listar salas
      const rooms = Array.from(socket.rooms);
      console.log(`🏠 Socket ${socket.id} en salas:`, rooms);
    });

    socket.on("solicitarHistorial", async ({ emisorId, receptorId }) => {
      try {
        console.log(`📨 Solicitando historial entre ${emisorId} y ${receptorId}`);
        
        if (!emisorId || !receptorId) {
          console.log("❌ IDs no válidos para historial");
          socket.emit("historial", []);
          return;
        }
        
        const mensajes = await obtenerMensajes(emisorId, receptorId);
        console.log(`📊 Historial obtenido: ${mensajes.length} mensajes`);
        
        socket.emit("historial", mensajes);
      } catch (error) {
        console.error("❌ Error obteniendo historial:", error);
        socket.emit("historial", []);
      }
    });

    socket.on("enviarMensaje", async (data) => {
      const { emisorId, receptorId, contenido } = data;

      // Validaciones
      if (!receptorId) {
        console.error("❌ Error: receptorId es nulo");
        socket.emit("error_mensaje", { error: "receptorId es requerido" });
        return; 
      }

      if (!contenido || contenido.trim() === '') {
        console.error("❌ Error: contenido vacío");
        socket.emit("error_mensaje", { error: "El mensaje no puede estar vacío" });
        return;
      }

      console.log(`💬 Mensaje de ${emisorId} para ${receptorId}: ${contenido}`);

      try {
        const mensajeGuardado = await guardarMensaje(emisorId, receptorId, contenido);

        if (mensajeGuardado) {
          console.log("✅ Mensaje guardado en BD:", mensajeGuardado.id);

          // Emitir al receptor (si está conectado)
          socket.to(`user_${receptorId}`).emit("recibirMensaje", mensajeGuardado);
          
          // Confirmación al emisor
          socket.emit("mensajeEnviado", mensajeGuardado);
          
          console.log(`📤 Mensaje enviado a sala user_${receptorId}`);
        } else {
          console.error("❌ No se pudo guardar el mensaje");
          socket.emit("error_mensaje", { error: "No se pudo guardar el mensaje" });
        }
      } catch (error) {
        console.error("❌ Error guardando mensaje:", error);
        socket.emit("error_mensaje", { error: "Error del servidor" });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔴 Usuario desconectado: ${socket.id} - Razón: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error(`💥 Error en socket ${socket.id}:`, error);
    });
  });

  console.log('✅ Servidor de Chat inicializado con CORS:', allowedOrigins);
  return io;
};