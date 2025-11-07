// frontend/src/context/ChatContext.jsx - MEJORADO
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config/api";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children, userId }) => {
  const [mensajes, setMensajes] = useState([]);
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [intentosReconexion, setIntentosReconexion] = useState(0);

  useEffect(() => {
    console.log('🔌 Iniciando conexión Socket.IO a:', API_URL);
    
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity, // ← Reconectar indefinidamente
      timeout: 20000,
      autoConnect: true,
      forceNew: false
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🟢 Conectado al chat - ID:", newSocket.id);
      console.log("🔌 Transporte:", newSocket.io.engine.transport.name);
      setConectado(true);
      setIntentosReconexion(0);
      
      if (userId) {
        console.log("📝 Registrando usuario:", userId);
        newSocket.emit("registrarUsuario", parseInt(userId));
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Error de conexión:", error.message);
      setConectado(false);
      
      // Intentar reconexión con backoff
      setTimeout(() => {
        setIntentosReconexion(prev => prev + 1);
        if (intentosReconexion < 5) {
          console.log(`🔄 Intento de reconexión ${intentosReconexion + 1}`);
          newSocket.connect();
        }
      }, Math.min(1000 * Math.pow(2, intentosReconexion), 30000));
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔴 Desconectado:", reason);
      setConectado(false);
      
      if (reason === 'io server disconnect') {
        // El servidor forzó la desconexión, reconectar manualmente
        newSocket.connect();
      }
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Reconectado (intento ${attemptNumber})`);
      setConectado(true);
      if (userId) {
        newSocket.emit("registrarUsuario", parseInt(userId));
      }
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Intentando reconectar... (${attemptNumber})`);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("❌ Falló la reconexión después de múltiples intentos");
    });

    // Manejo de mensajes
    newSocket.on("historial", (historial) => {
      console.log("📥 Historial recibido:", historial?.length || 0, "mensajes");
      setMensajes(historial || []);
    });

    newSocket.on("recibirMensaje", (nuevoMensaje) => {
      console.log("📨 Nuevo mensaje recibido:", nuevoMensaje);
      setMensajes((prev) => [...prev, nuevoMensaje]);
    });

    newSocket.on("mensajeEnviado", (mensajeConfirmado) => {
      console.log("✅ Mensaje confirmado:", mensajeConfirmado);
      // Actualizar el mensaje local con los datos del servidor
      setMensajes((prev) => 
        prev.map(msg => 
          msg.tempId === mensajeConfirmado.tempId ? mensajeConfirmado : msg
        )
      );
    });

    newSocket.on("error_mensaje", (error) => {
      console.error("❌ Error en mensaje:", error);
    });

    return () => {
      console.log("🔌 Limpiando conexión Socket.IO");
      newSocket.disconnect();
    };
  }, [userId, intentosReconexion]);

  const enviarMensaje = useCallback((receptorId, contenido) => {
    if (!socket || !conectado) {
      console.error("❌ Socket no disponible o no conectado");
      return null;
    }

    const tempId = Date.now(); // ID temporal para optimismo
    const data = { 
      emisorId: parseInt(userId), 
      receptorId: parseInt(receptorId), 
      contenido: contenido.trim()
    };
    
    console.log("📤 Enviando mensaje:", data);
    
    // Optimistic update
    const mensajeOptimista = {
      id: tempId,
      emisor_id: parseInt(userId),
      receptor_id: parseInt(receptorId),
      contenido: contenido.trim(),
      fecha: new Date().toISOString(),
      tempId: tempId // Para identificar luego
    };
    
    setMensajes((prev) => [...prev, mensajeOptimista]);
    socket.emit("enviarMensaje", data);
    
    return tempId;
  }, [socket, userId, conectado]);

  const solicitarHistorial = useCallback((receptorId) => {
    if (!socket || !conectado) {
      console.error("❌ Socket no disponible para solicitar historial");
      return;
    }

    const data = { 
      emisorId: parseInt(userId), 
      receptorId: parseInt(receptorId) 
    };
    
    console.log("📥 Solicitando historial:", data);
    socket.emit("solicitarHistorial", data);
  }, [socket, userId, conectado]);

  const value = {
    mensajes, 
    enviarMensaje, 
    solicitarHistorial,
    conectado,
    intentosReconexion
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;