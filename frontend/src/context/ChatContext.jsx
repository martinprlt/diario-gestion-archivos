// ChatContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

const ChatContext = createContext();

export const ChatProvider = ({ children, userId }) => {
  const [mensajes, setMensajes] = useState([]);
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    // ✅ Validar userId antes de conectar
    if (!userId || userId === 'undefined') {
      console.error("❌ userId inválido en ChatProvider:", userId);
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_API_URL || 
                       "https://diario-gestion-archivos-production.up.railway.app";

    const token = localStorage.getItem("token");

    console.log("🔗 Conectando socket...");
    console.log("   URL:", SOCKET_URL);
    console.log("   userId:", userId);
    console.log("   token:", token ? "✅" : "❌");

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      query: { userId: String(userId) },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket conectado:", newSocket.id);
      setConectado(true);
      
      // Registrar usuario manualmente por seguridad
      newSocket.emit("registrarUsuario", String(userId));
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Error de conexión:", error.message);
      setConectado(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("⚠️ Desconectado:", reason);
      setConectado(false);
    });

    newSocket.on("historial", (historial) => {
      console.log("📨 Historial recibido:", historial.length, "mensajes");
      setMensajes(historial);
    });

    newSocket.on("recibirMensaje", (nuevoMensaje) => {
      console.log("📩 Nuevo mensaje:", nuevoMensaje);
      setMensajes((prev) => {
        // Evitar duplicados
        const existe = prev.some(m => m.id_mensaje === nuevoMensaje.id_mensaje);
        if (existe) return prev;
        return [...prev, nuevoMensaje];
      });
    });

    newSocket.on("error", (error) => {
      console.error("❌ Error del servidor:", error);
      alert(`Error: ${error.message}`);
    });

    return () => {
      console.log("🔌 Desconectando socket...");
      newSocket.disconnect();
    };
  }, [userId]);

  const enviarMensaje = useCallback(
    (receptorId, contenido) => {
      if (!socket || !conectado) {
        console.error("❌ Socket no conectado");
        alert("No hay conexión. Intenta recargar la página.");
        return;
      }

      if (!receptorId || receptorId === 'undefined') {
        console.error("❌ receptorId inválido:", receptorId);
        return;
      }

      if (!contenido || contenido.trim() === "") {
        console.error("❌ Mensaje vacío");
        return;
      }

      console.log("📤 Enviando mensaje:", { 
        emisorId: userId, 
        receptorId, 
        contenido: contenido.substring(0, 50) + "..." 
      });

      socket.emit("enviarMensaje", {
        emisorId: String(userId),
        receptorId: String(receptorId),
        contenido: contenido.trim(),
      });
    },
    [socket, userId, conectado]
  );

  const solicitarHistorial = useCallback(
    (receptorId) => {
      if (!socket || !conectado) {
        console.error("❌ Socket no conectado para historial");
        return;
      }

      if (!receptorId || receptorId === 'undefined') {
        console.error("❌ receptorId inválido para historial:", receptorId);
        return;
      }

      console.log("📋 Solicitando historial:", { 
        emisorId: userId, 
        receptorId 
      });

      socket.emit("solicitarHistorial", { 
        emisorId: String(userId), 
        receptorId: String(receptorId) 
      });
    },
    [socket, userId, conectado]
  );

  const value = {
    mensajes,
    enviarMensaje,
    solicitarHistorial,
    estaConectado: conectado,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat debe usarse dentro de ChatProvider");
  }
  return context;
};