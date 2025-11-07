// frontend/src/components/ChatBox.jsx - MEJORADO
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext.jsx";
import { Send, Wifi, WifiOff } from "lucide-react";

const ChatBox = ({ receptor, userId }) => {
  const { mensajes, enviarMensaje, solicitarHistorial, conectado, intentosReconexion } = useChat();
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const chatEndRef = useRef(null);

  // Solicitar historial cuando cambia el receptor
  useEffect(() => {
    if (receptor?.id && userId) {
      console.log('🔄 Receptor cambiado, solicitando historial:', receptor.id);
      setCargando(true);
      solicitarHistorial(receptor.id);
      
      // Simular fin de carga (en una app real, esto debería basarse en eventos)
      setTimeout(() => setCargando(false), 1000);
    }
  }, [receptor?.id, userId, solicitarHistorial]);

  const handleEnviar = async () => {
    const textoLimpio = texto.trim();
    
    if (!textoLimpio || !receptor?.id || !conectado) {
      console.warn('⚠️ No se puede enviar mensaje:', { 
        tieneTexto: !!textoLimpio, 
        tieneReceptor: !!receptor?.id,
        conectado 
      });
      return;
    }

    setCargando(true);
    setTexto("");
    
    try {
      await enviarMensaje(receptor.id, textoLimpio);
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar y ordenar mensajes
  const mensajesFiltrados = mensajes
    .filter(m => 
      (m.emisor_id == userId && m.receptor_id == receptor?.id) ||
      (m.emisor_id == receptor?.id && m.receptor_id == userId)
    )
    .sort((a, b) => new Date(a.fecha || a.fecha_envio) - new Date(b.fecha || b.fecha_envio));

  // Función mejorada para formatear hora
  const formatearHora = (fechaString) => {
    try {
      if (!fechaString) return "Ahora";
      const fecha = new Date(fechaString);
      return isNaN(fecha.getTime()) 
        ? "Ahora" 
        : fecha.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
          });
    } catch {
      return "Ahora";
    }
  };

  // Scroll al final
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajesFiltrados]);

  if (!receptor) {
    return (
      <div className="chat-box-wrapper">
        <div className="chat-placeholder">
          <div className="placeholder-icon">💬</div>
          <h3 className="placeholder-title">Selecciona un usuario</h3>
          <p className="placeholder-text">
            Elige un usuario de la lista para comenzar a chatear
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-box-wrapper">
      {/* Header del chat */}
      <div className="chat-header">
        <div className="chat-header-info">
          <h3 className="chat-partner-name">
            {receptor.nombre} {receptor.apellido}
          </h3>
          <span className={`chat-status ${conectado ? 'online' : 'offline'}`}>
            {conectado ? <Wifi size={14} /> : <WifiOff size={14} />}
            {conectado ? 'En línea' : `Desconectado${intentosReconexion > 0 ? ` (reconectando...)` : ''}`}
          </span>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="chat-messages">
        {cargando && mensajesFiltrados.length === 0 ? (
          <div className="chat-loading">Cargando mensajes...</div>
        ) : mensajesFiltrados.length === 0 ? (
          <div className="chat-placeholder">
            <div className="placeholder-icon">🌱</div>
            <h3 className="placeholder-title">No hay mensajes todavía</h3>
            <p className="placeholder-text">
              Comienza la conversación con {receptor.nombre}
            </p>
          </div>
        ) : (
          mensajesFiltrados.map((m) => {
            const esPropio = m.emisor_id == userId;
            const hora = formatearHora(m.fecha || m.fecha_envio);

            return (
              <div
                key={m.id || m.tempId || `msg-${m.fecha}`}
                className={`message-bubble ${
                  esPropio ? "message-sent" : "message-received"
                } ${m.tempId ? 'message-pending' : ''}`}
              >
                {!esPropio && (
                  <div className="message-sender">
                    {receptor.nombre} {receptor.apellido}
                  </div>
                )}
                <div className="message-text">{m.contenido}</div>
                <div className="message-time">
                  {hora}
                  {m.tempId && <span className="message-status">⏳</span>}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="chat-input-container">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={conectado ? "Escribe un mensaje..." : "Conectando..."}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && texto.trim() && conectado) {
              e.preventDefault();
              handleEnviar();
            }
          }}
          className="chat-input"
          disabled={!conectado || cargando}
        />
        <button
          onClick={handleEnviar}
          disabled={!texto.trim() || !conectado || cargando}
          className={`chat-send-btn ${
            (!texto.trim() || !conectado || cargando) ? "inactive" : ""
          }`}
        >
          <Send size={18} />
          <span>{cargando ? "Enviando..." : "Enviar"}</span>
        </button>
      </div>

      {/* Indicador de estado */}
      {!conectado && (
        <div className="connection-warning">
          ⚠️ Desconectado. Reconectando automáticamente...
        </div>
      )}
    </div>
  );
};

export default ChatBox;