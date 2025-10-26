import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../context/AuthContext';
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

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");
        
        // Obtener usuarios
        const resUsuarios = await fetch("http://localhost:5000/api/usuarios", {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resUsuarios.ok) throw new Error(`Error ${resUsuarios.status}`);

        const dataUsuarios = await resUsuarios.json();
        
        if (!Array.isArray(dataUsuarios)) {
          throw new Error("Formato de datos incorrecto");
        }

        const usuariosLimpios = dataUsuarios.map(user => ({
          id: user.id_usuario || user.id,
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          email: user.email || '',
          rol: user.rol_nombre || user.rol || '',
          avatar: user.avatar_url || `/avatars/${user.id_usuario || user.id}.jpg`
        }));
        
        setUsuarios(usuariosLimpios);
        
        // Obtener roles para filtros
        const resRoles = await fetch("http://localhost:5000/api/roles", {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resRoles.ok) {
          const dataRoles = await resRoles.json();
          if (Array.isArray(dataRoles)) {
            setRoles(dataRoles);
          }
        }
        
      } catch (error) {
        console.error("Error cargando datos:", error);
        setError(`Error al cargar datos: ${error.message}`);
      } finally {
        setCargando(false);
      }
    };
    
    if (token) cargarDatos();
  }, [token]);

  // 🔹 FILTRAR USUARIOS PARA EL SELECTOR
  const usuariosFiltrados = usuarios.filter(usuario => {
    const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
    const email = usuario.email.toLowerCase();
    const terminoBusqueda = busqueda.toLowerCase();
    
    const coincideBusqueda = nombreCompleto.includes(terminoBusqueda) || 
                            email.includes(terminoBusqueda);
    
    const coincideRol = !filtroRol || usuario.rol.toLowerCase() === filtroRol.toLowerCase();
    
    const noSeleccionado = !usuariosSeleccionados.some(sel => sel.id === usuario.id);
    
    return coincideBusqueda && coincideRol && noSeleccionado;
  });

  // 🔹 AGREGAR USUARIO A LA SELECCIÓN
  const agregarUsuario = (usuario) => {
    if (!usuariosSeleccionados.some(u => u.id === usuario.id)) {
      setUsuariosSeleccionados(prev => [...prev, usuario]);
      setBusqueda("");
    }
  };

  // 🔹 ELIMINAR USUARIO DE LA SELECCIÓN
  const eliminarUsuario = (usuarioId) => {
    setUsuariosSeleccionados(prev => prev.filter(u => u.id !== usuarioId));
  };

  // 🔹 SELECCIONAR GRUPO POR ROL
  const seleccionarPorRol = (rolNombre) => {
    const usuariosDelRol = usuarios.filter(u => 
      u.rol.toLowerCase() === rolNombre.toLowerCase() &&
      !usuariosSeleccionados.some(sel => sel.id === u.id)
    );
    
    setUsuariosSeleccionados(prev => [...prev, ...usuariosDelRol]);
    setFiltroRol("");
  };

  // 🔹 GENERAR NOTIFICACIÓN
  const generarNotificacion = async () => {
    if (!titulo || !descripcion) {
      alert("Por favor complete título y descripción");
      return;
    }

    if (tipoDestino === "usuarios" && usuariosSeleccionados.length === 0) {
      alert("Por favor seleccione al menos un usuario");
      return;
    }

    try {
      let usuariosDestino = [];

      if (tipoDestino === "usuarios") {
        usuariosDestino = usuariosSeleccionados.map(u => u.id);
      } else if (tipoDestino === "todos") {
        usuariosDestino = usuarios.map(u => u.id);
      }

      const response = await fetch("http://localhost:5000/api/notificaciones/crear", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          titulo, 
          mensaje: descripcion, 
          tipoDestino: "usuario",
          valorDestino: usuariosDestino.join(",")
        })
      });

      if (response.ok) {
        alert(`✅ Notificación enviada a ${usuariosDestino.length} usuario(s)`);
        // Limpiar formulario
        setTitulo("");
        setDescripcion("");
        setUsuariosSeleccionados([]);
        setBusqueda("");
        setFiltroRol("");
        setMostrarSelector(false);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error de conexión con el servidor");
    }
  };

  return (
    <div className="notificaciones-container">
      <h1>📨 Notificaciones Internas</h1>

      {error && <div className="error-message">❌ {error}</div>}

      <div className="form-group">
        <label>Título:</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Asunto de la notificación..."
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Mensaje de la notificación..."
          className="form-textarea"
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>Enviar a:</label>
        <select 
          value={tipoDestino} 
          onChange={(e) => {
            setTipoDestino(e.target.value);
            if (e.target.value === "todos") {
              setUsuariosSeleccionados([]);
              setMostrarSelector(false);
            }
          }}
          className="form-select"
        >
          <option value="usuarios">Usuarios específicos</option>
          <option value="todos">Todos los usuarios</option>
        </select>
      </div>

      {tipoDestino === "usuarios" && (
        <div className="selector-usuarios">
          {/* 🔹 TAGS DE USUARIOS SELECCIONADOS */}
          <div className="tags-container">
            {usuariosSeleccionados.map(usuario => (
              <div key={usuario.id} className="usuario-tag">
                <span className="tag-nombre">
                  {usuario.nombre} {usuario.apellido}
                </span>
                <button 
                  type="button"
                  onClick={() => eliminarUsuario(usuario.id)}
                  className="tag-eliminar"
                >
                  ×
                </button>
              </div>
            ))}
            
            {usuariosSeleccionados.length === 0 && (
              <span className="placeholder-tag">Ningún usuario seleccionado</span>
            )}
          </div>

          {/* 🔹 BOTÓN PARA ABRIR SELECTOR */}
          <button
            type="button"
            onClick={() => setMostrarSelector(!mostrarSelector)}
            className="btn-abrir-selector"
          >
            {mostrarSelector ? "▲ Ocultar selector" : "▼ Seleccionar usuarios"}
          </button>

          {/* 🔹 SELECTOR AVANZADO */}
          {mostrarSelector && (
            <div className="selector-avanzado">
              {/* FILTROS */}
              <div className="filtros-selector">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="busqueda-input"
                />
                
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className="filtro-rol"
                >
                  <option value="">Todos los roles</option>
                  {roles.map(rol => (
                    <option key={rol.id_rol || rol.id} value={rol.nombre}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>

                {/* BOTONES RÁPIDOS POR ROL */}
                <div className="botones-rapidos">
                  <span>Seleccionar grupo:</span>
                  {roles.map(rol => (
                    <button
                      key={rol.id_rol || rol.id}
                      type="button"
                      onClick={() => seleccionarPorRol(rol.nombre)}
                      className="btn-rapido"
                    >
                      + {rol.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* LISTA DE USUARIOS */}
              <div className="lista-usuarios">
                {cargando ? (
                  <div className="cargando">🔄 Cargando usuarios...</div>
                ) : usuariosFiltrados.length === 0 ? (
                  <div className="sin-resultados">
                    {busqueda || filtroRol ? "No hay usuarios que coincidan" : "No hay más usuarios disponibles"}
                  </div>
                ) : (
                  usuariosFiltrados.map(usuario => (
                    <div
                      key={usuario.id}
                      className="item-usuario"
                      onClick={() => agregarUsuario(usuario)}
                    >
                      <div className="avatar-usuario">
                        {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
                      </div>
                      <div className="info-usuario">
                        <div className="nombre-usuario">
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        <div className="detalle-usuario">
                          {usuario.email} • {usuario.rol}
                        </div>
                      </div>
                      <button type="button" className="btn-agregar">
                        +
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* CONTADOR */}
              <div className="contador-selector">
                <strong>{usuariosSeleccionados.length}</strong> usuario(s) seleccionado(s)
              </div>
            </div>
          )}
        </div>
      )}

      {tipoDestino === "todos" && (
        <div className="info-message">
          <p>📢 La notificación se enviará a <strong>TODOS</strong> los usuarios ({usuarios.length})</p>
        </div>
      )}

      <button 
        onClick={generarNotificacion}
        disabled={cargando}
        className="btn-generar"
      >
        {cargando ? "🔄 Enviando..." : `📨 Enviar a ${tipoDestino === 'todos' ? usuarios.length : usuariosSeleccionados.length} usuario(s)`}
      </button>
    </div>
  );
}