// src/chat/chatServer.js
import { Server } from "socket.io";
import { guardarMensaje, obtenerMensajes } from "./chat.controller.js";

export const initChatServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173", // ajusta según tu Vite
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Usuario conectado:", socket.id);

    socket.on("registrarUsuario", (userId) => {
      socket.userId = userId;
      console.log(`Usuario ${userId} registrado con socket ${socket.id}`);
    });

    socket.on("solicitarHistorial", async ({ emisorId, receptorId }) => {
      const mensajes = await obtenerMensajes(emisorId, receptorId);
      socket.emit("historial", mensajes);
    });

    socket.on("enviarMensaje", async (data) => {
      const { emisorId, receptorId, contenido } = data;

      // Verificación para asegurar que receptorId no es nulo
      if (!receptorId) {
        console.error("❌ Error: receptorId es nulo. Mensaje no guardado.");
        return; 
      }

      const mensajeGuardado = await guardarMensaje(emisorId, receptorId, contenido);

      if (mensajeGuardado) {
        // Emitir al destinatario y al emisor
        for (let [id, s] of io.sockets.sockets) {
          if (s.userId === receptorId || s.userId === emisorId) {
            s.emit("recibirMensaje", mensajeGuardado);
          }
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Usuario desconectado: ${socket.id}`);
    });
  });

  return io;
};
