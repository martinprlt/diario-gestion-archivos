import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Shield } from 'lucide-react'; // Importar íconos
import '../assets/styles/gestionRoles.css';

export default function GestionRoles() {
  const [roles, setRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar roles
      const rolesRes = await fetch('http://localhost:5000/api/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!rolesRes.ok) throw new Error('Error al cargar roles');
      const rolesData = await rolesRes.json();
      setRoles(rolesData);

      // Cargar usuarios
      const usuariosRes = await fetch('http://localhost:5000/api/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!usuariosRes.ok) throw new Error('Error al cargar usuarios');
      const usuariosData = await usuariosRes.json();
      setUsuarios(usuariosData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 FUNCIÓN PARA REASIGNAR ROL
  const reasignarRol = async (usuarioId, nuevoRolId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/${usuarioId}/rol`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rol_id: nuevoRolId })
      });

      if (!response.ok) throw new Error('Error al actualizar rol');
      
      alert('✅ Rol actualizado correctamente');
      cargarDatos(); // Recargar datos
    } catch (error) {
      alert('❌ Error al actualizar rol: ' + error.message);
    }
  };

  if (loading) return (
    <div className="gestion-roles-container">
      <div className="loading-container">
        <div className="spin">⟳</div>
        <p>Cargando datos...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="gestion-roles-container">
      <div className="error-message">{error}</div>
    </div>
  );

  return (
    <div className="gestion-roles-container">
      <div className="gestion-roles-content">
        
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Gestión de Roles del Sistema</h1>
            <p>Administra y asigna roles a los usuarios del sistema</p>
          </div>
        </div>

        {/* 🔹 ESTADÍSTICAS */}
        <div className="stats-grid">
          {roles.map(rol => {
            const cantidad = usuarios.filter(u => u.rol_id === rol.id_rol).length;
            const totalUsuarios = usuarios.length;
            const porcentaje = totalUsuarios > 0 ? (cantidad / totalUsuarios) * 100 : 0;
            
            return (
              <div key={rol.id_rol} className="stat-card">
                <div className="stat-header">
                  <h3 className="stat-title">{rol.nombre}</h3>
                  <Users className="stat-icon" size={24} />
                </div>
                <p className="stat-value">{cantidad}</p>
                <p className="stat-description">usuarios asignados</p>
                <div className="stat-meta">
                  <span>{porcentaje.toFixed(1)}% del total</span>
                </div>
              </div>
            );
          })}
          {/* Estadística total */}
          <div className="stat-card">
            <div className="stat-header">
              <h3 className="stat-title">Total Usuarios</h3>
              <Users className="stat-icon" size={24} />
            </div>
            <p className="stat-value">{usuarios.length}</p>
            <p className="stat-description">usuarios registrados</p>
          </div>
        </div>

        {/* 🔹 RESUMEN DE ROLES EXISTENTES */}
        <div className="roles-resumen">
          <div className="section-header">
            <Shield size={20} />
            <h2>Roles Disponibles</h2>
          </div>
          <div className="roles-grid">
            {roles.map(rol => {
              const cantidadUsuarios = usuarios.filter(u => u.rol_id === rol.id_rol).length;
              const getIcon = (nombre) => {
                switch(nombre) {
                  case 'administrador': return '👑';
                  case 'Editor': return '📝';
                  case 'Periodista': return '✍️';
                  case 'Fotografo': return '📸';
                  default: return '👤';
                }
              };

              const getDescripcion = (nombre) => {
                switch(nombre) {
                  case 'administrador': return 'Responsable de la gestión general del sistema, asignación de roles, control de usuarios y mantenimiento de la plataforma.';
                  case 'Editor': return 'Encargado de revisar, corregir y aprobar los contenidos antes de su publicación en el sistema.';
                  case 'Periodista': return 'Se dedica a la redacción y publicación de noticias, artículos e informes periodísticos dentro del sistema.';
                  case 'Fotografo': return 'Responsable de capturar, subir y administrar las imágenes utilizadas en las publicaciones y galerías del medio.';
                  default: return rol.descripcion || 'Descripción no disponible';
                }
              };

              return (
                <div key={rol.id_rol} className={`rol-card ${rol.nombre.toLowerCase()}`}>
                  <h3>
                    {getIcon(rol.nombre)} {rol.nombre}
                  </h3>
                  <p>{getDescripcion(rol.nombre)}</p>
                  <small>{cantidadUsuarios} usuarios asignados</small>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🔹 REASIGNACIÓN DE ROLES */}
        <div className="reasignacion-roles">
          <div className="section-header">
            <Users size={20} />
            <h2>Reasignar Roles a Usuarios</h2>
          </div>
          
          {usuarios.length === 0 ? (
            <div className="no-results">
              <p>No hay usuarios para mostrar</p>
            </div>
          ) : (
            <div className="usuarios-table-container">
              <table className="usuarios-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol Actual</th>
                    <th>Nuevo Rol</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(usuario => (
                    <UsuarioFila 
                      key={usuario.id} 
                      usuario={usuario} 
                      roles={roles} 
                      onReasignar={reasignarRol}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function UsuarioFila({ usuario, roles, onReasignar }) {
  const [nuevoRolId, setNuevoRolId] = useState('');

  const handleReasignar = () => {
    if (!nuevoRolId) {
      alert('⚠️ Debes seleccionar un nuevo rol antes de actualizar');
      return;
    }
    if (parseInt(nuevoRolId) === usuario.rol_id) {
      alert('⚠️ El usuario ya tiene ese rol asignado');
      return;
    }
    onReasignar(usuario.id, parseInt(nuevoRolId));
  };


  // ✅ FUNCIÓN MEJORADA para obtener el nombre del rol actual
  const getRolNombre = (usuario) => {
    if (usuario.rol_nombre) return usuario.rol_nombre;        // caso: backend devuelve rol_nombre
    if (usuario.rol?.nombre) return usuario.rol.nombre;        // caso: backend devuelve objeto rol
    const rol = roles.find(r => r.id_rol === usuario.rol_id);  // caso: backend devuelve solo rol_id
    return rol ? rol.nombre : 'Sin rol asignado';
  };

  const getRolClass = (rolId) => {
    const rol = roles.find(r => r.id_rol === rolId);
    return rol ? `rol-${rol.nombre.toLowerCase()}` : '';
  };

  return (
    <tr>
      <td>
        <div className="user-cell">
          <div className="user-avatar">
            {usuario.nombre?.[0]}{usuario.apellido?.[0]}
          </div>
          <div className="user-info">
            <div className="user-name">
              {usuario.nombre} {usuario.apellido}
            </div>
            <div className="user-details">
              ID: {usuario.id}
            </div>
          </div>
        </div>
      </td>
      <td>{usuario.email}</td>
      <td>
        <span className={`badge ${getRolClass(usuario.rol_id)}`}>
          {getRolNombre(usuario.rol_id)}
        </span>
      </td>
      <td>
        <select 
          value={nuevoRolId}
          onChange={(e) => setNuevoRolId(e.target.value)}
          className="rol-select"
        >
          <option value="">Seleccionar nuevo rol</option>
          {roles.map(rol => (
            <option key={rol.id_rol} value={rol.id_rol}>
              {rol.nombre}
            </option>
          ))}
        </select>
      </td>
      <td>
        <button 
          onClick={handleReasignar}
          className="btn-actualizar"
          disabled={!nuevoRolId}
        >
          Actualizar
        </button>
      </td>
    </tr>
  );
}
