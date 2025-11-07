import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config/api"; // ✅ Importar solo la URL base

const ChatContext = createContext();

export const ChatProvider = ({ children, userId }) => {
  const [mensajes, setMensajes] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // ✅ Usar API_URL centralizada
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

  return (
    <ChatContext.Provider value={{ mensajes, enviarMensaje, solicitarHistorial }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);