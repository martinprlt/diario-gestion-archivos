import { Server } from "socket.io";
import { guardarMensaje, obtenerMensajes } from "./chat.controller.js";

export const initChatServer = (httpServer) => {
  console.log('🔧 Configurando Socket.io...');
  
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174", 
    "https://sdgi-elindependiente.netlify.app"
  ];

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["*"]
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  console.log('✅ Socket.io CORS:', allowedOrigins.join(', '));

  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id);
    console.log("   Auth:", socket.handshake.auth);
    console.log("   Query:", socket.handshake.query);

    // Auto-registrar si viene userId en query
    const userIdFromQuery = socket.handshake.query.userId;
    if (userIdFromQuery && userIdFromQuery !== 'undefined') {
      socket.userId = userIdFromQuery;
      console.log(`✅ Usuario ${userIdFromQuery} auto-registrado`);
    }

    socket.on("registrarUsuario", (userId) => {
      if (userId && userId !== 'undefined') {
        socket.userId = userId;
        console.log(`✅ Usuario ${userId} registrado manualmente`);
      } else {
        console.error("❌ userId inválido en registrarUsuario:", userId);
      }
    });

    socket.on("solicitarHistorial", async ({ emisorId, receptorId }) => {
      console.log("📋 Solicitando historial:", { emisorId, receptorId });
      
      if (!emisorId || !receptorId || emisorId === 'undefined' || receptorId === 'undefined') {
        console.error("❌ IDs inválidos para historial");
        socket.emit("error", { message: "IDs inválidos" });
        return;
      }

      try {
        const mensajes = await obtenerMensajes(emisorId, receptorId);
        console.log(`✅ Historial: ${mensajes.length} mensajes`);
        socket.emit("historial", mensajes);
      } catch (error) {
        console.error("❌ Error en historial:", error.message);
        socket.emit("error", { message: "Error al cargar historial" });
      }
    });

    socket.on("enviarMensaje", async (data) => {
      console.log("📤 Mensaje recibido:", data);
      const { emisorId, receptorId, contenido } = data;

      // Validación exhaustiva
      if (!emisorId || emisorId === 'undefined') {
        console.error("❌ emisorId inválido:", emisorId);
        socket.emit("error", { message: "Emisor no especificado" });
        return;
      }

      if (!receptorId || receptorId === 'undefined') {
        console.error("❌ receptorId inválido:", receptorId);
        socket.emit("error", { message: "Receptor no especificado" });
        return;
      }

      if (!contenido || contenido.trim() === "") {
        console.error("❌ Contenido vacío");
        socket.emit("error", { message: "Mensaje vacío" });
        return;
      }

      try {
        const mensajeGuardado = await guardarMensaje(emisorId, receptorId, contenido);

        if (mensajeGuardado) {
          console.log("✅ Mensaje guardado:", mensajeGuardado.id_mensaje);
          
          // Emitir a todos los sockets relevantes
          let enviados = 0;
          for (let [id, s] of io.sockets.sockets) {
            if (s.userId === String(receptorId) || s.userId === String(emisorId)) {
              s.emit("recibirMensaje", mensajeGuardado);
              enviados++;
            }
          }
          console.log(`✅ Emitido a ${enviados} sockets`);
        }
      } catch (error) {
        console.error("❌ Error guardando mensaje:", error.message);
        socket.emit("error", { message: "Error al enviar mensaje" });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔴 Cliente desconectado: ${socket.id} - ${reason}`);
    });

    socket.on("error", (error) => {
      console.error("❌ Error en socket:", error);
    });
  });

  console.log('✅ Listeners configurados');
  return io;
};