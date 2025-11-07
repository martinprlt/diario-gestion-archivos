// frontend/src/components/ChatBox.jsx - CORREGIDO
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext.jsx";
import { Send } from "lucide-react";

const ChatBox = ({ receptor, userId }) => {
  const { mensajes, enviarMensaje, solicitarHistorial, conectado } = useChat();
  const [texto, setTexto] = useState("");
  const chatEndRef = useRef(null);

  // ✅ Solicitar historial cuando cambia el receptor
  useEffect(() => {
    if (receptor && receptor.id && userId) {
      console.log('📥 Solicitando historial al cambiar receptor:', receptor.id);
      solicitarHistorial(receptor.id);
    }
  }, [receptor?.id, userId, solicitarHistorial]);

  const handleEnviar = () => {
    const textoLimpio = texto.trim();
    
    if (!textoLimpio) {
      console.warn('⚠️ No se puede enviar mensaje vacío');
      return;
    }
    
    if (!receptor || !receptor.id) {
      console.error('❌ No hay receptor seleccionado');
      return;
    }

    console.log('📤 Enviando mensaje:', {
      receptor: receptor.id,
      contenido: textoLimpio
    });

    enviarMensaje(receptor.id, textoLimpio);
    setTexto("");
  };

  // ✅ Filtrar mensajes de esta conversación
  const mensajesFiltrados = mensajes.filter(
    (m) =>
      (m.emisor_id === userId && m.receptor_id === receptor?.id) ||
      (m.emisor_id === receptor?.id && m.receptor_id === userId)
  );

  console.log('💬 Mensajes en conversación:', mensajesFiltrados.length);

  // Función segura para formatear hora
  const formatearHora = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) {
        return "Ahora";
      }
      return fecha.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Ahora";
    }
  };

  // Scroll al final cuando cambien los mensajes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajesFiltrados.length]); // ⬅️ Dependencia en la cantidad de mensajes

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
          <h3 className="chat-partner-name">{receptor.nombre} {receptor.apellido}</h3>
          <span className="chat-status">
            <span className={`status-dot ${conectado ? 'online' : 'offline'}`}></span>
            {conectado ? 'En línea' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="chat-messages">
        {mensajesFiltrados.length === 0 ? (
          <div className="chat-placeholder">
            <div className="placeholder-icon">🌱</div>
            <h3 className="placeholder-title">No hay mensajes todavía</h3>
            <p className="placeholder-text">
              Comienza la conversación con {receptor.nombre}
            </p>
          </div>
        ) : (
          mensajesFiltrados.map((m, index) => {
            const esPropio = m.emisor_id === userId;
            const hora = formatearHora(m.fecha_envio || m.fecha);

            return (
              <div
                key={m.id_mensaje || m.id || `msg-${index}`}
                className={`message-bubble ${
                  esPropio ? "message-sent" : "message-received"
                }`}
              >
                {!esPropio && (
                  <div className="message-sender">
                    {receptor.nombre} {receptor.apellido}
                  </div>
                )}
                <div className="message-text">{m.contenido}</div>
                <div className="message-time">{hora}</div>
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
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleEnviar();
            }
          }}
          className="chat-input"
          disabled={!conectado}
        />
        <button
          onClick={handleEnviar}
          disabled={!texto.trim() || !conectado}
          className={`chat-send-btn ${(!texto.trim() || !conectado) ? "inactive" : ""}`}
        >
          <Send size={18} />
          <span>Enviar</span>
        </button>
      </div>

      {/* Indicador de estado de conexión */}
      {!conectado && (
        <div className="connection-warning">
          ⚠️ Desconectado. Intentando reconectar...
        </div>
      )}
    </div>
  );
};

export default ChatBox;