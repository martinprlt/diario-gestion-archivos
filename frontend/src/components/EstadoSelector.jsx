//src/components/EstadoSelector.jsx
import { useState } from 'react';

export default function EstadoSelector({ articulo, onStatusChange }) {
  const [estado, setEstado] = useState(articulo.estado);
  const [comentario, setComentario] = useState('');

  const handleChange = async (e) => {
    const nuevoEstado = e.target.value;
    setEstado(nuevoEstado);

    if (nuevoEstado === 'en_revision') {
      const confirmar = window.confirm(
        '¿Enviar artículo a revisión? No podrás editarlo hasta que el editor lo revise.'
      );
      if (confirmar) {
        await onStatusChange(nuevoEstado);
      } else {
        setEstado(articulo.estado);
      }
    } else {
      await onStatusChange(nuevoEstado);
    }
  };

  return (
    <div className="estado-selector">
      <select
        value={estado}
        onChange={handleChange}
        disabled={articulo.estado === 'publicado' || articulo.estado === 'rechazado'}
      >
        <option value="borrador">Borrador</option>
        <option value="en_revision">Enviar a Revisión</option>
        {articulo.estado === 'rechazado' && (
          <option value="borrador">Volver a Borrador</option>
        )}
      </select>

      {estado === 'en_revision' && (
        <div className="comentario-box">
          <textarea
            placeholder="Comentarios para el editor..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}