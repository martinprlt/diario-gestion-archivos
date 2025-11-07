import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.js';
import {API_URL } from '../config/api.js';
import '../assets/styles/articulos-revision.css';

function ArticulosEnRevision() {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (token) fetchArticulosEnRevision();
  }, [token]);

  // 🧩 Cargar artículos en revisión / rechazados / aprobados
  const fetchArticulosEnRevision = async () => {
    try {
      const response = await fetch(`${API_URL}/api/articles/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al cargar artículos');
      const data = await response.json();

      const filtrados = data.filter(
        (art) =>
          art.estado === 'en_revision' ||
          art.estado === 'rechazado' ||
          art.estado === 'aprobado'
      );

      setArticulos(filtrados);
    } catch (err) {
      console.error('❌ Error al obtener artículos:', err);
      setError('No se pudieron cargar los artículos');
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Descargar artículo
  const handleDownload = async (id, articulo) => {
    if (!articulo?.ruta_archivo || !articulo?.nombre_archivo) {
      alert('⚠️ Este artículo no tiene archivo asociado');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/articles/download/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al descargar');
      }

      const blob = await response.blob();
      const fileExtension = articulo.nombre_archivo.split('.').pop() || '';
      const mimeTypes = {
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        pdf: 'application/pdf',
        txt: 'text/plain',
      };

      const url = window.URL.createObjectURL(
        new Blob([blob], { type: mimeTypes[fileExtension] || 'application/octet-stream' })
      );

      const link = document.createElement('a');
      link.href = url;
      link.download =
        articulo.nombre_original || `articulo_${id}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      console.error('❌ Error al descargar:', err);
      alert(`❌ ${err.message || 'Error al descargar el archivo'}`);
    }
  };

  // 🧩 Visualizar artículo
  const handleView = async (id, articulo) => {
    if (!articulo?.ruta_archivo) {
      alert('⚠️ Este artículo no tiene archivo asociado');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/articles/view/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al visualizar');
      }

      const blob = await response.blob();
      const fileType = articulo.tipo_archivo || 'application/octet-stream';
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: fileType })
      );

      const viewer = window.open(url, '_blank');
      if (!viewer)
        alert('⚠️ Desbloqueá las ventanas emergentes para visualizar el archivo');
    } catch (err) {
      console.error('❌ Error al visualizar:', err);
      alert(`❌ ${err.message || 'Error al abrir el archivo'}`);
    }
  };

  // 🧩 Reenviar artículo rechazado
  const handleReenviar = async (id, titulo) => {
    try {
      const response = await fetch(`${API_URL}/api/articles/${id}/send-to-review`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // actualizar el estado local
      setArticulos((prev) =>
        prev.map((a) =>
          a.id_articulo === id
            ? { ...a, estado: 'en_revision', fecha_modificacion: new Date().toISOString() }
            : a
        )
      );

      alert(`✅ "${titulo}" reenviado a revisión exitosamente`);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
      console.error('Error al reenviar:', err);
    }
  };

  // 🧩 Helpers
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? 'N/A'
        : date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
    } catch {
      return 'N/A';
    }
  };

  const estadosUI = {
    en_revision: { texto: '🕓 En Revisión', clase: 'estado-revision' },
    rechazado: { texto: '⛔ Rechazado', clase: 'estado-rechazado' },
    aprobado: { texto: '✅ Aprobado', clase: 'estado-aprobado' },
  };

  // 🧩 Render principal
  if (loading) return <div className="loading">Cargando artículos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="articulos-revision-container">
      <div className="revision-header">
        <h1>Estado de mis Artículos</h1>
        <p>Total: {articulos.length} artículos</p>
      </div>

      {articulos.length > 0 ? (
        <div className="tabla-wrapper">
          <table className="revision-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Fecha de envío</th>
                <th>Última modificación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {articulos.map((a) => {
                const estadoUI = estadosUI[a.estado] || {
                  texto: a.estado || 'Desconocido',
                  clase: 'estado-default',
                };

                return (
                  <tr key={a.id_articulo}>
                    <td className="titulo-columna">{a.titulo}</td>
                    <td>{a.categoria_nombre || 'Sin categoría'}</td>
                    <td>
                      <span className={`estado-badge ${estadoUI.clase}`}>
                        {estadoUI.texto}
                      </span>
                    </td>
                    <td>{formatDate(a.fecha_creacion)}</td>
                    <td>{formatDate(a.fecha_modificacion)}</td>
                    <td className="acciones">
                      <button
                        onClick={() => handleDownload(a.id_articulo, a)}
                        className="btn-accion descargar"
                      >
                        📥 Descargar
                      </button>
                      <button
                        onClick={() => handleView(a.id_articulo, a)}
                        className="btn-accion leer"
                      >
                        👁️ Leer
                      </button>

                      {a.estado === 'rechazado' && (
                        <button
                          onClick={() => handleReenviar(a.id_articulo, a.titulo)}
                          className="btn-reenviar"
                        >
                          🔄 Reenviar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-articulos">
          <p>No tienes artículos enviados actualmente.</p>
          <p>Todos tus artículos aparecerán aquí.</p>
        </div>
      )}
    </div>
  );
}

export default ArticulosEnRevision;
