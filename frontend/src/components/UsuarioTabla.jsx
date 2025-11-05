// UsuarioTabla.jsx - Actualizado
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export default function UsuarioTabla({ usuarios, onEditar, onEliminar }) {
  const getRolDisplay = (rolNombre) => {
    const roles = {
      'administrador': 'Administrador',
      'Editor': 'Editor', 
      'Periodista': 'Periodista',
      'Fotografo': 'Fotógrafo'
    };
    return roles[rolNombre] || rolNombre;
  };

  const getEstadoDisplay = (activo) => {
    return activo ? 'Activo' : 'Inactivo';
  };

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario) => (
          <tr key={usuario.id}>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="user-avatar">
                  {usuario.nombre?.[0]}{usuario.apellido?.[0]}
                </div>
                <div>
                  <div className="user-name">
                    {usuario.nombre} {usuario.apellido}
                  </div>
                  <div className="user-email">
                    @{usuario.usuario}
                  </div>
                </div>
              </div>
            </td>
            <td className="user-email">{usuario.email}</td>
            <td>
              <span className="user-role">
                {getRolDisplay(usuario.rol_nombre)}
              </span>
            </td>
            <td>
              <span className={`user-status ${usuario.activo ? 'status-active' : 'status-inactive'}`}>
                {getEstadoDisplay(usuario.activo)}
              </span>
            </td>
            <td className="actions-cell">
              <div className="actions-buttons">
                <button 
                  onClick={() => onEditar(usuario)}
                  className="btn-editar"
                  title="Editar usuario"
                >
                  <Edit2 size={14} />
                  Editar
                </button>
                <button 
                  onClick={() => onEliminar(usuario.id)}
                  className="btn-eliminar"
                  title="Desactivar usuario"
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}