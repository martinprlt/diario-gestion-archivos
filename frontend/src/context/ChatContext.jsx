import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

const ChatContext = createContext();

export const ChatProvider = ({ children, userId }) => {
  const [mensajes, setMensajes] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🟢 Conectado al chat");
      if (userId) {
        newSocket.emit("registrarUsuario", userId);
      }
    });

    newSocket.on("historial", (historial) => {
      setMensajes(historial);
    });

    newSocket.on("recibirMensaje", (nuevoMensaje) => {
      setMensajes((prev) => [...prev, nuevoMensaje]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const enviarMensaje = useCallback((receptorId, contenido) => {
    if (socket) {
      const data = { emisorId: userId, receptorId, contenido };
      socket.emit("enviarMensaje", data);
    }
  }, [socket, userId]);

  const solicitarHistorial = useCallback((receptorId) => {
    if (socket) {
      socket.emit("solicitarHistorial", { emisorId: userId, receptorId });
    }
  }, [socket, userId]);

  return (
    <ChatContext.Provider value={{ mensajes, enviarMensaje, solicitarHistorial }}>
      {children}
    </ChatContext.Provider>
  );
};

// ⭐ Exportar el hook en la misma línea para evitar el warning
export const useChat = () => useContext(ChatContext);