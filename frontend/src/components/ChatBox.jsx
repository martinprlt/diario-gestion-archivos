// ChatBox.jsx - Actualizado
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../context/chatContext.jsx";
import { Send } from "lucide-react";

const ChatBox = ({ receptor, userId }) => {
  const { mensajes, enviarMensaje } = useChat();
  const [texto, setTexto] = useState("");
  const chatEndRef = useRef(null);

  const handleEnviar = () => {
    if (texto.trim()) {
      enviarMensaje(receptor.id, texto);
      setTexto("");
    }
  };

  const mensajesFiltrados = mensajes.filter(
    (m) =>
      (m.emisor_id === userId && m.receptor_id === receptor.id) ||
      (m.emisor_id === receptor.id && m.receptor_id === userId)
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajesFiltrados]);

  return (
    <>
      {/* Header del chat */}
      <div className="chat-header">
        <div className="chat-header-info">
          <h3 className="chat-partner-name">{receptor.nombre}</h3>
          <span className="chat-status">
            <span className="status-dot"></span>
            En línea
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
          mensajesFiltrados.map((m) => {
            const esPropio = m.emisor_id === userId;
            return (
              <div
                key={m.id_mensaje}
                className={`message-bubble ${
                  esPropio ? "message-sent" : "message-received"
                }`}
              >
                {/* Nombre del remitente (solo para mensajes recibidos) */}
                {!esPropio && (
                  <div className="message-sender">{receptor.nombre}</div>
                )}

                {/* Contenido del mensaje */}
                <div className="message-text">{m.contenido}</div>

                {/* Hora del mensaje */}
                <div className="message-time">
                  {new Date(m.fecha_envio).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
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
          placeholder="Escribe un mensaje..."
          onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
          className="chat-input"
        />
        <button
          onClick={handleEnviar}
          disabled={!texto.trim()}
          className={`chat-send-btn ${!texto.trim() ? "inactive" : ""}`}
        >
          <Send size={18} />
          <span>Enviar</span>
        </button>
      </div>
    </>
  );
};

export default ChatBox;