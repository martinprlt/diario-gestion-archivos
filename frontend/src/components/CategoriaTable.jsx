import React from 'react';

export default function CategoriaTable({ categorias, onDelete }) {
  return (
    <table className="categoria-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {categorias.length > 0 ? (
          categorias.map((cat) => (
            <tr key={cat.id_categoria}>
              <td>{cat.nombre}</td>
              <td>{cat.descripcion}</td>
              <td>
                <button onClick={() => onDelete(cat.id_categoria)}>Eliminar</button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3">No hay categorías</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}