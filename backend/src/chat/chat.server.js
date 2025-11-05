// src/chat/chat.server.js
import { Server } from "socket.io";
import { guardarMensaje, obtenerMensajes } from "./chat.controller.js";

export const initChatServer = (httpServer) => {
  console.log('🔧 Inicializando Socket.IO...');
  
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174", 
        "https://sdgi-elindependiente.netlify.app"
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  console.log('✅ Socket.IO configurado');

  io.on("connection", (socket) => {
    console.log("🟢 Usuario conectado:", socket.id);
    console.log("🔐 Auth:", socket.handshake.auth);
    console.log("🔐 Query:", socket.handshake.query);

    // Auto-registrar si viene userId en query
    const userIdFromQuery = socket.handshake.query.userId;
    if (userIdFromQuery) {
      socket.userId = userIdFromQuery;
      console.log(`✅ Usuario ${userIdFromQuery} auto-registrado desde query`);
    }

    socket.on("registrarUsuario", (userId) => {
      socket.userId = userId;
      console.log(`✅ Usuario ${userId} registrado manualmente con socket ${socket.id}`);
    });

    socket.on("solicitarHistorial", async ({ emisorId, receptorId }) => {
      console.log("📋 Solicitando historial:", { emisorId, receptorId });
      
      if (!emisorId || !receptorId) {
        console.error("❌ Faltan IDs para historial");
        socket.emit("error", { message: "IDs incompletos para historial" });
        return;
      }

      try {
        const mensajes = await obtenerMensajes(emisorId, receptorId);
        console.log(`✅ Historial obtenido: ${mensajes.length} mensajes`);
        socket.emit("historial", mensajes);
      } catch (error) {
        console.error("❌ Error obteniendo historial:", error.message);
        socket.emit("error", { message: "Error al cargar historial" });
      }
    });

    socket.on("enviarMensaje", async (data) => {
      console.log("📤 Datos de mensaje recibidos:", data);
      const { emisorId, receptorId, contenido } = data;

      // Validación exhaustiva
      if (!receptorId) {
        console.error("❌ receptorId es null/undefined");
        socket.emit("error", { message: "Receptor no especificado" });
        return;
      }

      if (!emisorId) {
        console.error("❌ emisorId es null/undefined");
        socket.emit("error", { message: "Emisor no especificado" });
        return;
      }

      if (!contenido || contenido.trim() === "") {
        console.error("❌ contenido vacío");
        socket.emit("error", { message: "Mensaje vacío" });
        return;
      }

      try {
        const mensajeGuardado = await guardarMensaje(emisorId, receptorId, contenido);

        if (mensajeGuardado) {
          console.log("✅ Mensaje guardado:", mensajeGuardado.id_mensaje);
          
          // Emitir a todos los sockets del emisor y receptor
          let enviados = 0;
          for (let [id, s] of io.sockets.sockets) {
            if (s.userId === receptorId || s.userId === emisorId) {
              s.emit("recibirMensaje", mensajeGuardado);
              enviados++;
              console.log(`📨 Mensaje enviado a socket ${s.id} (userId: ${s.userId})`);
            }
          }
          console.log(`✅ Mensaje emitido a ${enviados} sockets`);
        }
      } catch (error) {
        console.error("❌ Error procesando mensaje:", error);
        socket.emit("error", { message: "Error al enviar mensaje" });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔴 Usuario desconectado: ${socket.id}, razón: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error("❌ Error en socket:", error);
    });
  });

  console.log('✅ Listeners de Socket.IO configurados');
  return io;
};