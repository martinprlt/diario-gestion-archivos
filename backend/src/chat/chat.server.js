// src/chat/chat.server.js
import { Server } from "socket.io";
import { guardarMensaje, obtenerMensajes } from "./chat.controller.js";
import jwt from 'jsonwebtoken';

export const initChatServer = (httpServer) => {
  console.log('🔧 Configurando Socket.io...');
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: false
    }
  });

  console.log('✅ Socket.io configurado con CORS:*');

  // Middleware para autenticación de sockets
  io.use((socket, next) => {
    // Intentar obtener el token de diferentes maneras
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.token || 
                  socket.handshake.query.token;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        console.log(`🔐 Usuario autenticado vía token: ${decoded.userId}`);
      } catch (error) {
        console.log('❌ Token inválido en socket');
      }
    }
    next();
  });

  io.on("connection", (socket) => {
    console.log("🟢 Usuario conectado:", socket.id);
    console.log("📋 Datos de conexión:", {
      userId: socket.userId,
      auth: socket.handshake.auth,
      headers: socket.handshake.headers
    });

    socket.on("registrarUsuario", (userId) => {
      // ✅ Usar el userId del token si está disponible, sino el que viene del evento
      const finalUserId = socket.userId || userId;
      
      if (!finalUserId) {
        console.error('❌ Error: No se pudo determinar userId para el socket');
        return;
      }
      
      socket.userId = finalUserId;
      console.log(`👤 Usuario ${finalUserId} registrado en socket ${socket.id}`);
    });

    socket.on("solicitarHistorial", async ({ emisorId, receptorId }) => {
      // ✅ Usar el userId del socket si emisorId es undefined
      const finalEmisorId = emisorId || socket.userId;
      
      if (!finalEmisorId || !receptorId) {
        console.error('❌ Error: IDs nulos en solicitarHistorial', { 
          emisorId: finalEmisorId, 
          receptorId,
          socketUserId: socket.userId
        });
        socket.emit("error", "IDs de usuario no válidos");
        return;
      }

      try {
        console.log(`📋 Solicitando historial: ${finalEmisorId} -> ${receptorId}`);
        const mensajes = await obtenerMensajes(finalEmisorId, receptorId);
        socket.emit("historial", mensajes);
      } catch (error) {
        console.error("❌ Error al obtener historial:", error);
        socket.emit("error", "No se pudo cargar el historial");
      }
    });

    socket.on("enviarMensaje", async (data) => {
      const { emisorId, receptorId, contenido } = data;
      
      // ✅ Usar el userId del socket si emisorId es undefined
      const finalEmisorId = emisorId || socket.userId;

      // ✅ VALIDACIÓN COMPLETA de datos
      if (!finalEmisorId || !receptorId) {
        console.error("❌ Error: IDs nulos en enviarMensaje", { 
          emisorId: finalEmisorId, 
          receptorId,
          socketUserId: socket.userId
        });
        socket.emit("error", "IDs de usuario no válidos");
        return; 
      }

      if (!contenido || contenido.trim() === '') {
        console.error("❌ Error: contenido vacío");
        socket.emit("error", "El mensaje no puede estar vacío");
        return;
      }

      try {
        console.log('📨 Enviando mensaje:', { 
          emisorId: finalEmisorId, 
          receptorId, 
          contenido 
        });
        
        const mensajeGuardado = await guardarMensaje(finalEmisorId, receptorId, contenido);

        if (mensajeGuardado) {
          console.log('✅ Mensaje guardado:', mensajeGuardado.id);
          // Emitir al destinatario y al emisor
          for (let [id, s] of io.sockets.sockets) {
            if (s.userId === receptorId || s.userId === finalEmisorId) {
              s.emit("recibirMensaje", mensajeGuardado);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error al enviar mensaje:", error);
        socket.emit("error", "No se pudo enviar el mensaje");
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔴 Usuario desconectado: ${socket.id} - Razón: ${reason}`);
      console.log(`👤 UserId del socket desconectado: ${socket.userId}`);
    });
  });

  return io;
};