import React, { useState } from 'react';

export default function CategoriaForm({ onAdd }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onAdd({ nombre, descripcion });
    setNombre('');
    setDescripcion('');
  };

  return (
    <form onSubmit={handleSubmit} className="categoria-form">
      <input
        type="text"
        placeholder="Nombre de la categoría"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <textarea
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <button type="submit">Cargar Categoría</button>
    </form>
  );
}
