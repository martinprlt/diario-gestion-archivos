// src/context/ChatContext.jsx - VERSIÓN COMPATIBLE CON FAST REFRESH
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config/api";

const ChatContext = createContext();

// ✅ PRIMERO el hook personalizado (para Fast Refresh)
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de ChatProvider');
  }
  return context;
};

// ✅ LUEGO el provider
export const ChatProvider = ({ children, userId }) => {
  const [mensajes, setMensajes] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(API_URL);
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

  const value = {
    mensajes, 
    enviarMensaje, 
    solicitarHistorial
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// ✅ OPCIÓN: Export default para evitar warnings
export default ChatContext;