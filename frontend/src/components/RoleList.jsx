import React from 'react';

export default function RoleList({ roles }) {
  return (
    <div className="role-list">
      <h3>Roles Existentes</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r, index) => (
            <tr key={index}>
              <td>{r.nombre}</td>
              <td>{r.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
