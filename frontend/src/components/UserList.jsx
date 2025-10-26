import React, { useEffect, useState, useContext } from "react";
import { useChat } from "../context/ChatContext.jsx";
import { AuthContext } from "../context/AuthContext.js";
import "../assets/styles/userlist.css"; // nuevo archivo para detalles visuales

const UserList = ({ onSelectUser, userId }) => {
  const [usuarios, setUsuarios] = useState([]);
  const { solicitarHistorial } = useChat();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/usuarios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error al cargar usuarios");
          return res.json();
        })
        .then((data) => setUsuarios(data.filter((u) => u.id !== userId)))
        .catch((err) => console.error("Error cargando usuarios:", err));
    }
  }, [userId, token]);

  const handleSelectUser = (user) => {
    onSelectUser(user);
    solicitarHistorial(user.id);
  };

  return (
    <div className="userlist-panel">
      <h3 className="userlist-title">Usuarios disponibles</h3>
      <ul className="userlist-lista">
        {usuarios.length === 0 ? (
          <p className="userlist-vacio">No hay usuarios disponibles</p>
        ) : (
          usuarios.map((u) => (
            <li
              key={u.id}
              onClick={() => handleSelectUser(u)}
              className="userlist-item"
            >
              <div className="userlist-avatar">
                {u.nombre?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="userlist-nombre">{u.nombre}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default UserList;