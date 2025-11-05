import { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.js";
import UserDrawer from "./UserDrawer";
import logo from "../assets/imagenes/logo.png";
import "../assets/styles/navbar.css";
import { API_BASE_URL } from "../config/api.js";

export default function Navbar() {
  const { usuario, logout, token } = useContext(AuthContext);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [expandedNotificationId, setExpandedNotificationId] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuRef = useRef(null);
  const navbarRef = useRef(null);

  // Links según categoría del usuario
  const linksPorCategoria = {
    periodista: [
      { to: "/notas", texto: "Mis Artículos" },
      { to: "/ArticulosEnRevision", texto: "Enviados a Revisión" },
      { tipo: "notificaciones", texto: "Notificaciones" },
      { to: "/chat", texto: "Chat" },
      { to: "/periodista-upload", texto: "Subir Artículo" },
      { to: "/galeria-global", texto: "Galería" },
    ],
    fotografo: [
      { to: "/galeria", texto: "Galería Personal" },
      { tipo: "notificaciones", texto: "Notificaciones" },
      { to: "/chat", texto: "Chat" },
      { to: "/ajustes", texto: "Ajustes" },
      { to: "/FotografoUpload", texto: "Subir Foto" },
      { to: "/galeria-global", texto: "Galería" },
    ],
    editor: [
      { to: "/revisiones", texto: "Revisiones" },
      { to: "/articulos-aprobados", texto: "Aprobados" },
      { tipo: "notificaciones", texto: "Notificaciones" },
      { to: "/chat", texto: "Chat" },
      { to: "/galeria-global", texto: "Galería" },
    ],
    administrador: [
      { to: "/gestion-roles", texto: "Gestión de Roles" },
      { to: "/gestion-usuario", texto: "Gestión de Usuario" },
      { to: "/gestion-categorias", texto: "Gestión de Categorías" },
      { to: "/notificaciones-internas", texto: "Notificaciones Internas" },
      { tipo: "notificaciones", texto: "Notificaciones" },
      { to: "/chat", texto: "Chat" },
      { to: "/galeria-global", texto: "Galería" },
      { to: "/admin/dashboard", texto: "Dashboard" },
    ],
  };

  const links = usuario ? linksPorCategoria[usuario.categoria] ?? [] : [];

  // Cargar notificaciones
  useEffect(() => {
    if (usuario && token) {
      const cargarNotificaciones = async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/notificaciones/${usuario.id_usuario}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!res.ok) throw new Error("Error al cargar notificaciones");
          const data = await res.json();
          setNotificaciones(data);
        } catch (err) {
          console.error("❌ Error al obtener notificaciones:", err);
        }
      };
      cargarNotificaciones();
    }
  }, [usuario, token]);

  // Marcar notificación como leída
  const marcarComoLeida = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/notificaciones/marcar-leida`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_notificacion: id }),
      });
      setNotificaciones((prev) =>
        prev.map((n) =>
          n.id_notificacion === id ? { ...n, leido: true } : n
        )
      );
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMostrarNotificaciones(false);
      }
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Alternar menú hamburguesa
  const toggleMenu = () => setMenuAbierto((prev) => !prev);

  return (
    <nav className="navbar" ref={navbarRef}>
      {/* Botón hamburguesa */}
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>

      <div className="nav-logo">
        <img src={logo} alt="Logo" />
      </div>

      {/* LINKS SEGÚN ROL */}
      <ul className={`nav-links ${menuAbierto ? "active" : ""}`}>
        {links.map((l) =>
          l.tipo === "notificaciones" ? (
            <li
              key="notificaciones"
              className="notificaciones-wrapper"
              ref={menuRef}
            >
              <button
                className="btn-notificaciones"
                onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
              >
                🔔
                {notificaciones.filter((n) => !n.leido).length > 0 && (
                  <span className="badge">
                    {notificaciones.filter((n) => !n.leido).length}
                  </span>
                )}
              </button>

              {mostrarNotificaciones && (
                <div className="dropdown-notificaciones">
                  {notificaciones.length > 0 ? (
                    notificaciones.map((n) => (
                      <div
                        key={n.id_notificacion}
                        className={`notificacion-item ${
                          !n.leido ? "no-leida" : ""
                        }`}
                      >
                        <strong
                          onClick={() => {
                            setExpandedNotificationId(
                              expandedNotificationId === n.id_notificacion
                                ? null
                                : n.id_notificacion
                            );
                            if (!n.leido) marcarComoLeida(n.id_notificacion);
                          }}
                        >
                          {n.titulo}
                        </strong>
                        {expandedNotificationId === n.id_notificacion && (
                          <div className="notificacion-contenido">
                            <p>{n.mensaje}</p>
                            <small>{n.fecha}</small>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div>No tienes notificaciones</div>
                  )}
                </div>
              )}
            </li>
          ) : (
            <li key={l.to}>
              <Link to={l.to} onClick={() => setMenuAbierto(false)}>
                {l.texto}
              </Link>
            </li>
          )
        )}
      </ul>

      {/* DRAWER DE USUARIO */}
      <div className="nav-user">
        {usuario ? (
          <div className="user-dropdown-container">
            <div
              className="user-avatar"
              onClick={() => setIsDrawerOpen(true)}
              title="Abrir/cerrar menú usuario"
            >
              {usuario?.foto ? (
                <img
                  src={usuario.foto}
                  alt="Avatar"
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-initials">
                  {usuario?.nombre?.charAt(0)}
                  {usuario?.apellido?.charAt(0)}
                </div>
              )}
            </div>

            <UserDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              usuario={usuario}
              logout={logout}
            />
          </div>
        ) : (
          <Link to="/login">Iniciar sesión</Link>
        )}
      </div>
    </nav>
  );
}
