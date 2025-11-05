import React, { useEffect, useState, useContext } from "react";
import { useChat } from "../context/chatContext.jsx";
import { AuthContext } from "../context/AuthContext.js";
import "../assets/styles/userlist.css";
import { API_BASE_URL } from '../config/api.js'

const UserList = ({ onSelectUser, userId }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { solicitarHistorial } = useChat();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      setCargando(true);
      fetch(`${API_BASE_URL}/api/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error al cargar usuarios");
          return res.json();
        })
        .then((data) => {
          const usuariosFiltrados = Array.isArray(data) 
            ? data.filter((u) => u.id !== userId)
            : [];
          setUsuarios(usuariosFiltrados);
        })
        .catch((err) => {
          console.error("Error cargando usuarios:", err);
          setUsuarios([]);
        })
        .finally(() => {
          setCargando(false);
        });
    }
  }, [userId, token]);

  const handleSelectUser = (user) => {
    setUsuarioActivo(user.id);
    onSelectUser(user);
    solicitarHistorial(user.id);
  };

  const getRolDisplay = (rol) => {
    const roles = {
      'administrador': 'Administrador',
      'Editor': 'Editor',
      'Periodista': 'Periodista', 
      'Fotografo': 'Fotógrafo'
    };
    return roles[rol] || rol;
  };

  return (
    <div className="userlist-panel">
      {/* Header con colores de Independiente */}
      <div className="userlist-header">
        <h3 className="userlist-title">Usuarios</h3>
        <p className="userlist-subtitle">Selecciona un usuario para chatear</p>
      </div>

      {/* Lista de usuarios */}
      <ul className="userlist-lista">
        {cargando ? (
          <div className="userlist-loading">
            <div className="loading-spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <p className="userlist-vacio">No hay usuarios disponibles</p>
        ) : (
          usuarios.map((usuario) => (
            <li
              key={usuario.id}
              onClick={() => handleSelectUser(usuario)}
              className={`userlist-item ${
                usuarioActivo === usuario.id ? "active" : ""
              }`}
            >
              <div className="userlist-avatar">
                {usuario.nombre?.charAt(0)?.toUpperCase() || "U"}
                {usuario.apellido?.charAt(0)?.toUpperCase() || ""}
              </div>
              
              <div className="userlist-info">
                <span className="userlist-nombre">
                  {usuario.nombre} {usuario.apellido}
                </span>
                <span className="userlist-rol">
                  {getRolDisplay(usuario.rol_nombre || usuario.rol)}
                </span>
                
                <div className="userlist-status">
                  <div className="status-indicator"></div>
                  <span className="status-text">En línea</span>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default UserList;