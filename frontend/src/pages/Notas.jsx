// src/pages/Notas.jsx - CON COLUMNA DE CATEGORÍA
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import { useCategorias } from '../context/CategoriasContext.jsx';
import '../assets/styles/notas.css';

function Notas() {
  const [notas, setNotas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);
  const { categorias } = useCategorias(); // 👈 USAR CATEGORÍAS
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticulos();
    fetchNotificaciones();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 🔹 Cargar artículos (borradores y rechazados)
  const fetchArticulos = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/articles/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar artículos');

      const data = await response.json();

      // ✅ Filtrar solo borradores y rechazados
      const borradoresYRechazados = data.filter(
        articulo => articulo.estado === 'borrador' || articulo.estado === 'rechazado'
      );
      
      setNotas(borradoresYRechazados);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('No se pudieron cargar los artículos');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar notificaciones
  const fetchNotificaciones = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/articles/user/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data);
      }
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    }
  };

  // 🔹 Obtener nombre de categoría
  const getNombreCategoria = (categoriaId) => {
    if (!categoriaId) return 'Sin categoría';
    
    const categoria = categorias.find(cat => cat.id_categoria === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  // 🔹 Obtener comentario de rechazo
  const getComentarioRechazo = (articuloId, titulo) => {
    const notif = notificaciones.find(n => {
      if (!n.mensaje) return false;
      
      const tieneId = n.mensaje.includes(articuloId.toString());
      const tieneTitulo = n.mensaje.includes(titulo);
      const esRechazo = n.mensaje.includes('rechazado') || 
                        n.mensaje.includes('Rechazado') ||
                        n.titulo.includes('rechazado') ||
                        n.titulo.includes('Rechazado');
      
      return (tieneId || tieneTitulo) && esRechazo;
    });
    
    return notif ? notif.mensaje : null;
  };

  // -------------------- Acciones --------------------
  const handleDownload = async (id, nota) => {
    if (!nota?.ruta_archivo || !nota?.nombre_archivo) {
      alert('⚠️ Este artículo no tiene archivo asociado');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/articles/download/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al descargar');
      const blob = await response.blob();
      const fileExtension = nota.nombre_archivo.split('.').pop() || '';
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = nota.nombre_original || `articulo_${id}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      console.error('❌ Error al descargar:', err);
      alert(`❌ ${err.message}`);
    }
  };

  const handleSendToReview = async (id, titulo) => {
    try {
      const response = await fetch(`http://localhost:5000/api/articles/${id}/send-to-review`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setNotas(prev => prev.filter(item => item.id_articulo !== id));
      alert(`✅ "${titulo}" enviado a revisión exitosamente`);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
      console.error("Error al enviar a revisión:", err);
    }
  };

  const handleDelete = async (id, titulo = "este artículo") => {
    if (!window.confirm(`¿Eliminar "${titulo}" permanentemente?`)) return;
    try {
      const response = await fetch(`http://localhost:5000/api/articles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setNotas(prev => prev.filter(item => item.id_articulo !== id));
      alert(`✅ "${titulo}" fue eliminado correctamente`);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
      console.error("Error al eliminar:", err);
    }
  };

  const handleView = async (id, nota) => {
    if (!nota?.ruta_archivo) {
      alert('⚠️ Este artículo no tiene archivo asociado');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/articles/view/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al visualizar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const viewer = window.open(url, '_blank');
      if (!viewer) alert('⚠️ Desbloquea ventanas emergentes para ver el archivo');
    } catch (err) {
      console.error('❌ Error al visualizar:', err);
      alert(`❌ ${err.message}`);
    }
  };

  const handleModificar = (nota) => {
    navigate('/periodista-upload', { 
      state: { articulo: nota, modo: 'modificacion' } 
    });
  };

  // -------------------- Helpers --------------------
  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'borrador': return 'estado-borrador';
      case 'en_revision': return 'estado-revision';
      case 'aprobado': return 'estado-aprobado';
      case 'rechazado': return 'estado-rechazado';
      default: return 'estado-default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-AR');
    } catch {
      return 'N/A';
    }
  };

  // -------------------- Render --------------------
  if (loading) return <div className="loading">Cargando artículos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="periodista-upload-container">
      <div className="upload-header">
        <h1>Mis artículos</h1>
        <div className="header-actions">
          <button className="btn-nuevo" onClick={() => navigate('/periodista-upload')}>
            + Nuevo Artículo
          </button>
          <button className="btn-ver-revision" onClick={() => navigate('/ArticulosEnRevision')}>
            Ver Artículos en Revisión
          </button>
        </div>
      </div>

      {notas.length > 0 ? (
        <div className="tabla-wrapper">
          <table className="notas-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoría</th> {/* 👈 NUEVA COLUMNA */}
                <th>Estado</th>
                <th>Fecha de creación</th>
                <th>Última modificación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((nota) => {
                const comentarioRechazo = getComentarioRechazo(nota.id_articulo, nota.titulo);
                
                return (
                  <tr key={nota.id_articulo} className={nota.estado === 'rechazado' ? 'fila-rechazada' : ''}>
                    <td>{nota.titulo}</td>
                    <td>
                      <span className="categoria-badge">
                        {getNombreCategoria(nota.categoria_id)}
                      </span>
                    </td>
                    <td>
                      <span className={`estado-badge ${getEstadoBadgeClass(nota.estado)}`}>
                        {nota.estado || 'Borrador'}
                      </span>
                      {nota.estado === 'rechazado' && comentarioRechazo && (
                        <div className="comentario-rechazo">
                          <small>📝 {comentarioRechazo}</small>
                        </div>
                      )}
                      {nota.estado === 'rechazado' && !comentarioRechazo && (
                        <div className="comentario-rechazo">
                          <small>📝 El editor no dejó comentarios específicos</small>
                        </div>
                      )}
                    </td>
                    <td>{formatDate(nota.fecha_creacion)}</td>
                    <td>{formatDate(nota.fecha_modificacion)}</td>
                    <td className="acciones">
                      <button onClick={() => handleDownload(nota.id_articulo, nota)} className="btn-accion">
                        Descargar
                      </button>
                      <button onClick={() => handleView(nota.id_articulo, nota)} className="btn-accion">
                        Leer
                      </button>
                      
                      {/* Botones según estado */}
                      {nota.estado === 'borrador' && (
                        <button 
                          onClick={() => handleSendToReview(nota.id_articulo, nota.titulo)} 
                          className="btn-enviar"
                        >
                          Enviar a revisión
                        </button>
                      )}
                      
                      {nota.estado === 'rechazado' && (
                        <>
                          <button 
                            onClick={() => handleSendToReview(nota.id_articulo, nota.titulo)} 
                            className="btn-enviar"
                          >
                            Reenviar a revisión
                          </button>
                          <button 
                            onClick={() => handleModificar(nota)}
                            className="btn-modificar"
                          >
                            ✏️ Modificar
                          </button>
                        </>
                      )}
                      
                      <button onClick={() => handleDelete(nota.id_articulo, nota.titulo)} className="btn-accion">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-notas">
          <p>No tienes borradores.</p>
          <p>Los artículos que crees aparecerán aquí como borradores.</p>
          <button onClick={() => navigate('/periodista-upload')} className="btn-nuevo">
            ¡Crear mi primer artículo!
          </button>
        </div>
      )}
    </div>
  );
}

export default Notas;