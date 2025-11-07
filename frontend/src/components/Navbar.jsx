import { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.js";
import UserDrawer from "./UserDrawer";
import logo from "../assets/imagenes/logo.png";
import "../assets/styles/navbar.css";
import { apiFetch, apiEndpoints } from "../config/api"; // ✅ Importar configuración de API

export default function Navbar() {
  const { user, token } = useContext(AuthContext);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [expandedNotificationId, setExpandedNotificationId] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuRef = useRef(null);
  const navbarRef = useRef(null);

  const linksPorCategoria = {
    periodista: [
      { to: "/notas", texto: "Mis Artículos" },
      { to: "/periodista-upload", texto: "Subir Artículo" },
      { to: "/ArticulosEnRevision", texto: "Enviados a Revisión" },
      { to: "/galeria-global", texto: "Galería" },
      { to: "/chat", texto: "Chat" },
      { tipo: "notificaciones", texto: "Notificaciones" },
    ],
    fotografo: [
      { to: "/galeria-global", texto: "Galería" },
      { to: "/galeria", texto: "Galería Personal" },
      { to: "/FotografoUpload", texto: "Subir Foto" },
      { to: "/chat", texto: "Chat" },
      { tipo: "notificaciones", texto: "Notificaciones" },
    ],
    editor: [
      { to: "/revisiones", texto: "Revisiones" },
      { to: "/articulos-aprobados", texto: "Aprobados" },
      { to: "/galeria-global", texto: "Galería" },
      { to: "/chat", texto: "Chat" },
      { tipo: "notificaciones", texto: "Notificaciones" },
    ],
    administrador: [
      { to: "/gestion-roles", texto: "Gestión de Roles" },
      { to: "/gestion-usuario", texto: "Gestión de Usuario" },
      { to: "/gestion-categorias", texto: "Gestión de Categorías" },
      { to: "/notificaciones-internas", texto: "Notificaciones Internas" },
      { to: "/admin/dashboard", texto: "Panel" },
      {to: "/admin/logs", texto: "Logs del Sistema"},
      { to: "/galeria-global", texto: "Galería" },
      { to: "/chat", texto: "Chat" },
      { tipo: "notificaciones", texto: "Notificaciones" },
    ],
  };

  const links = user ? linksPorCategoria[user.categoria] ?? [] : [];

  // Cargar notificaciones
  useEffect(() => {
    if (user) {
      const cargarNotificaciones = async () => {
        try {
          // ✅ Usar apiFetch y apiEndpoints
          const res = await apiFetch(apiEndpoints.userNotifications(user.id_usuario));
          if (!res.ok) throw new Error("Error al cargar notificaciones");
          const data = await res.json();
          setNotificaciones(data);
        } catch (err) {
          console.error("❌ Error al obtener notificaciones:", err);
        }
      };
      cargarNotificaciones();
    }
  }, [user]); // ✅ Eliminar dependencia de token

  const marcarComoLeida = async (id) => {
    try {
      // ✅ Usar apiFetch y apiEndpoints
      await apiFetch(apiEndpoints.markNotificationRead, {
        method: "POST",
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
        {user ? (
          <div className="user-dropdown-container">
            <div
              className="user-avatar"
              onClick={() => setIsDrawerOpen(true)}
              title="Abrir/cerrar menú usuario"
            >
              {/* Solo iniciales */}
              {user?.nombre?.charAt(0) || ""}{user?.apellido?.charAt(0) || ""}
            </div>

            <UserDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
            />
          </div>
        ) : (
          <Link to="/login" className="btn-login">Iniciar sesión</Link>
        )}
      </div>
    </nav>
  );
}