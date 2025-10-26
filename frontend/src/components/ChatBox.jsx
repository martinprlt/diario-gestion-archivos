import React, { useState } from "react";
import { useChat } from "../context/ChatContext.jsx";

const ChatBox = ({ receptor, userId }) => {
  const { mensajes, enviarMensaje } = useChat();
  const [texto, setTexto] = useState("");

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

  return (
    <div className="flex flex-col max-w-3xl w-full mx-auto mt-6 bg-gradient-to-b from-green-50 to-white rounded-xl shadow-xl overflow-hidden border border-green-200">
      {/* HEADER */}
      <div className="bg-green-800 text-white p-8 flex items-center justify-between">
        <h2 className="font-semibold text-lg">💬 {receptor.nombre}</h2>
        <span className="text-sm opacity-80"></span>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto p-8 bg-green-50">
        {mensajesFiltrados.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            No hay mensajes todavía. ¡Comenzá la conversación!
          </p>
        ) : (
          mensajesFiltrados.map((m) => (
            <div
              key={m.id_mensaje}
              className={`flex mb-4 ${
                m.emisor_id === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative max-w-xs px-4 py-3 rounded-2xl text-sm shadow-sm transition-all ${
                  m.emisor_id === userId
                    ? "bg-green-700 text-white rounded-br-none animate-fadeIn"
                    : "bg-white text-gray-800 border border-green-100 rounded-bl-none animate-fadeIn"
                }`}
              >
                {m.contenido}
              </div>
            </div>
          ))
        )}
      </div>

      {/* INPUT */}
      <div className="p-3 border-t border-green-200 bg-white flex gap-2 items-center">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 border border-green-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleEnviar}
          className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-full font-medium shadow-md transition-all"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatBox;