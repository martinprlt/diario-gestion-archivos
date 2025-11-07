import React, { useEffect, useState, useContext, useCallback } from "react";
import { Search, Plus, UserPlus } from 'lucide-react';
import "../assets/styles/gestionUsuario.css";
import UsuarioTabla from "../components/UsuarioTabla";
import UsuarioForm from "../components/UsuarioForm";
import { AuthContext } from "../context/AuthContext";
import { apiFetch, apiEndpoints } from "../config/api"; // ✅ Importar configuración de API

export default function GestionUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cargando, setCargando] = useState(true);
  const { token } = useContext(AuthContext);

  const handleGuardar = async (usuarioData) => {
    try {
      const rol_id = await obtenerRolId(usuarioData.rol);
      if (!rol_id) {
        throw new Error('Rol no válido');
      }

      const datosParaBackend = {
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido,
        usuario: usuarioData.usuario,
        email: usuarioData.email,
        telefono: usuarioData.telefono || '',
        rol: rol_id
      };

      if (!usuarioData.id) {
        if (!usuarioData.contraseña) {
          throw new Error('La contraseña es obligatoria para nuevos usuarios');
        }
        datosParaBackend.contraseña = usuarioData.contraseña;
      } else if (usuarioData.contraseña) {
        datosParaBackend.contraseña = usuarioData.contraseña;
      }

      // ✅ Usar apiEndpoints para las URLs
      const url = usuarioData.id 
        ? apiEndpoints.updateUserRole(usuarioData.id).replace('/rol', '') // Ajustar para edición de usuario
        : apiEndpoints.users;

      const method = usuarioData.id ? 'PUT' : 'POST';

      // ✅ Usar apiFetch en lugar de fetch
      const response = await apiFetch(url, {
        method: method,
        body: JSON.stringify(datosParaBackend)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      alert(result.message || 'Usuario guardado correctamente');
      cargarUsuarios();
      setMostrarForm(false);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true);
      
      // ✅ Usar apiFetch y apiEndpoints
      const response = await apiFetch(apiEndpoints.users);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUsuarios(data);
    } catch {
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  }, []); // ✅ token ya está manejado por apiFetch

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const handleBuscar = (e) => {
    setBusqueda(e.target.value);
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.usuario?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleNuevo = () => {
    setUsuarioEditando(null);
    setMostrarForm(true);
  };

  const handleEditar = (usuario) => {
    const usuarioParaForm = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      usuario: usuario.usuario,
      email: usuario.email,
      telefono: usuario.telefono,
      rol: usuario.rol_nombre || "Editor"
    };
    
    setUsuarioEditando(usuarioParaForm);
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (!id) {
      alert("Error: ID de usuario no válido");
      return;
    }

    if (window.confirm("¿Seguro que quieres desactivar este usuario?")) {
      try {
        // ✅ Usar apiFetch y apiEndpoints
        const response = await apiFetch(`${apiEndpoints.users}/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Usuario desactivado correctamente');
          cargarUsuarios();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al desactivar usuario');
        }
      } catch (error) {
        alert(error.message || 'Error al desactivar usuario');
      }
    }
  };

  const obtenerRolId = async (nombreRol) => {
    try {
      // ✅ Usar apiFetch y apiEndpoints
      const response = await apiFetch(apiEndpoints.roles);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status} al obtener roles`);
      }
      
      const roles = await response.json();
      const rol = roles.find(r => r.nombre === nombreRol);
      
      return rol ? rol.id_rol : null;
    } catch {
      return null;
    }
  };

  if (cargando) {
    return (
      <div className="gestion-usuarios-container">
        <div className="loading-container">
          <div className="spin">⟳</div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-usuarios-container">
      <div className="gestion-usuarios-content">
        
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Gestión de Usuarios</h1>
            <p>Administra los usuarios del sistema y sus permisos</p>
          </div>
        </div>

        {/* Panel de búsqueda y acciones */}
        <div className="acciones-panel">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre, email o usuario..."
              value={busqueda}
              onChange={handleBuscar}
              className="search-input"
            />
          </div>
          <button 
            onClick={handleNuevo}
            className="btn-nuevo-usuario"
          >
            <UserPlus size={18} />
            Nuevo Usuario
          </button>
        </div>

        {/* Contenido principal */}
        {usuarios.length === 0 ? (
          <div className="no-results">
            <UserPlus size={48} className="no-results-icon" />
            <p>No hay usuarios registrados en el sistema</p>
            <p>Comienza agregando el primer usuario</p>
          </div>
        ) : (
          <div className="table-section">
            <div className="table-container">
              <UsuarioTabla
                usuarios={usuariosFiltrados}
                onEditar={handleEditar}
                onEliminar={handleEliminar}
              />
            </div>
          </div>
        )}

        {/* Modal del formulario */}
        {mostrarForm && (
          <UsuarioForm
            usuario={usuarioEditando}
            onGuardar={handleGuardar}
            onCancelar={() => setMostrarForm(false)}
          />
        )}

      </div>
    </div>
  );
}