import React, { useState } from 'react';

export default function RoleForm({ onAddRole }) {
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nombre && rol) {
      onAddRole({ nombre, rol });
      setNombre('');
      setRol('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="role-form">
      <h3>Agregar Rol</h3>
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Rol"
        value={rol}
        onChange={(e) => setRol(e.target.value)}
      />
      <button type="submit">Cargar</button>
    </form>
  );
}
