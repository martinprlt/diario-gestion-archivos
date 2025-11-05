// ChatPage.jsx - CON DEBUG
import React, { useState, useEffect } from "react";
import { ChatProvider } from "../context/ChatContext.jsx";
import ChatBox from "../components/ChatBox.jsx";
import UserList from "../components/UserList.jsx";
import "../assets/styles/chat-page.css";

const ChatPage = ({ userId }) => {
  const [receptor, setReceptor] = useState(null);

  // ✅ DEBUG CRÍTICO
  useEffect(() => {
    console.log("🔍 ChatPage - userId recibido:", userId);
    console.log("🔍 ChatPage - localStorage user:", localStorage.getItem('user'));
    
    // Intentar obtener el userId del localStorage si viene undefined
    if (!userId) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        console.log("🔍 ChatPage - userId del localStorage:", user?.id);
      }
    }
  }, [userId]);

  // ✅ SI userId ES UNDEFINED, OBTENERLO DEL LOCALSTORAGE
  const finalUserId = userId || JSON.parse(localStorage.getItem('user'))?.id;

  if (!finalUserId) {
    return (
      <div className="chat-container">
        <div className="error-container">
          <h2>❌ Error de autenticación</h2>
          <p>No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.</p>
          <button onClick={() => window.location.href = '/login'}>
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider userId={finalUserId}>
      <div className="chat-container">
        <div className="chat-sidebar">
          <UserList onSelectUser={setReceptor} userId={finalUserId} />
        </div>

        <div className="chat-main">
          {receptor ? (
            <ChatBox receptor={receptor} userId={finalUserId} />
          ) : (
            <div className="chat-placeholder">
              <div className="placeholder-icon">💬</div>
              <h3 className="placeholder-title">Comienza a chatear</h3>
              <p className="placeholder-text">
                Selecciona un usuario de la lista para iniciar una conversación
              </p>
            </div>
          )}
        </div>
      </div>
    </ChatProvider>
  );
};

export default ChatPage;