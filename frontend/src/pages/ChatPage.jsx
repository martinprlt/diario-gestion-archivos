// ChatPage.jsx - Actualizado
import React, { useState } from "react";
import { ChatProvider } from "../context/chatContext";
import ChatBox from "../components/ChatBox";
import UserList from "../components/UserList";
import "../assets/styles/chat-page.css";

const ChatPage = ({ userId }) => {
  const [receptor, setReceptor] = useState(null);

  return (
    <ChatProvider userId={userId}>
      <div className="chat-container">
        <div className="chat-sidebar">
          <UserList onSelectUser={setReceptor} userId={userId} />
        </div>

        <div className="chat-main">
          {receptor ? (
            <ChatBox receptor={receptor} userId={userId} />
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