import { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import logo from '../assets/imagenes/logo.png';
import '../assets/styles/navbar.css';
import { API_BASE_URL } from '../config/api.js'

export default function Navbar() {
  const { usuario, logout, token } = useContext(AuthContext);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [expandedNotificationId, setExpandedNotificationId] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef(null);
  const navbarRef = useRef(null);
 

  const linksPorCategoria = {
    periodista: [
      { to: '/notas', texto: 'Mis Artículos' },
      { to: '/ArticulosEnRevision', texto: 'Enviados a Revisión' },
      { tipo: 'notificaciones', texto: 'Notificaciones' },
      { to: '/chat', texto: 'Chat' },
      { to: '/periodista-upload', texto: 'Subir Articulo' },
      { to: '/galeria-global', texto: 'Galeria' },
      
    ],
    fotografo: [
      { to: '/galeria', texto: 'Galería Personal' },
      { tipo: 'notificaciones', texto: 'Notificaciones' },
      { to: '/chat', texto: 'Chat' },
      { to: '/ajustes', texto: 'Ajustes' },
      { to: '/FotografoUpload', texto: 'Subir foto' },
      { to: '/galeria-global', texto: 'Galeria' },


    ],
    editor: [
      { to: '/revisiones', texto: 'Revisiones' },
      { to: '/articulos-aprobados', texto: 'Aprobados' },
      { tipo: 'notificaciones', texto: 'Notificaciones' },
      { to: '/chat', texto: 'Chat' },
      { to: '/galeria-global', texto: 'Galeria' },

    ],
    administrador: [
      { to: '/gestion-roles', texto: 'Gestión de Roles' },
      { to: '/gestion-usuario', texto: 'Gestión de Usuario' },
      { to: '/gestion-categorias', texto: 'Gestión de Categorías' },
      { to: '/notificaciones-internas', texto: 'Notificaciones Internas' },
      { tipo: 'notificaciones', texto: 'Notificaciones' },
      { to: '/chat', texto: 'Chat' },
      { to: '/galeria-global', texto: 'Galeria' },
      { to: '/admin/dashboard', texto: 'dashboard' },

    ],
  };

  const links = usuario ? linksPorCategoria[usuario.categoria] ?? [] : [];

  useEffect(() => {
    if (usuario && token) {
      const cargarNotificaciones = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/notificaciones/${usuario.id_usuario}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!res.ok) throw new Error('Error al cargar notificaciones');
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
        body: JSON.stringify({ id_notificacion: id })
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
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Componente UserDrawer
  const UserDrawer = ({ isOpen, onClose }) => {
    return (
      <>
        <div className={`user-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
        
        <div className={`user-drawer ${isOpen ? 'open' : ''}`}>
          <div className="user-drawer-header">
            {usuario?.foto ? (
              <img 
                src={usuario.foto}
                alt="Avatar"
                className="user-drawer-avatar"
              />
            ) : (
              <div className="user-drawer-avatar">
                {usuario?.nombre.charAt(0)}
                {usuario?.apellido.charAt(0)}
              </div>
            )}
            <div className="user-drawer-info">
              <h3>{usuario?.nombre} {usuario?.apellido}</h3>
              <p>{usuario?.email}</p>
            </div>
          </div>

          <div className="user-drawer-options">
            <Link to="/perfil" className="user-drawer-item" onClick={onClose}>
              <span>👤</span> Mi perfil
            </Link>
            <Link to="/configuracion" className="user-drawer-item" onClick={onClose}>
              <span>⚙️</span> Configuración
            </Link>
          </div>

          <button className="user-drawer-logout" onClick={() => {
            logout();
            onClose();
          }}>
            Cerrar sesión
          </button>
        </div>
      </>
    );
  };

  // Función para alternar el menú hamburguesa
  const toggleMenu = () => {
    setMenuAbierto((prev) => !prev);
  };

  return (
    <nav className="navbar" ref={navbarRef}>
      {/* Botón de menú hamburguesa para móviles */}
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>

      <div className="nav-logo">
        <img src={logo} alt="Logo" />
      </div>

      <ul className={`nav-links ${menuAbierto ? 'active' : ''}`}>
        {links.map((l) =>
          l.tipo === 'notificaciones' ? (
            <li key="notificaciones" className="notificaciones-wrapper" ref={menuRef}>
              <button
                className="btn-notificaciones"
                onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
              >
                🔔
                {notificaciones.filter(n => !n.leido).length > 0 && (
                  <span className="badge">
                    {notificaciones.filter(n => !n.leido).length}
                  </span>
                )}
              </button>

              {mostrarNotificaciones && (
                <div className="dropdown-notificaciones">
                  {notificaciones.length > 0 ? (
                    notificaciones.map((n) => (
                      <div key={n.id_notificacion} className={`notificacion-item ${!n.leido ? 'no-leida' : ''}`}>
                        <strong
                          onClick={() => {
                            setExpandedNotificationId(
                              expandedNotificationId === n.id_notificacion ? null : n.id_notificacion
                            );
                            if (!n.leido) {
                              marcarComoLeida(n.id_notificacion);
                            }
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
              <Link to={l.to} onClick={() => setMenuAbierto(false)}>{l.texto}</Link>
            </li>
          )
        )}
      </ul>

      <div className="nav-user">
        {usuario ? (
          <div className="user-dropdown-container">
            <div
              className="user-avatar"
              onClick={() => setDrawerOpen(true)}
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
                  {usuario?.nombre.charAt(0)}
                  {usuario?.apellido.charAt(0)}
                </div>
              )}
            </div>

            <UserDrawer
              isOpen={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        ) : (
          <Link to="/login">Iniciar sesión</Link>
        )}
      </div>
    </nav>
  );
}
