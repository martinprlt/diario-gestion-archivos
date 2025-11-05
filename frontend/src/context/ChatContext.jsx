import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from '../config/api.js'

const ChatContext = createContext();

export const ChatProvider = ({ children, userId }) => {
  const [mensajes, setMensajes] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}`;
    const token = localStorage.getItem('token'); // ✅ OBTENER EL TOKEN
    
    console.log("🔗 Conectando socket con:", { userId, token: !!token });
    
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token // ✅ ENVIAR EL TOKEN EN LA CONEXIÓN
      },
      query: {
        userId: userId // ✅ TAMBIÉN ENVIAR EL USER ID EN QUERY
      }
    });
    
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🟢 Conectado al chat, userId:", userId);
      console.log("🔐 Socket auth:", newSocket.auth);
      
      if (userId) {
        console.log("👤 Registrando usuario en socket:", userId);
        newSocket.emit("registrarUsuario", userId);
      }
    });

    newSocket.on("historial", (historial) => {
      console.log("📨 Historial recibido:", historial.length, "mensajes");
      setMensajes(historial);
    });

    newSocket.on("recibirMensaje", (nuevoMensaje) => {
      console.log("📩 Nuevo mensaje recibido:", nuevoMensaje);
      setMensajes((prev) => [...prev, nuevoMensaje]);
    });

    newSocket.on("error", (error) => {
      console.error("❌ Error en socket:", error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const enviarMensaje = useCallback((receptorId, contenido) => {
    if (socket && userId) {
      console.log("📤 Enviando mensaje:", { userId, receptorId, contenido });
      const data = { emisorId: userId, receptorId, contenido };
      socket.emit("enviarMensaje", data);
    } else {
      console.error("❌ No se puede enviar mensaje:", { 
        socket: !!socket, 
        userId 
      });
    }
  }, [socket, userId]);

  const solicitarHistorial = useCallback((receptorId) => {
    if (socket && userId) {
      console.log("📋 Solicitando historial:", { userId, receptorId });
      socket.emit("solicitarHistorial", { emisorId: userId, receptorId });
    } else {
      console.error("❌ No se puede solicitar historial:", { 
        socket: !!socket, 
        userId 
      });
    }
  }, [socket, userId]);

  const value = {
    mensajes,
    enviarMensaje,
    solicitarHistorial,
    estaConectado: !!socket?.connected
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);