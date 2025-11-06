import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Send, Users, Search, Filter, X } from 'lucide-react';
import "../assets/styles/notificaciones.css";

export default function NotificacionesInternas() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoDestino, setTipoDestino] = useState("usuarios");
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarSelector, setMostrarSelector] = useState(false);

  const { token } = useContext(AuthContext);

  // Cargar usuarios y roles
  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError("");

        const rU = await fetch("http://localhost:5000/api/usuarios", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!rU.ok) throw new Error(`Error ${rU.status}`);
        const du = await rU.json();
        const normalizados = (Array.isArray(du) ? du : []).map((u) => ({
          id: u.id_usuario || u.id,
          nombre: u.nombre || "",
          apellido: u.apellido || "",
          email: u.email || "",
          rol: u.rol_nombre || u.rol || "",
        }));
        setUsuarios(normalizados);

        const rR = await fetch("http://localhost:5000/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (rR.ok) {
          const dr = await rR.json();
          if (Array.isArray(dr)) setRoles(dr);
        }
      } catch (e) {
        setError(`Error al cargar datos: ${e.message}`);
      } finally {
        setCargando(false);
      }
    };
    if (token) cargar();
  }, [token]);

  // Filtro de usuarios
  const usuariosFiltrados = usuarios.filter((u) => {
    const term = busqueda.toLowerCase();
    const coincideBusqueda =
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term);
    const coincideRol =
      !filtroRol || (u.rol || "").toLowerCase() === filtroRol.toLowerCase();
    const noSeleccionado = !usuariosSeleccionados.some((s) => s.id === u.id);
    return coincideBusqueda && coincideRol && noSeleccionado;
  });

  const agregarUsuario = (u) => {
    if (!usuariosSeleccionados.some((x) => x.id === u.id)) {
      setUsuariosSeleccionados((prev) => [...prev, u]);
      setBusqueda("");
    }
  };

  const eliminarUsuario = (id) =>
    setUsuariosSeleccionados((prev) => prev.filter((x) => x.id !== id));

  const seleccionarPorRol = (rolNombre) => {
    const delRol = usuarios.filter(
      (u) =>
        (u.rol || "").toLowerCase() === rolNombre.toLowerCase() &&
        !usuariosSeleccionados.some((s) => s.id === u.id)
    );
    setUsuariosSeleccionados((prev) => [...prev, ...delRol]);
    setFiltroRol("");
  };

  const generar = async () => {
    if (!titulo || !descripcion) return alert("Completá título y descripción");
    if (tipoDestino === "usuarios" && usuariosSeleccionados.length === 0)
      return alert("Seleccioná al menos un usuario");

    try {
      const ids =
        tipoDestino === "todos"
          ? usuarios.map((u) => u.id)
          : usuariosSeleccionados.map((u) => u.id);

      const res = await fetch("http://localhost:5000/api/notificaciones/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          mensaje: descripcion,
          tipoDestino: "usuario",
          valorDestino: ids.join(","),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "No se pudo enviar");
      }

      alert(`✅ Notificación enviada a ${ids.length} usuario(s)`);
      setTitulo("");
      setDescripcion("");
      setUsuariosSeleccionados([]);
      setBusqueda("");
      setFiltroRol("");
      setMostrarSelector(false);
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  };

  return (
    <div className="notificaciones-container">
      <div className="notificaciones-content">
        
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Notificaciones Internas</h1>
            <p>Envía notificaciones a los usuarios del sistema</p>
          </div>
        </div>

        {/* Tarjeta principal */}
        <div className="notificacion-card">
          {error && <div className="error-message">❌ {error}</div>}

          {/* Información de la notificación */}
          <div className="form-section">
            <h3 className="section-title">Información de la Notificación</h3>
            
            <div className="form-group">
              <label>Título</label>
              <input
                className="form-input"
                placeholder="Escribí el título de la notificación..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Mensaje</label>
              <textarea
                className="form-textarea"
                placeholder="Escribí el mensaje de la notificación..."
                rows="4"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </div>

          {/* Destinatarios */}
          <div className="form-section">
            <h3 className="section-title">Destinatarios</h3>
            
            <div className="form-group">
              <label>Tipo de envío</label>
              <select
                className="form-select"
                value={tipoDestino}
                onChange={(e) => {
                  setTipoDestino(e.target.value);
                  if (e.target.value === "todos") {
                    setUsuariosSeleccionados([]);
                    setMostrarSelector(false);
                  }
                }}
              >
                <option value="usuarios">Usuarios específicos</option>
                <option value="todos">Todos los usuarios</option>
              </select>
            </div>

            {tipoDestino === "usuarios" && (
              <div className="selector-section">
                <div className="selector-header">Usuarios seleccionados</div>

                <div className="tags-container">
                  {usuariosSeleccionados.length === 0 ? (
                    <span className="placeholder-tag">
                      Ningún usuario seleccionado
                    </span>
                  ) : (
                    usuariosSeleccionados.map((u) => (
                      <div key={u.id} className="usuario-tag">
                        <span>{u.nombre} {u.apellido}</span>
                        <button
                          type="button"
                          className="tag-eliminar"
                          onClick={() => eliminarUsuario(u.id)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  className="btn-abrir-selector"
                  onClick={() => setMostrarSelector(!mostrarSelector)}
                >
                  <Users size={16} />
                  {mostrarSelector ? "Ocultar selector" : "Seleccionar usuarios"}
                </button>

                {mostrarSelector && (
                  <>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                        <input
                          className="form-input"
                          placeholder="Buscar por nombre o email..."
                          value={busqueda}
                          onChange={(e) => setBusqueda(e.target.value)}
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <select
                          className="form-select"
                          value={filtroRol}
                          onChange={(e) => setFiltroRol(e.target.value)}
                        >
                          <option value="">Todos los roles</option>
                          {roles.map((rol) => (
                            <option key={rol.id_rol || rol.id} value={rol.nombre}>
                              {rol.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="botones-rapidos">
                      <span>Seleccionar por rol:</span>
                      {roles.map((rol) => (
                        <button
                          key={rol.id_rol || rol.id}
                          type="button"
                          className="btn-rapido"
                          onClick={() => seleccionarPorRol(rol.nombre)}
                        >
                          + {rol.nombre}
                        </button>
                      ))}
                    </div>

                    <div className="lista-usuarios">
                      <div className="lista-header">
                        Usuarios disponibles ({usuariosFiltrados.length})
                      </div>
                      {cargando ? (
                        <div className="cargando">Cargando usuarios…</div>
                      ) : usuariosFiltrados.length === 0 ? (
                        <div className="sin-resultados">
                          {busqueda || filtroRol
                            ? "No hay usuarios que coincidan con la búsqueda"
                            : "No hay más usuarios disponibles"}
                        </div>
                      ) : (
                        usuariosFiltrados.map((u) => (
                          <div
                            key={u.id}
                            className="item-usuario"
                            onClick={() => agregarUsuario(u)}
                          >
                            <div className="usuario-info">
                              <div className="avatar-usuario">
                                {u.nombre?.[0]}{u.apellido?.[0]}
                              </div>
                              <div className="info-usuario">
                                <div className="nombre-usuario">
                                  {u.nombre} {u.apellido}
                                </div>
                                <div className="detalle-usuario">
                                  {u.email} • {u.rol}
                                </div>
                              </div>
                            </div>
                            <button type="button" className="btn-agregar">+ Agregar</button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="contador-selector">
                      <strong>{usuariosSeleccionados.length}</strong> usuario(s) seleccionado(s)
                    </div>
                  </>
                )}
              </div>
            )}

            {tipoDestino === "todos" && (
              <div className="info-message">
                ℹ️ La notificación se enviará a <strong>TODOS</strong> los usuarios del sistema ({usuarios.length})
              </div>
            )}
          </div>

          {/* Botón enviar */}
          <button
            className="btn-enviar"
            onClick={generar}
            disabled={cargando}
          >
            <Send size={18} />
            Enviar Notificación
          </button>
        </div>

      </div>
    </div>
  );
}