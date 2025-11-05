// src/chat/chat.server.js
import { Server } from "socket.io";
import { guardarMensaje, obtenerMensajes } from "./chat.controller.js";

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

  io.on("connection", (socket) => {
    console.log("🟢 Usuario conectado:", socket.id, 'Origen:', socket.handshake.headers.origin);

    socket.on("registrarUsuario", (userId) => {
      // ✅ VALIDAR que userId no sea null
      if (!userId) {
        console.error('❌ Error: userId es null en registrarUsuario');
        return;
      }
      socket.userId = userId;
      console.log(`👤 Usuario ${userId} registrado`);
    });

    socket.on("solicitarHistorial", async ({ emisorId, receptorId }) => {
      // ✅ VALIDAR IDs antes de proceder
      if (!emisorId || !receptorId) {
        console.error('❌ Error: IDs nulos en solicitarHistorial', { emisorId, receptorId });
        socket.emit("error", "IDs de usuario no válidos");
        return;
      }

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

      // ✅ VALIDACIÓN COMPLETA de datos
      if (!emisorId || !receptorId) {
        console.error("❌ Error: IDs nulos en enviarMensaje", { emisorId, receptorId });
        socket.emit("error", "IDs de usuario no válidos");
        return; 
      }

      if (!contenido || contenido.trim() === '') {
        console.error("❌ Error: contenido vacío");
        socket.emit("error", "El mensaje no puede estar vacío");
        return;
      }

      try {
        console.log('📨 Enviando mensaje:', { emisorId, receptorId, contenido });
        const mensajeGuardado = await guardarMensaje(emisorId, receptorId, contenido);

        if (mensajeGuardado) {
          console.log('✅ Mensaje guardado:', mensajeGuardado.id);
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