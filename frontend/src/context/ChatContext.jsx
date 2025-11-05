// ChatContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/api.js";

const ChatContext = createContext();

export const ChatProvider = ({ children, userId }) => {
  const [mensajes, setMensajes] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const SOCKET_URL =
      import.meta.env.VITE_API_URL ||
      "https://diario-gestion-archivos-production.up.railway.app" ||
      `${API_BASE_URL}`;

    const token = localStorage.getItem("token");

    console.log("🔗 Conectando socket a:", SOCKET_URL);
    console.log("🔗 userId:", userId);
    console.log("🔐 token existe:", !!token);

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      query: { userId: String(userId) }, // ✅ Convertir a string por seguridad
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    setSocket(newSocket);

    // ✅ Eventos de conexión
    newSocket.on("connect", () => {
      console.log("✅ Socket conectado:", newSocket.id);
      if (userId) {
        console.log("👤 Registrando usuario en socket:", userId);
        newSocket.emit("registrarUsuario", userId);
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Error de conexión al socket:", error.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket desconectado:", reason);
    });

    // ✅ Recepción de historial
    newSocket.on("historial", (historial) => {
      console.log("📨 Historial recibido:", historial.length, "mensajes");
      setMensajes(historial);
    });

    // ✅ Recepción de mensajes nuevos
    newSocket.on("recibirMensaje", (nuevoMensaje) => {
      console.log("📩 Nuevo mensaje recibido:", nuevoMensaje);
      setMensajes((prev) => [...prev, nuevoMensaje]);
    });

    newSocket.on("error", (error) => {
      console.error("❌ Error en socket:", error);
    });

    // ✅ Cleanup al desmontar
    return () => {
      console.log("🔌 Desconectando socket...");
      newSocket.disconnect();
    };
  }, [userId]);

  // ✅ Enviar mensaje
  const enviarMensaje = useCallback(
    (receptorId, contenido) => {
      if (socket && userId) {
        console.log("📤 Enviando mensaje:", { userId, receptorId, contenido });
        socket.emit("enviarMensaje", {
          emisorId: userId,
          receptorId,
          contenido,
        });
      } else {
        console.error("❌ No se puede enviar mensaje:", {
          socket: !!socket,
          userId,
        });
      }
    },
    [socket, userId]
  );

  // ✅ Solicitar historial
  const solicitarHistorial = useCallback(
    (receptorId) => {
      if (socket && userId) {
        console.log("📋 Solicitando historial:", { userId, receptorId });
        socket.emit("solicitarHistorial", { emisorId: userId, receptorId });
      } else {
        console.error("❌ No se puede solicitar historial:", {
          socket: !!socket,
          userId,
        });
      }
    },
    [socket, userId]
  );

  const value = {
    mensajes,
    enviarMensaje,
    solicitarHistorial,
    estaConectado: !!socket?.connected,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
