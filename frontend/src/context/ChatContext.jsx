// frontend/src/context/ChatContext.jsx - CONFIGURADO PARA RAILWAY
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
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    console.log('🔌 Intentando conectar a:', API_URL);
    
    const newSocket = io(API_URL, {
      // ✅ CRÍTICO PARA RAILWAY
      transports: ['websocket', 'polling'], // ⬅️ Intentar websocket primero, luego polling
      path: '/socket.io/',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
      // ✅ Debug
      autoConnect: true,
      forceNew: false
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🟢 Conectado al chat");
      console.log("🔌 Transporte usado:", newSocket.io.engine.transport.name);
      setConectado(true);
      
      if (userId) {
        console.log("📝 Registrando usuario:", userId);
        newSocket.emit("registrarUsuario", userId);
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Error de conexión:", error.message);
      console.log("🔄 Transporte fallido:", newSocket.io.engine.transport.name);
      setConectado(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔴 Desconectado del chat:", reason);
      setConectado(false);
      
      // Si fue desconexión del servidor, intentar reconectar
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Reconectado (intento ${attemptNumber})`);
      if (userId) {
        newSocket.emit("registrarUsuario", userId);
      }
    });

    newSocket.on("historial", (historial) => {
      console.log("📥 Historial recibido:", historial.length, "mensajes");
      setMensajes(historial);
    });

    newSocket.on("recibirMensaje", (nuevoMensaje) => {
      console.log("📨 Nuevo mensaje recibido:", nuevoMensaje);
      setMensajes((prev) => [...prev, nuevoMensaje]);
    });

    newSocket.on("mensajeEnviado", (mensajeConfirmado) => {
      console.log("✅ Mensaje confirmado:", mensajeConfirmado);
    });

    newSocket.on("error_mensaje", (error) => {
      console.error("❌ Error en mensaje:", error);
    });

    return () => {
      console.log("🔌 Desconectando socket...");
      newSocket.disconnect();
    };
  }, [userId]);

  const enviarMensaje = useCallback((receptorId, contenido) => {
    if (!socket) {
      console.error("❌ Socket no disponible");
      return;
    }
    
    if (!conectado) {
      console.error("❌ Socket no conectado");
      return;
    }

    const data = { emisorId: userId, receptorId, contenido };
    console.log("📤 Enviando mensaje:", data);
    socket.emit("enviarMensaje", data);
  }, [socket, userId, conectado]);

  const solicitarHistorial = useCallback((receptorId) => {
    if (!socket) {
      console.error("❌ Socket no disponible");
      return;
    }
    
    if (!conectado) {
      console.error("❌ Socket no conectado");
      return;
    }

    console.log("📥 Solicitando historial con:", receptorId);
    socket.emit("solicitarHistorial", { emisorId: userId, receptorId });
  }, [socket, userId, conectado]);

  const value = {
    mensajes, 
    enviarMensaje, 
    solicitarHistorial,
    conectado // ⬅️ AGREGAR: estado de conexión
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;