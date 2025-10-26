import React from "react";

export default function UsuarioTabla({ usuarios, onEditar, onEliminar }) {
  // Función para mapear rol_id a nombre de rol
  const getRolNombre = (rolId) => {
    const rolesMap = {
      1: 'Administrador',
      2: 'Periodista', 
      3: 'Fotógrafo',
      4: 'Editor'
    };
    return rolesMap[rolId] || 'Desconocido';
  };

  const handleEliminarClick = (usuario) => {
    if (!usuario.id) {
      alert("Error: ID de usuario no válido");
      return;
    }
    
    onEliminar(usuario.id);
  };

  return (
    <table className="tabla-usuarios">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Usuario</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.length > 0 ? (
          usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nombre} {usuario.apellido}</td>
              <td>{usuario.usuario}</td>
              <td>{usuario.email}</td>
              <td>{getRolNombre(usuario.rol_id)}</td>
              <td>
                <button onClick={() => onEditar(usuario)}>Editar</button>
                <button
                  className="eliminar"
                  onClick={() => handleEliminarClick(usuario)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6">No hay usuarios</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}